import React from 'react';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { MenuItem } from '../data/menuData';

interface MenuItemCardProps {
  item: MenuItem;
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem, e: React.MouseEvent) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onOpenDetails,
  onQuickAdd
}) => {
  const isComingSoon = !item.isAvailable || (!item.price && (!item.options || item.options.length === 0));

  // Determine display price string
  let priceDisplay = '';
  if (isComingSoon) {
    priceDisplay = 'قريباً';
  } else if (item.price) {
    priceDisplay = `${item.price} ج`;
  } else if (item.options && item.options.length > 0) {
    const minPrice = Math.min(...item.options.map((o) => o.price));
    priceDisplay = `من ${minPrice} ج`;
  }

  return (
    <div
      onClick={() => !isComingSoon && onOpenDetails(item)}
      className={`group relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between border ${
        isComingSoon
          ? 'bg-stone-900/40 border-stone-800/50 opacity-75 cursor-not-allowed'
          : 'bg-[#151517] hover:bg-[#1A1A1D] border-stone-800/80 hover:border-[#9B1B42]/60 hover:shadow-xl hover:shadow-[#9B1B42]/15 cursor-pointer'
      }`}
    >
      <div>
        {/* Top Badges & Tags */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {item.badges && item.badges.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {item.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#6B0A25]/80 text-pink-200 border border-pink-500/30"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}

          {isComingSoon && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              قريباً
            </span>
          )}
        </div>

        {/* Item Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
          {item.name}
        </h3>

        {/* Description / Ingredients */}
        <p className="text-xs sm:text-sm text-stone-400 mt-1.5 leading-relaxed line-clamp-3">
          {item.description}
        </p>
      </div>

      {/* Bottom Row: Price & Action */}
      <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-500">السعر</span>
          <span
            className={`font-mono text-base sm:text-lg font-extrabold ${
              isComingSoon ? 'text-stone-400 text-sm font-sans' : 'text-[#F5A623]'
            }`}
          >
            {priceDisplay}
          </span>
        </div>

        {isComingSoon ? (
          <button
            disabled
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 text-stone-500 cursor-not-allowed"
          >
            غير متوفر حالياً
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(item, e);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#800E2B] to-[#9B1B42] hover:from-[#9B1B42] hover:to-[#B82550] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#9B1B42]/30 active:scale-95 transition-all border border-pink-500/20 group/btn"
          >
            <Plus className="w-4 h-4 text-amber-300 group-hover/btn:rotate-90 transition-transform" />
            <span>أضف</span>
          </button>
        )}
      </div>
    </div>
  );
};
