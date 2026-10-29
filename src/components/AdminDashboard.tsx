import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  Phone,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Bike,
  Store,
  Sliders,
  AlertCircle
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { getCairoDateString } from '../services/orderService';
import { RESTAURANT_INFO } from '../data/menuData';

interface AdminDashboardProps {
  onBackToMenu: () => void;
  deliveryFee: number;
  onUpdateDeliveryFee: (newFee: number) => void;
}

interface OrderRecord {
  id: string;
  orderNumber: number;
  dateString: string;
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
  subtotal: number;
  totalAmount: number;
  status: 'new' | 'preparing' | 'completed' | 'cancelled';
  createdAt?: any;
}

const AUTHORIZED_ADMIN_EMAIL = 'mrwanalhm38@gmail.com';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToMenu,
  deliveryFee,
  onUpdateDeliveryFee
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [editingFee, setEditingFee] = useState<number>(deliveryFee);
  const [feeSavedMessage, setFeeSavedMessage] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const todayCairo = getCairoDateString();

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Today's Orders from Firestore
  useEffect(() => {
    if (!currentUser) return;

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('dateString', '==', todayCairo));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: OrderRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          // Sort by orderNumber descending (newest on top)
          list.sort((a, b) => (b.orderNumber || 0) - (a.orderNumber || 0));
          setOrders(list);
        },
        (error) => {
          console.error('Snapshot error for orders:', error);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, [currentUser, todayCairo]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setAuthError(error.message || 'فشل تسجيل الدخول عبر جوجل');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderRecord['status']) => {
    setIsUpdatingStatus(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleSaveDeliveryFee = () => {
    onUpdateDeliveryFee(editingFee);
    setFeeSavedMessage(true);
    setTimeout(() => setFeeSavedMessage(false), 3000);
  };

  // KPIs
  const totalOrdersCount = orders.length;
  const totalSalesAmount = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'all') return true;
    return o.status === selectedFilter;
  });

  // Render Login view if not signed in
  if (!authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-[#151518] border border-stone-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#9B1B42]/20 border border-[#9B1B42] text-[#9B1B42] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">لوحة إدارة مطعم A1</h2>
          <p className="text-xs text-stone-400 mb-6">
            تسجيل الدخول مخصص لإدارة المطعم ومتابعة الطلبات اليومية
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-white hover:bg-stone-100 text-stone-900 shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>تسجيل الدخول بحساب Google المعتمد</span>
          </button>

          <p className="text-[11px] text-stone-500 mt-4">
            البريد المعتمد للمدير: {AUTHORIZED_ADMIN_EMAIL}
          </p>

          <button
            onClick={onBackToMenu}
            className="mt-6 text-xs text-amber-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
          >
            <span>العودة للمنيو</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white text-right pb-16">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-[#161619]/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-white bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>عرض المنيو للزبائن</span>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>إدارة طلبات A1</span>
              <span className="text-[10px] bg-[#9B1B42] text-white px-2 py-0.5 rounded font-mono">
                {todayCairo}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-left text-xs">
            <p className="text-stone-300 font-medium">{currentUser?.displayName || 'مدير المطعم'}</p>
            <p className="text-stone-500 text-[11px]">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-red-400 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Orders */}
          <div className="bg-[#151518] border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>أوردرات اليوم</span>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {totalOrdersCount}
            </div>
            <span className="text-[11px] text-stone-500 mt-1">يبدأ الترقيم من #1 يومياً</span>
          </div>

          {/* Card 2: Total Sales */}
          <div className="bg-[#151518] border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>مبيعات اليوم</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">
              {totalSalesAmount} <span className="text-xs text-stone-300 font-sans">جنيه</span>
            </div>
            <span className="text-[11px] text-emerald-400 mt-1">الطلبات المؤكدة والنشطة</span>
          </div>

          {/* Card 3: New Orders */}
          <div className="bg-[#151518] border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>طلبات جديدة</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-blue-400 mt-2">
              {newOrdersCount}
            </div>
            <span className="text-[11px] text-stone-500 mt-1">تحتاج تحضير أو تواصل</span>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-[#151518] border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>تم تجهيزها/توصيلها</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
              {completedCount}
            </div>
            <span className="text-[11px] text-stone-500 mt-1">
              {preparingCount > 0 ? `${preparingCount} قيد التحضير حالياً` : 'لا توجد طلبات معلقة'}
            </span>
          </div>
        </div>

        {/* Quick Settings: Delivery Fee adjustment */}
        <div className="bg-[#151518] border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#9B1B42]/20 text-[#E5809D]">
              <Sliders className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">إعداد رسوم التوصيل (الدليفري)</h3>
              <p className="text-xs text-stone-400">
                القيمة المضافة تلقائياً لإجمالي أوردرات الدليفري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5">
              <input
                type="number"
                min="0"
                step="5"
                value={editingFee}
                onChange={(e) => setEditingFee(Number(e.target.value) || 0)}
                className="w-16 bg-transparent text-center font-mono font-bold text-amber-400 focus:outline-none text-base"
              />
              <span className="text-xs text-stone-400 font-bold">جنيه</span>
            </div>

            <button
              onClick={handleSaveDeliveryFee}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#800E2B] to-[#9B1B42] hover:from-[#9B1B42] hover:to-[#B82550] text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              حفظ الرسوم
            </button>

            {feeSavedMessage && (
              <span className="text-xs text-emerald-400 animate-fadeIn">تم الحفظ بنجاح!</span>
            )}
          </div>
        </div>

        {/* Order Filters & Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'الكل', count: totalOrdersCount },
            { id: 'new', label: 'جديد 🔔', count: newOrdersCount },
            { id: 'preparing', label: 'قيد التحضير 🍳', count: preparingCount },
            { id: 'completed', label: 'تم الاستلام/التوصيل ✅', count: completedCount },
            { id: 'cancelled', label: 'ملغي ❌', count: orders.filter((o) => o.status === 'cancelled').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedFilter === tab.id
                  ? 'bg-gradient-to-r from-[#800E2B] to-[#9B1B42] text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="mr-1.5 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders Feed */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#151518] border border-stone-800 rounded-3xl p-12 text-center text-stone-400">
            <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-semibold">لا توجد طلبات مسجلة في هذا القسم اليوم</p>
            <p className="text-xs text-stone-500 mt-1">عندما يطلب أي عميل عبر المنيو ستظهر هنا فوراً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => {
              const isDelivery = order.orderType === 'delivery';

              return (
                <div
                  key={order.id}
                  className="bg-[#151518] border border-stone-800 hover:border-[#9B1B42]/50 rounded-2xl p-5 space-y-4 shadow-lg transition-all"
                >
                  {/* Top: Order Number & Type & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-300 flex items-center gap-1 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                        {isDelivery ? (
                          <>
                            <Bike className="w-3.5 h-3.5 text-blue-400" />
                            <span>دليفري</span>
                          </>
                        ) : (
                          <>
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                            <span>استلام مطعم</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Status Pill Badge */}
                    <div>
                      {order.status === 'new' && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse">
                          جديد
                        </span>
                      )}
                      {order.status === 'preparing' && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          قيد التحضير
                        </span>
                      )}
                      {order.status === 'completed' && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          تم التجهيز
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                          ملغي
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{order.customerName}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center gap-1 text-amber-400 hover:text-white bg-stone-900 border border-stone-800 px-2 py-1 rounded-lg font-mono text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>

                        <a
                          href={`https://wa.me/2${order.customerPhone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#25D366] hover:text-white bg-[#25D366]/10 border border-[#25D366]/20 px-2 py-1 rounded-lg text-[11px]"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>واتساب</span>
                        </a>
                      </div>
                    </div>

                    {isDelivery && order.deliveryAddress && (
                      <p className="text-stone-300 text-xs">
                        <span className="text-stone-500">العنوان: </span>
                        {order.deliveryAddress}
                        {order.landmark && ` (علامة: ${order.landmark})`}
                      </p>
                    )}

                    {order.orderNotes && (
                      <p className="text-amber-300 text-[11px] italic bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                        ملاحظات: {order.orderNotes}
                      </p>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="bg-stone-900/70 rounded-xl p-3 border border-stone-800 space-y-2 text-xs">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 border-b border-stone-800/60 pb-1.5 last:border-none last:pb-0">
                        <div>
                          <div className="font-semibold text-white">
                            {it.quantity}× {it.name} {it.optionName && `(${it.optionName})`}
                          </div>
                          {it.includedSauces && it.includedSauces.length > 0 && (
                            <div className="text-[10px] text-amber-400">
                              صوصات: {it.includedSauces.join(', ')}
                            </div>
                          )}
                          {it.notes && (
                            <div className="text-[10px] text-stone-400 italic">
                              {it.notes}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-stone-300 shrink-0 font-bold">
                          {it.totalPrice} ج
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financials & Status Changer */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-stone-500">الإجمالي: </span>
                      <span className="font-mono text-amber-400 font-extrabold text-base">
                        {order.totalAmount} جنيه
                      </span>
                      {isDelivery && order.deliveryFee > 0 && (
                        <span className="text-stone-500 text-[10px] mr-1.5">
                          (شامل {order.deliveryFee} ج توصيل)
                        </span>
                      )}
                    </div>

                    {/* Change Status Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={isUpdatingStatus === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          order.status === 'preparing'
                            ? 'bg-amber-500 text-stone-950 font-extrabold'
                            : 'bg-stone-900 text-stone-400 hover:text-amber-400 border border-stone-800'
                        }`}
                      >
                        تحضير
                      </button>

                      <button
                        disabled={isUpdatingStatus === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          order.status === 'completed'
                            ? 'bg-emerald-500 text-stone-950 font-extrabold'
                            : 'bg-stone-900 text-stone-400 hover:text-emerald-400 border border-stone-800'
                        }`}
                      >
                        تم التجهيز
                      </button>

                      <button
                        disabled={isUpdatingStatus === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          order.status === 'cancelled'
                            ? 'bg-red-500 text-white font-extrabold'
                            : 'bg-stone-900 text-stone-500 hover:text-red-400 border border-stone-800'
                        }`}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
