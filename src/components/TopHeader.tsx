import React from 'react';
import { ShoppingBag, Phone, ShieldCheck } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface TopHeaderProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
  onGoHome
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#070708]/95 backdrop-blur-md border-b border-[#220B13] px-3 sm:px-6 py-2.5 transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left/Right Brand Lockup */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-right hover:opacity-90 transition-opacity focus:outline-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#9B1B42] bg-[#0A0A0C] p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <img
              src={RESTAURANT_INFO.logoUrl}
              alt="A1 Burger Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="flex flex-col text-right">
            <span className="font-script text-xl sm:text-2xl text-amber-400 font-bold leading-none">
              A1 Fried Chicken
            </span>
            <span className="text-[10px] sm:text-xs text-[#E5809D] font-medium tracking-tight mt-0.5">
              Best Fried Chicken · أجمد كريسبي
            </span>
          </div>
        </button>

        {/* Center/Actions: Call, Admin & Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Call */}
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            title="اتصال مباشر بالمطعم"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 text-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono">01055450417</span>
          </a>

          {/* Admin Toggle */}
          <button
            onClick={onOpenAdmin}
            title="لوحة الإدارة"
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-400 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#800E2B] to-[#9B1B42] hover:from-[#9B1B42] hover:to-[#B82550] text-white shadow-md shadow-[#9B1B42]/30 active:scale-95 transition-all border border-pink-500/20"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <div className="flex items-center gap-1 text-xs sm:text-sm font-bold">
              <span>السلة</span>
              {cartCount > 0 && (
                <>
                  <span className="text-pink-200">·</span>
                  <span className="text-amber-300 font-mono">{cartTotal} ج</span>
                </>
              )}
            </div>

            {cartCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#F5A623] text-black font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
