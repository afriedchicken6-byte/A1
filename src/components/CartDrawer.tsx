import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Bike,
  Store,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CartItem } from '../data/menuData';
import { submitOrderWithDailyCounter, buildWhatsAppMessage, getWhatsAppUrl } from '../services/orderService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  deliveryFee: number;
  onOrderSuccess: (orderData: {
    orderNumber: number;
    customerName: string;
    totalAmount: number;
    orderType: 'takeaway' | 'delivery';
    whatsappUrl: string;
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryFee,
  onOrderSuccess
}) => {
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const currentDeliveryFee = orderType === 'delivery' ? deliveryFee : 0;
  const totalAmount = subtotal + currentDeliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (cartItems.length === 0) {
      setValidationError('السلة فارغة، يرجى اختيار وجباتك أولاً.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setValidationError('يرجى كتابة اسم العميل بشكل صحيح.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setValidationError('يرجى كتابة رقم موبايل مصري صحيح للتواصل (مثال: 01012345678).');
      return;
    }

    if (orderType === 'delivery' && (!deliveryAddress.trim() || deliveryAddress.trim().length < 5)) {
      setValidationError('يرجى إدخال العنوان بالتفصيل لضمان سرعة التوصيل.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit to atomic Firestore daily counter
      const result = await submitOrderWithDailyCounter({
        orderType,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: deliveryAddress.trim(),
        landmark: landmark.trim(),
        orderNotes: orderNotes.trim(),
        items: cartItems.map((ci) => ({
          name: ci.name,
          optionName: ci.selectedOptionName,
          unitPrice: ci.unitPrice,
          quantity: ci.quantity,
          totalPrice: ci.totalPrice,
          notes: ci.notes,
          includedSauces: ci.includedSauces
        })),
        deliveryFee: currentDeliveryFee,
        subtotal,
        totalAmount
      });

      // 2. Build structured WhatsApp message
      const whatsappMessage = buildWhatsAppMessage({
        orderNumber: result.orderNumber,
        orderType,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: deliveryAddress.trim(),
        landmark: landmark.trim(),
        orderNotes: orderNotes.trim(),
        items: cartItems.map((ci) => ({
          name: ci.name,
          optionName: ci.selectedOptionName,
          unitPrice: ci.unitPrice,
          quantity: ci.quantity,
          totalPrice: ci.totalPrice,
          notes: ci.notes,
          includedSauces: ci.includedSauces
        })),
        deliveryFee: currentDeliveryFee,
        totalAmount
      });

      const whatsappUrl = getWhatsAppUrl(whatsappMessage);

      // 3. Clear cart and notify success
      onClearCart();
      onClose();

      // Open whatsapp
      window.open(whatsappUrl, '_blank');

      onOrderSuccess({
        orderNumber: result.orderNumber,
        customerName: customerName.trim(),
        totalAmount,
        orderType,
        whatsappUrl
      });
    } catch (err) {
      console.error('Error submitting order:', err);
      setValidationError('حدث خطأ أثناء تسجيل الأوردر، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Cart Drawer Panel */}
      <div className="relative z-10 w-full sm:max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] bg-[#141416] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-[#161619]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">سلة الطلبات</h2>
            <span className="text-xs font-mono text-stone-400">({cartItems.length} صنف)</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
          {/* Order Type Toggle (تيك أواي / دليفري) */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-2">
              طريقة استلام الطلب:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-900/90 rounded-2xl border border-stone-800">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all ${
                  orderType === 'delivery'
                    ? 'bg-gradient-to-r from-[#800E2B] to-[#9B1B42] text-white shadow-md shadow-[#9B1B42]/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-300" />
                <span>دليفري (توصيل)</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all ${
                  orderType === 'takeaway'
                    ? 'bg-gradient-to-r from-[#800E2B] to-[#9B1B42] text-white shadow-md shadow-[#9B1B42]/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Store className="w-4 h-4 text-amber-300" />
                <span>استلام من المطعم</span>
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-stone-400 flex flex-col items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-stone-600 mb-3 stroke-1" />
              <p className="text-sm font-medium">سلتك لا تحتوي على أي أصناف بعد</p>
              <p className="text-xs text-stone-500 mt-1">تصفح المنيو واختر وجبتك المقرمشة المفضلة!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>الأصناف المختارة</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-stone-500 hover:text-red-400 transition-colors"
                >
                  إفراغ السلة
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-stone-900/60 border border-stone-800 rounded-xl p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      <span>{item.name}</span>
                      {item.selectedOptionName && (
                        <span className="text-[11px] text-pink-300 bg-[#6B0A25] px-1.5 py-0.5 rounded">
                          {item.selectedOptionName}
                        </span>
                      )}
                    </div>

                    {item.includedSauces && item.includedSauces.length > 0 && (
                      <div className="text-[11px] text-amber-400/90 mt-0.5">
                        الصوصات: {item.includedSauces.join(' · ')}
                      </div>
                    )}

                    {item.notes && (
                      <div className="text-[11px] text-stone-400 mt-0.5 italic">
                        ملاحظة: {item.notes}
                      </div>
                    )}

                    <div className="font-mono text-amber-400 font-extrabold text-xs mt-1.5">
                      {item.totalPrice} ج ({item.unitPrice} ج × {item.quantity})
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-stone-500 hover:text-red-400 p-1 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 bg-stone-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 rounded bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 rounded bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Details Form */}
          {cartItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-800">
              <h3 className="text-xs font-bold text-stone-300">بيانات العميل والتوصيل</h3>

              <div>
                <label className="block text-xs text-stone-400 mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد مصطفى"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 text-xs sm:text-sm focus:outline-none focus:border-[#9B1B42]"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">رقم الموبايل *</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 text-xs sm:text-sm text-right focus:outline-none focus:border-[#9B1B42]"
                />
              </div>

              {orderType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">العنوان بالتفصيل *</label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="اسم الشارع، رقم العمارة، رقم الدور والشقة..."
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 text-xs sm:text-sm focus:outline-none focus:border-[#9B1B42]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-400 mb-1">علامة مميزة (اختياري)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="بجوار صيدلية، أمام المسجد..."
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 text-xs sm:text-sm focus:outline-none focus:border-[#9B1B42]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-stone-400 mb-1">ملاحظات عامة للأوردر</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="أي طلب إضافي خاص بالتحضير..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 text-xs sm:text-sm focus:outline-none focus:border-[#9B1B42]"
                />
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Financial Breakdown */}
          {cartItems.length > 0 && (
            <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-400">
                <span>المجموع الفرعي:</span>
                <span className="font-mono font-bold text-stone-200">{subtotal} ج</span>
              </div>

              {orderType === 'delivery' && (
                <div className="flex items-center justify-between text-stone-400">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono font-bold text-stone-200">{deliveryFee} ج</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-sm font-bold text-white">
                <span>الإجمالي النهائي:</span>
                <span className="font-mono text-amber-400 text-base font-extrabold">
                  {totalAmount} جنيه
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Submit Button */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-stone-800 bg-[#121214]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitOrder}
              className="w-full py-4 px-6 rounded-xl font-bold text-base bg-gradient-to-r from-[#25D366] via-[#1EBE5D] to-[#128C7E] hover:from-[#1EBE5D] hover:to-[#25D366] text-white shadow-xl shadow-[#25D366]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل الطلب وتنسيق الواتساب...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>إرسال الطلب على واتساب</span>
                  <span className="font-mono text-stone-950 font-black bg-white/80 px-2 py-0.5 rounded text-xs">
                    {totalAmount} ج
                  </span>
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-500 text-center mt-2">
              سيتم تسجيل أوردرك وحجز رقمه التسلسلي اليومي تلقائيًا ثم فتح محادثة الواتساب
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
