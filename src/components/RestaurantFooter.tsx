import React from 'react';
import { Phone, ExternalLink, MapPin, Clock, ShieldCheck, Heart, MessageCircle, Code2 } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface RestaurantFooterProps {
  onOpenAdmin: () => void;
}

export const RestaurantFooter: React.FC<RestaurantFooterProps> = ({ onOpenAdmin }) => {
  const developerWhatsappUrl =
    'https://wa.me/201159615794?text=' +
    encodeURIComponent('مرحبا مروان، تواصلت معك بخصوص تطوير موقع أو منيو إلكتروني');

  return (
    <footer className="w-full bg-[#070708] border-t border-stone-900 text-stone-400 py-10 px-4 sm:px-8 text-right mt-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Brand & Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#9B1B42] bg-[#0A0A0C] p-0.5 shadow-md flex items-center justify-center">
                <img
                  src={RESTAURANT_INFO.logoUrl}
                  alt={RESTAURANT_INFO.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                />
              </div>
              <div>
                <span className="font-script text-2xl text-amber-400 font-bold block leading-none">
                  A1 Fried Chicken
                </span>
                <span className="text-xs text-[#E5809D] font-medium tracking-wide">
                  Best Fried Chicken · أجمد كريسبي في مصر
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              أجمد كريسبي في مصر، وطعمه ميتنسيش! نستخدم أفضل قطع الدجاج الطازجة المتبلة بخلطة A1 الحصرية المقرمشة.
            </p>
          </div>

          {/* Col 2: Contact & Address */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold text-white text-sm mb-3">بيانات الفرع والاتصال</h4>

            <div className="flex items-start gap-2 text-stone-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{RESTAURANT_INFO.address}</span>
            </div>

            <div className="flex items-center gap-2 text-stone-300">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`tel:${RESTAURANT_INFO.phone}`} className="hover:text-amber-400 font-mono">
                {RESTAURANT_INFO.phone}
              </a>
            </div>

            <div className="flex items-center gap-2 text-stone-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>متاحين يومياً للطلبات والتوصيل السريع</span>
            </div>
          </div>

          {/* Col 3: Social & Admin Quick link */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm mb-3">تواصل معنا</h4>

            <div className="flex flex-col gap-2">
              <a
                href={RESTAURANT_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors w-fit"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-semibold">صفحتنا على فيسبوك</span>
              </a>

              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-400 transition-colors w-fit"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>لوحة تحكم إدارة المطعم</span>
              </button>
            </div>
          </div>
        </div>

        {/* Developer Credit & WhatsApp Direct Contact */}
        <div className="pt-6 border-t border-stone-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111114] p-4 sm:p-5 rounded-2xl border border-stone-800 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-stone-200 font-bold">
                  تم التطوير بواسطة: <span className="text-amber-400 font-extrabold text-sm sm:text-base">مروان الهم</span>
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  تصميم وتطوير المواقع والمنيو الإلكتروني الذكي
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={developerWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1EBE5D] hover:to-[#25D366] text-white text-xs font-bold transition-all shadow-md shadow-[#25D366]/20 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>رسالة واتساب: 01159615794</span>
              </a>

              <a
                href="tel:01159615794"
                className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors shrink-0"
                title="اتصال هاتفي مباشر"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} مطعم A1 Best Fried Chicken — جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            صُنع بحب لأشهى وأجمد كريسبي في مصر <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
