import React, { useEffect } from 'react';
import { CheckCircle2, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RESTAURANT_INFO } from '../data/menuData';

interface OrderSuccessModalProps {
  orderData: {
    orderNumber: number;
    customerName: string;
    totalAmount: number;
    orderType: 'takeaway' | 'delivery';
    whatsappUrl: string;
  } | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ orderData, onClose }) => {
  useEffect(() => {
    if (orderData) {
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9B1B42', '#F5A623', '#25D366', '#FFFFFF']
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [orderData]);

  if (!orderData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#161619] border border-[#9B1B42]/50 rounded-3xl p-6 text-center shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#9B1B42]/30 blur-2xl pointer-events-none" />

        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-[#9B1B42] to-[#F5A623] p-1 flex items-center justify-center mb-4 shadow-xl">
          <div className="w-full h-full bg-[#161619] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#25D366]" />
          </div>
        </div>

        {/* Order Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>تم تسجيل الطلب بنجاح في النظام</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          أوردرك رقم{' '}
          <span className="font-mono text-amber-400 font-black text-3xl sm:text-4xl">
            #{orderData.orderNumber}
          </span>{' '}
          ✅
        </h2>

        <p className="text-stone-300 text-sm mt-3 leading-relaxed">
          شكرًا لك يا <span className="text-amber-400 font-bold">{orderData.customerName}</span>! تم حفظ طلبك برقم يومي رسمي وسيتم تحضيره في أسرع وقت.
        </p>

        {/* Summary Card */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 my-5 text-right text-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span>نوع الطلب:</span>
            <span className="font-bold text-white">
              {orderData.orderType === 'delivery' ? 'دليفري 🛵' : 'استلام من المطعم 🛍️'}
            </span>
          </div>
          <div className="flex items-center justify-between text-stone-400">
            <span>الإجمالي المطلوب:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {orderData.totalAmount} جنيه
            </span>
          </div>
          <div className="flex items-center justify-between text-stone-400">
            <span>رقم المطعم المعتمد:</span>
            <span className="font-mono text-stone-300">{RESTAURANT_INFO.phone}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <a
            href={orderData.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1EBE5D] hover:to-[#25D366] text-white shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>فتح محادثة الواتساب مرة أخرى</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-stone-400 hover:text-white bg-stone-900 border border-stone-800 hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>العودة لتصفح المنيو</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
