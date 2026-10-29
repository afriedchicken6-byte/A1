import {
  db,
  doc,
  runTransaction,
  serverTimestamp,
  collection,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { CustomerOrder, RESTAURANT_INFO } from '../data/menuData';

/**
 * Gets the current date string in Cairo time zone (Africa/Cairo) YYYY-MM-DD
 */
export function getCairoDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    // Fallback if Intl format fails
    const now = new Date();
    // Cairo is UTC+2 (UTC+3 during DST); shift by the offset in milliseconds
    const cairoDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return cairoDate.toISOString().split('T')[0];
  }
}

/**
 * Normalizes an Egyptian mobile number to local 11-digit form (01XXXXXXXXX).
 * Accepts Arabic-Indic digits, spaces/dashes, and +20 / 0020 / 20 prefixes.
 * Returns null when the result is not a valid Egyptian mobile number.
 */
export function normalizeEgyptPhone(raw: string): string | null {
  const digits = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '');

  let local = digits;
  if (local.startsWith('0020')) local = '0' + local.slice(4);
  else if (local.startsWith('20') && local.length === 12) local = '0' + local.slice(2);

  return /^01[0125]\d{8}$/.test(local) ? local : null;
}

/**
 * Builds a wa.me link for a customer's local Egyptian number (country code 20).
 */
export function getCustomerWhatsAppUrl(localPhone: string): string {
  const normalized = normalizeEgyptPhone(localPhone);
  const intl = normalized ? `20${normalized.slice(1)}` : localPhone.replace(/\D/g, '');
  return `https://wa.me/${intl}`;
}

/**
 * Creates an order with an atomic daily sequential order number (#1, #2, #3...)
 */
export async function submitOrderWithDailyCounter(
  orderInput: Omit<CustomerOrder, 'orderNumber' | 'dateString' | 'createdAt' | 'status'>
): Promise<{ orderId: string; orderNumber: number; dateString: string }> {
  const dateString = getCairoDateString();
  const counterRef = doc(db, 'daily_counters', dateString);
  const newOrderRef = doc(collection(db, 'orders'));
  const orderId = newOrderRef.id;

  try {
    const result = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      let nextNumber = 1;

      if (counterSnap.exists()) {
        const data = counterSnap.data();
        nextNumber = (Number(data.lastOrderNumber) || 0) + 1;
        transaction.update(counterRef, {
          lastOrderNumber: nextNumber,
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.set(counterRef, {
          dateString,
          lastOrderNumber: nextNumber,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      const fullOrder: CustomerOrder = {
        id: orderId,
        orderNumber: nextNumber,
        dateString,
        createdAt: serverTimestamp(),
        orderType: orderInput.orderType,
        customerName: orderInput.customerName.trim(),
        customerPhone: orderInput.customerPhone.trim(),
        deliveryAddress: orderInput.deliveryAddress?.trim() || '',
        landmark: orderInput.landmark?.trim() || '',
        orderNotes: orderInput.orderNotes?.trim() || '',
        items: orderInput.items,
        deliveryFee: orderInput.deliveryFee,
        subtotal: orderInput.subtotal,
        totalAmount: orderInput.totalAmount,
        status: 'new'
      };

      transaction.set(newOrderRef, fullOrder);

      return {
        orderId,
        orderNumber: nextNumber,
        dateString
      };
    });

    return result;
  } catch (error) {
    console.error('Failed in transaction, attempting resilient fallback:', error);
    // In case of network glitch, fallback so customer order isn't lost
    const localDailyKey = `a1_daily_count_${dateString}`;
    const localCount = parseInt(localStorage.getItem(localDailyKey) || '0', 10) + 1;
    localStorage.setItem(localDailyKey, String(localCount));

    return {
      orderId: 'loc_' + Date.now(),
      orderNumber: localCount,
      dateString
    };
  }
}

/**
 * Builds the beautifully formatted WhatsApp message exactly matching the requested format
 */
export function buildWhatsAppMessage(order: {
  orderNumber: number;
  orderType: 'takeaway' | 'delivery';
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  landmark?: string;
  orderNotes?: string;
  items: {
    name: string;
    optionName?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    notes?: string;
    includedSauces?: string[];
  }[];
  deliveryFee: number;
  totalAmount: number;
}): string {
  const isDelivery = order.orderType === 'delivery';
  const typeText = isDelivery ? 'دليفري 🛵' : 'تيك أواي (استلام من المطعم) 🛍️';

  const itemsList = order.items
    .map((item) => {
      const optionDetails = item.optionName ? ` (${item.optionName})` : '';
      const notes = item.notes ? ` [ملاحظات: ${item.notes}]` : '';
      const sauces = item.includedSauces?.length ? ` [الصوصات: ${item.includedSauces.join(' + ')}]` : '';
      return `${item.quantity}× ${item.name}${optionDetails} — ${item.totalPrice} ج${sauces}${notes}`;
    })
    .join('\n');

  let message = `🍗 *طلب جديد من A1*\n`;
  message += `رقم الأوردر: #${order.orderNumber}\n`;
  message += `النوع: ${typeText}\n`;
  message += `الاسم: ${order.customerName}\n`;
  message += `الموبايل: ${order.customerPhone}\n`;

  if (isDelivery) {
    message += `العنوان: ${order.deliveryAddress || 'غير محدد'}\n`;
    if (order.landmark) {
      message += `علامة مميزة: ${order.landmark}\n`;
    }
  }

  message += `----------------\n`;
  message += `${itemsList}\n`;
  message += `----------------\n`;

  if (isDelivery && order.deliveryFee > 0) {
    message += `رسوم التوصيل: ${order.deliveryFee} ج\n`;
  }
  message += `الإجمالي: ${order.totalAmount} جنيه\n`;

  if (order.orderNotes) {
    message += `ملاحظات: ${order.orderNotes}\n`;
  }

  return message;
}

/**
 * Generates the WhatsApp URL to open chat directly with the restaurant
 */
export function getWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encoded}`;
}
