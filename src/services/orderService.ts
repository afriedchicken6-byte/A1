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
    const utcHours = now.getUTCHours() + 2; // Cairo is UTC+2 / UTC+3
    const cairoDate = new Date(now.getTime() + (utcHours * 60 * 60 * 1000));
    return cairoDate.toISOString().split('T')[0];
  }
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
