import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, MessageSquare } from 'lucide-react';
import { MenuItem, ItemSizeOption, CartItem } from '../data/menuData';

interface ProductBottomSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

const AVAILABLE_FREE_SAUCES = [
  'صوص الجبن الشيدر',
  'صوص الرانش المميز',
  'صوص السويت تشيلي',
  'صوص الباربكيو المدخن',
  'صوص الألف جزيرة',
  'صوص بيج تايستي'
];

export const ProductBottomSheet: React.FC<ProductBottomSheetProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [selectedOption, setSelectedOption] = useState<ItemSizeOption | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      if (item.options && item.options.length > 0) {
        const defaultOpt = item.options.find((o) => o.id === item.defaultOptionId) || item.options[0];
        setSelectedOption(defaultOpt);
      } else {
        setSelectedOption(null);
      }
      setQuantity(1);
      setNotes('');
      setSelectedSauces([]);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const unitPrice = selectedOption ? selectedOption.price : (item.price || 0);
  const totalPrice = unitPrice * quantity;

  const handleToggleSauce = (sauceName: string) => {
    const maxAllowed = item.saucesIncluded || 2;
    if (selectedSauces.includes(sauceName)) {
      setSelectedSauces(selectedSauces.filter((s) => s !== sauceName));
    } else {
      if (selectedSauces.length < maxAllowed) {
        setSelectedSauces([...selectedSauces, sauceName]);
      } else {
        // Replace last sauce
        setSelectedSauces([...selectedSauces.slice(1), sauceName]);
      }
    }
  };

  const handleConfirm = () => {
    const cartItemId = `${item.id}_${selectedOption ? selectedOption.id : 'base'}_${notes.trim()}_${selectedSauces.sort().join('-')}`;

    const newCartItem: CartItem = {
      cartItemId,
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      selectedOptionName: selectedOption?.name,
      selectedOptionPrice: selectedOption?.price,
      unitPrice,
      quantity,
      totalPrice,
      notes: notes.trim() || undefined,
      includedSauces: selectedSauces.length > 0 ? selectedSauces : undefined
    };

    onAddToCart(newCartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-[#141416] border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Drag handle affordance for mobile */}
        <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-stone-800">
          <div className="text-right">
            <h2 className="text-lg sm:text-xl font-bold text-white">{item.name}</h2>
            <span className="text-xs text-amber-400 font-medium">تخصيص الوجبة والإضافات</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-5 text-right no-scrollbar">
          {/* Ingredients / Description */}
          <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800/80">
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              {item.description}
            </p>
          </div>

          {/* Options / Sizes (سنجل / دبل أو سادة / شيتوس) */}
          {item.options && item.options.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                اختر الحجم / الإعداد:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {item.options.map((opt) => {
                  const isSelected = selectedOption?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`p-3 rounded-xl border text-right flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-[#6B0A25] border-[#9B1B42] text-white shadow-md shadow-[#9B1B42]/30 ring-1 ring-pink-500'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{opt.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <span className="font-mono text-xs mt-2 text-amber-400 font-extrabold">
                        {opt.price} ج
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Included Free Sauces (e.g. for Kilo Crispy) */}
          {item.saucesIncluded && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">
                  اختر الصوصات المجانية ({selectedSauces.length}/{item.saucesIncluded}):
                </label>
                <span className="text-xs text-amber-400 font-semibold">مشمولة في السعر</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_FREE_SAUCES.map((sauce) => {
                  const isChecked = selectedSauces.includes(sauce);
                  return (
                    <button
                      key={sauce}
                      type="button"
                      onClick={() => handleToggleSauce(sauce)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-right flex items-center justify-between border transition-all ${
                        isChecked
                          ? 'bg-[#9B1B42]/60 border-pink-400 text-white'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>{sauce}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special notes */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-white mb-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>ملاحظات خاصة (اختياري):</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بدون مايونيز، سبايسي زيادة، صوص إضافي على جنب..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-500 text-xs sm:text-sm focus:outline-none focus:border-[#9B1B42] focus:ring-1 focus:ring-[#9B1B42] transition-colors"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-white">الكمية:</span>
            <div className="flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-lg bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-base text-amber-400">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-8 h-8 rounded-lg bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Confirmation Button */}
        <div className="p-4 border-t border-stone-800 bg-[#121214]">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-base bg-gradient-to-r from-[#800E2B] via-[#9B1B42] to-[#6B0A25] hover:from-[#9B1B42] hover:to-[#B82550] text-white shadow-lg shadow-[#9B1B42]/30 active:scale-95 transition-all flex items-center justify-between border border-pink-500/20"
          >
            <span>إضافة إلى السلة</span>
            <span className="font-mono text-amber-300 text-lg font-extrabold">{totalPrice} ج</span>
          </button>
        </div>
      </div>
    </div>
  );
};
