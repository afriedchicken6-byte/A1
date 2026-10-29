import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Phone,
  Flame,
  CheckCircle2,
  ChevronUp
} from 'lucide-react';
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  MenuItem,
  CartItem,
  RESTAURANT_INFO
} from './data/menuData';
import { WelcomeSplash } from './components/WelcomeSplash';
import { TopHeader } from './components/TopHeader';
import { CategoryRibbons } from './components/CategoryRibbons';
import { MenuItemCard } from './components/MenuItemCard';
import { ProductBottomSheet } from './components/ProductBottomSheet';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminDashboard } from './components/AdminDashboard';
import { RestaurantFooter } from './components/RestaurantFooter';
import { db, doc, onSnapshot } from './lib/firebase';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('crispy-meals');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [deliveryFee, setDeliveryFee] = useState<number>(RESTAURANT_INFO.defaultDeliveryFee);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Success modal state
  const [successOrderData, setSuccessOrderData] = useState<{
    orderNumber: number;
    customerName: string;
    totalAmount: number;
    orderType: 'takeaway' | 'delivery';
    whatsappUrl: string;
  } | null>(null);

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('a1_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('a1_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Sync delivery fee from Firestore settings
  useEffect(() => {
    try {
      const settingsRef = doc(db, 'settings', 'restaurant');
      const unsubscribe = onSnapshot(
        settingsRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (typeof data.deliveryFee === 'number') {
              setDeliveryFee(data.deliveryFee);
            }
          }
        },
        (error) => {
          // Keep the default fee if settings can't be read
          console.warn('Settings listener error:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not subscribe to settings:', err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Track scroll for active category & back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Check which section is in view
      const scrollPos = window.scrollY + 120;
      for (const cat of MENU_CATEGORIES) {
        const el = document.getElementById(`section-${cat.id}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Add to cart handler
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.cartItemId === newItem.cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = current.quantity + newItem.quantity;
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          totalPrice: current.unitPrice * newQty
        };
        return updated;
      }
      return [...prev, newItem];
    });

    showToast(`تمت إضافة "${newItem.name}" إلى السلة 🍗`);
  };

  // Quick Add for single-price items
  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    if (item.options && item.options.length > 0) {
      setSelectedItemForModal(item);
      setIsBottomSheetOpen(true);
      return;
    }

    if (!item.price) return;

    const cartItemId = `${item.id}_base`;
    const newCartItem: CartItem = {
      cartItemId,
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice: item.price,
      quantity: 1,
      totalPrice: item.price
    };

    handleAddToCart(newCartItem);
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove single item from cart
  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Filter items by search query
  const filteredItemsByCategory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result: Record<string, MenuItem[]> = {};

    MENU_CATEGORIES.forEach((cat) => {
      const itemsInCat = MENU_ITEMS.filter((item) => {
        if (item.category !== cat.id) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.badges?.some((b) => b.toLowerCase().includes(q))
        );
      });
      result[cat.id] = itemsInCat;
    });

    return result;
  }, [searchQuery]);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const target = document.getElementById(`section-${catId}`);
    if (target) {
      const topOffset = 110;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - topOffset,
        behavior: 'smooth'
      });
    }
  };

  // If user opens Admin Dashboard
  if (showAdmin) {
    return (
      <AdminDashboard
        onBackToMenu={() => setShowAdmin(false)}
        deliveryFee={deliveryFee}
        onUpdateDeliveryFee={(newFee) => setDeliveryFee(newFee)}
      />
    );
  }

  // If user is on Welcome Splash screen
  if (showSplash) {
    return (
      <WelcomeSplash
        onEnterMenu={() => {
          setShowSplash(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setShowAdmin(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-white selection:bg-[#9B1B42] selection:text-white relative">
      {/* Background chicken ambient photo with subtle dark overlay */}
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-center opacity-[0.05] z-0 mix-blend-luminosity"
        style={{ backgroundImage: `url(${RESTAURANT_INFO.heroBgUrl})` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#070708] via-[#09090C] to-[#050506] z-0" />

      {/* Top Header */}
      <TopHeader
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onGoHome={() => setShowSplash(true)}
      />

      {/* Category Sticky Ribbons Bar */}
      <CategoryRibbons
        activeCategory={activeCategory}
        onSelectCategory={scrollToCategory}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Mini Banner & Search Bar */}
        <div className="bg-[#151518]/90 border border-stone-800/80 rounded-3xl p-5 sm:p-7 backdrop-blur-md shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9B1B42]/20 border border-[#9B1B42]/40 text-[#E5809D] text-xs font-semibold mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>الخلطة السرية الأصلية</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                منيو A1 Best Fried Chicken 🍗
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                أجمد كريسبي وفرايد تشيكن في مصر، اطلب وجبتك واستلمها مقرمشة وساخنة عبر واتساب!
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن وجبة، ساندوتش، صوص..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#9B1B42] transition-colors"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  مسح
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Menu Categories & Items List */}
        <div className="space-y-12">
          {MENU_CATEGORIES.map((cat) => {
            const items = filteredItemsByCategory[cat.id] || [];
            if (items.length === 0 && searchQuery) return null;

            return (
              <section key={cat.id} id={`section-${cat.id}`} className="scroll-mt-28">
                {/* Category Ribbon Header */}
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2.5 ribbon-banner px-5 py-2 rounded-xl text-white shadow-lg">
                    <span className="text-xl">{cat.icon}</span>
                    <h2 className="text-base sm:text-lg font-black tracking-wide">
                      {cat.title}
                    </h2>
                  </div>
                  <p className="text-xs text-stone-400 mt-2 mr-1">
                    {cat.subtitle}
                  </p>
                </div>

                {/* Items Grid */}
                {items.length === 0 ? (
                  <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800 text-stone-500 text-xs">
                    لا توجد نتائج بحث في هذا القسم
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onOpenDetails={(it) => {
                          setSelectedItemForModal(it);
                          setIsBottomSheetOpen(true);
                        }}
                        onQuickAdd={handleQuickAdd}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar for Quick Mobile Access */}
      {totalCartCount > 0 && !isCartOpen && (
        <aside
          aria-label="سلة الطلبات العائمة"
          className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-slideUp"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#800E2B] via-[#9B1B42] to-[#6B0A25] text-white shadow-2xl shadow-[#9B1B42]/50 border border-pink-400/30 flex items-center justify-between active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-mono font-bold text-sm">
                {totalCartCount}
              </div>
              <span className="text-sm font-bold">عرض سلة الطلبات</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-300 font-extrabold text-base">
                {totalCartPrice} ج
              </span>
              <span className="text-xs bg-black/40 px-2 py-1 rounded-lg">إتمام الطلب 🛵</span>
            </div>
          </button>
        </aside>
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 left-4 z-30 p-2.5 rounded-full bg-stone-900 border border-stone-700 text-stone-300 hover:text-white shadow-lg active:scale-95 transition-all"
          title="للأعلى"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#9B1B42] text-white text-xs font-bold shadow-2xl border border-pink-400/40 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Product Customization Bottom Sheet */}
      <ProductBottomSheet
        item={selectedItemForModal}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setSelectedItemForModal(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        deliveryFee={deliveryFee}
        onOrderSuccess={(orderData) => {
          setSuccessOrderData(orderData);
        }}
      />

      {/* Order Success Confirmation Modal */}
      <OrderSuccessModal
        orderData={successOrderData}
        onClose={() => setSuccessOrderData(null)}
      />

      {/* Footer */}
      <RestaurantFooter onOpenAdmin={() => setShowAdmin(true)} />
    </div>
  );
}
