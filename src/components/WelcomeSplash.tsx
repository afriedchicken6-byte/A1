import React from 'react';
import { Phone, ExternalLink, UtensilsCrossed, ChevronDown, Sparkles } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface WelcomeSplashProps {
  onEnterMenu: () => void;
  onOpenAdmin: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onEnterMenu, onOpenAdmin }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#070708] text-white">
      {/* Background chicken atmosphere with low opacity and deep dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 scale-105 transition-transform duration-1000 ease-out mix-blend-luminosity"
        style={{ backgroundImage: `url(${RESTAURANT_INFO.heroBgUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070708]/95 via-[#2A0510]/40 to-[#070708]" />

      {/* Top Bar on splash */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <button
          onClick={onOpenAdmin}
          className="text-xs text-stone-400 hover:text-amber-400 px-3 py-1.5 rounded-full border border-stone-800 bg-stone-900/60 backdrop-blur-sm transition-colors"
        >
          لوحة الإدارة 🔐
        </button>
        <span className="text-xs font-semibold tracking-wider text-amber-400/90 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          مفتوح الآن لاستقبال طلباتكم
        </span>
      </div>

      {/* Main hero center */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 text-center max-w-lg mx-auto">
        {/* Logo Container with stylish fedora gentleman frame */}
        <div className="relative group mb-6">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#9B1B42] via-[#F5A623] to-[#6B0A25] rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-[#9B1B42] bg-[#0A0A0C] shadow-2xl p-2 flex items-center justify-center">
            <img
              src={RESTAURANT_INFO.logoUrl}
              alt={RESTAURANT_INFO.name}
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]"
            />
          </div>
        </div>

        {/* Brand Name & Ribbon */}
        <h1 className="font-script text-4xl sm:text-5xl text-amber-400 tracking-wide drop-shadow-md mb-2">
          A1 Fried Chicken
        </h1>

        <div className="inline-block ribbon-banner text-white font-bold text-sm sm:text-base px-6 py-1.5 rounded-md uppercase tracking-wider mb-5 shadow-lg">
          Best Fried Chicken · أجمد كريسبي في مصر
        </div>

        {/* Egyptian Welcoming Greeting */}
        <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-5 mb-8 backdrop-blur-md shadow-xl">
          <p className="text-stone-200 text-base sm:text-lg leading-relaxed font-medium">
            أهلًا بيك في <span className="text-amber-400 font-bold">A1 🍗</span> .. أجمد كريسبي في مصر، وطعمه ميتنسيش!
          </p>
          <p className="text-stone-400 text-sm mt-2 font-normal">
            اختار وجبتك المفضلة وسجل طلبك في ثواني معدودة عبر واتساب برقم أوردر حصري.
          </p>
        </div>

        {/* Big Burgundy CTA Button */}
        <button
          onClick={onEnterMenu}
          className="w-full sm:w-72 py-4 px-8 rounded-xl font-bold text-lg bg-gradient-to-r from-[#800E2B] via-[#9B1B42] to-[#6B0A25] hover:from-[#9B1B42] hover:to-[#800E2B] text-white shadow-xl shadow-[#9B1B42]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-pink-500/20 group"
        >
          <UtensilsCrossed className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>ادخل المنيو الآن</span>
          <ChevronDown className="w-5 h-5 text-stone-300 animate-bounce" />
        </button>
      </div>

      {/* Footer Info & Social Links */}
      <div className="relative z-10 px-6 py-6 border-t border-stone-900/80 bg-black/60 backdrop-blur-md">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="text-center sm:text-right">
            <p className="font-semibold text-stone-300">{RESTAURANT_INFO.address}</p>
            <p className="text-stone-500 text-[11px] mt-0.5">خدمة التوصيل والاستلام متوفرة طوال اليوم</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-amber-400 hover:text-white hover:border-amber-500 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>اتصال بالمطعم</span>
            </a>

            <a
              href={RESTAURANT_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2]/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فيسبوك A1</span>
            </a>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-800/60 text-center text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
          <span>تم التطوير بواسطة:</span>
          <a
            href="https://wa.me/201159615794?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%85%D8%B1%D9%88%D8%A7%D9%86%D8%8C%20%D8%AA%D9%88%D8%A7%D8%B5%D9%84%D8%AA%20%D9%85%D8%B9%D9%83%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%AA%D8%B7%D9%88%D9%8A%D8%B1%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A3%D9%88%20%D9%85%D9%86%D9%8A%D9%88"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-white font-bold transition-colors"
          >
            مروان الهم (01159615794) 💬
          </a>
        </div>
      </div>
    </div>
  );
};
