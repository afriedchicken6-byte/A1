import bgCrispyChicken from '../assets/images/bg_crispy_chicken_1793300412213.jpg';
import showcaseFriedChicken from '../assets/images/showcase_fried_chicken_1793300413323.jpg';
import showcaseGourmetBurger from '../assets/images/showcase_gourmet_burger_1793300413977.jpg';
import showcaseMacCheese from '../assets/images/showcase_mac_cheese_1793300414115.jpg';

export interface ItemSizeOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number; // Base price if single price
  isAvailable: boolean; // if false or price not set, shows "قريبًا"
  options?: ItemSizeOption[];
  defaultOptionId?: string;
  image?: string;
  badges?: string[];
  saucesIncluded?: number; // e.g. for kilo crispy
}

export interface MenuCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  image?: string;
}

export const RESTAURANT_INFO = {
  name: 'A1 Burger & Best Fried Chicken',
  phone: '01055450417',
  whatsappNumber: '201055450417',
  address: 'شارع طه حسين، ميدان قصر الثقافة، أمام فيس تو فيس',
  facebookUrl: 'https://www.facebook.com/share/19otzT6Gyj/',
  defaultDeliveryFee: 20,
  logoUrl: '/assets/aistudio/logo_transparent.png',
  heroBgUrl: bgCrispyChicken,
  friedChickenImg: showcaseFriedChicken,
  burgerImg: showcaseGourmetBurger,
  macCheeseImg: showcaseMacCheese
};

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'crispy-meals',
    title: 'وجبات الكرسبي',
    subtitle: 'قطع كرسبي ذهبية بتتبيلة A1 السرية المقرمشة',
    icon: '🍗',
    image: showcaseFriedChicken
  },
  {
    id: 'chicken-meals',
    title: 'وجبات الدجاج',
    subtitle: 'وجبات مشبعة كاملة مع البطاطس والخبز والكول سلو',
    icon: '🍗',
    image: showcaseFriedChicken
  },
  {
    id: 'burgers-sandwiches',
    title: 'ساندوتشات البرجر والدجاج',
    subtitle: 'ساندوتشات عملاقة بخلطات A1 المبتكرة والجبن السايح',
    icon: '🍔',
    image: showcaseGourmetBurger
  },
  {
    id: 'mac-and-cheese',
    title: 'ماك آند تشيز',
    subtitle: 'مكرونة غارقة في صوص الجبن الغني ولمسات الشيتوس',
    icon: '🧀',
    image: showcaseMacCheese
  },
  {
    id: 'appetizers',
    title: 'المقبلات والإضافات',
    subtitle: 'أطباق جانبية مقرمشة تكمل روعة الوجبة',
    icon: '🍟'
  },
  {
    id: 'sauces',
    title: 'الصوصات',
    subtitle: 'صوصات A1 الأصلية الغنية بالنكهات المتفجرة',
    icon: '🥣'
  }
];

export const MENU_ITEMS: MenuItem[] = [
  // 1) وجبات الكرسبي
  {
    id: 'crispy-quarter',
    name: 'ربع كيلو كرسبي',
    description: 'قطعتان كرسبي ذهبي + بطاطس مقرمشة + قطعتان خبز طازج + سلطة كول سلو',
    category: 'crispy-meals',
    price: 110,
    isAvailable: true,
    badges: ['الأكثر طلباً']
  },
  {
    id: 'crispy-half',
    name: 'نصف كيلو كرسبي',
    description: '5 قطع كرسبي مقرمش + بطاطس عائلية + 4 قطع خبز طازج + 2 سلطة كول سلو',
    category: 'crispy-meals',
    price: 215,
    isAvailable: true,
    badges: ['وجبة مثالية']
  },
  {
    id: 'crispy-kilo',
    name: 'كيلو كرسبي',
    description: '10 قطع كرسبي عملاقة + بطاطس لارج + 8 قطع خبز طازج + 2 كول سلو + 2 صوص مجاناً من اختيارك',
    category: 'crispy-meals',
    price: 395,
    isAvailable: true,
    saucesIncluded: 2,
    badges: ['وليمة الأبطال', 'يشمل 2 صوص']
  },

  // 2) وجبات الدجاج
  {
    id: 'snack-meal',
    name: 'سناك ميل',
    description: 'قطعتان دجاج مقلي مقرمش + بطاطس + خبز طازج + سلطة كول سلو',
    category: 'chicken-meals',
    price: 105,
    isAvailable: true
  },
  {
    id: 'dinner-meal',
    name: 'دينر ميل',
    description: '3 قطع دجاج مقلي ذهبي + بطاطس + 3 قطع خبز + سلطة كول سلو',
    category: 'chicken-meals',
    price: 150,
    isAvailable: true,
    badges: ['الأكثر شهرة']
  },
  {
    id: 'magic-meal',
    name: 'ماجيك ميل',
    description: '5 قطع دجاج مقلي ذهبي + بطاطس + 5 قطع خبز طازج + كول سلو حجم كبير',
    category: 'chicken-meals',
    price: 240,
    isAvailable: true
  },
  {
    id: 'family-meal',
    name: 'فاميلي ميل',
    description: '9 قطع دجاج مقرمش + بطاطس عائلية + 9 قطع خبز طازج + 4 سلطات كول سلو',
    category: 'chicken-meals',
    price: 400,
    isAvailable: true,
    badges: ['عائلي']
  },
  {
    id: 'tawfeer-meal',
    name: 'وجبة التوفير',
    description: '12 قطعة دجاج مقرمش غني + بطاطس عائلية + 9 قطع خبز طازج + لتر بيبسي بارد منعش',
    category: 'chicken-meals',
    price: 550,
    isAvailable: true,
    badges: ['توفير + بيبسي']
  },
  {
    id: 'economy-meal',
    name: 'الوجبة الاقتصادية',
    description: '18 قطعة دجاج مقرمش عائلي + بطاطس لارج + 12 قطعة خبز طازج + 2 سلطة كول سلو كبير',
    category: 'chicken-meals',
    price: 750,
    isAvailable: true,
    badges: ['للعزومات الكبيرة']
  },

  // 3) ساندوتشات البرجر والدجاج
  {
    id: 'golden-sweet',
    name: 'ساندوتش جولدن سويت',
    description: 'خس طازج، خيار مخلل، صدور دجاج متبلة بخلطة A1، إصبعان موزاريلا، صوص سويت تشيلي مميز، صوص شيدر سايح',
    category: 'burgers-sandwiches',
    isAvailable: true,
    options: [
      { id: 'single', name: 'سنجل (Single)', price: 115 },
      { id: 'double', name: 'دبل (Double)', price: 175 }
    ],
    defaultOptionId: 'single',
    badges: ['موزاريلا مقرمشة']
  },
  {
    id: 'golden-royal',
    name: 'ساندوتش جولدن رويال',
    description: 'خس، خيار مخلل، صدور دجاج بخلطة A1، هوت دوج مشوي، صوص ماك رويال الفاخر، صوص شيدر غني',
    category: 'burgers-sandwiches',
    isAvailable: true,
    options: [
      { id: 'single', name: 'سنجل (Single)', price: 110 },
      { id: 'double', name: 'دبل (Double)', price: 160 }
    ],
    defaultOptionId: 'single'
  },
  {
    id: 'miami-steaks',
    name: 'ساندوتش ميامي ستيكس',
    description: 'خس، خيار مخلل، صدور دجاج بخلطة A1، أصابع موزاريلا ذهبية، مايونيز، صوص شيدر أصلي',
    category: 'burgers-sandwiches',
    isAvailable: false, // لم يحدد السعر بعد
    badges: ['قريباً']
  },
  {
    id: 'texas-bbq',
    name: 'ساندوتش باربكيو تكساس',
    description: 'خس، خيار مخلل، صدور دجاج بخلطة A1، شريحة بيكون مدخن، صوص شيدر، صوص باربكيو سموكي',
    category: 'burgers-sandwiches',
    isAvailable: false, // لم يحدد السعر بعد
    badges: ['قريباً']
  },
  {
    id: 'pro-max-a1',
    name: 'برو ماكس A1',
    description: 'خس، خيار مخلل، قطعتان صدور دجاج بخلطة A1، هوت دوج، صوص بيج تايستي، صوص شيدر سايح',
    category: 'burgers-sandwiches',
    isAvailable: true,
    options: [
      { id: 'single', name: 'سنجل (Single)', price: 135 },
      { id: 'double', name: 'دبل (Double)', price: 195 }
    ],
    defaultOptionId: 'single',
    badges: ['توقيع المطعم']
  },
  {
    id: 'x-max-a1',
    name: 'إكس ماكس A1',
    description: 'خس، خيار مخلل، صدور دجاج بخلطة A1، حلقات بصل مقرمشة، صوص ألف جزيرة، صوص شيدر كريمي',
    category: 'burgers-sandwiches',
    isAvailable: true,
    options: [
      { id: 'single', name: 'سنجل (Single)', price: 115 },
      { id: 'double', name: 'دبل (Double)', price: 165 }
    ],
    defaultOptionId: 'single'
  },

  // 4) ماك آند تشيز
  {
    id: 'golden-original-mac',
    name: 'جولدن أوريجنال ماك',
    description: 'مكرونة ماك آند تشيز بصوص الجبن المميز، متبلة بخلطة A1 الخاصة',
    category: 'mac-and-cheese',
    isAvailable: true,
    options: [
      { id: 'plain', name: 'سادة (Plain)', price: 70 },
      { id: 'cheetos', name: 'كرانشي شيتوس (Cheetos)', price: 75 }
    ],
    defaultOptionId: 'plain'
  },
  {
    id: 'royal-mac',
    name: 'رويال ماك تشيكن',
    description: 'بصوص الجبن الغني وخلطة A1 المتبلة مع قطع الدجاج المقرمشة الشهية',
    category: 'mac-and-cheese',
    isAvailable: true,
    options: [
      { id: 'plain', name: 'سادة (Plain)', price: 80 },
      { id: 'cheetos', name: 'كرانشي شيتوس (Cheetos)', price: 85 }
    ],
    defaultOptionId: 'plain',
    badges: ['مع قطع كرسبي']
  },
  {
    id: 'iron-mac',
    name: 'آيرون ماك بيف',
    description: 'بصوص الجبن وخلطة A1 مع قطع اللحم البقري المميزة والغنية بالنكهة',
    category: 'mac-and-cheese',
    isAvailable: true,
    options: [
      { id: 'plain', name: 'سادة (Plain)', price: 85 },
      { id: 'cheetos', name: 'كرانشي شيتوس (Cheetos)', price: 95 }
    ],
    defaultOptionId: 'plain',
    badges: ['لحم بقري فاخر']
  },

  // 5) المقبلات والإضافات
  {
    id: 'onion-rings',
    name: 'حلقات البصل المقرمشة',
    description: 'حلقات بصل مقلية ذهبية مقرمشة تقدم ساخنة مع البهارات الخاصة',
    category: 'appetizers',
    price: 50,
    isAvailable: true
  },
  {
    id: 'mozzarella-sticks',
    name: 'أصابع الموزاريلا',
    description: 'أصابع جبنة موزاريلا مقرمشة وغارقة في الجبن المطاطي اللذيذ',
    category: 'appetizers',
    price: 60,
    isAvailable: true,
    badges: ['جبنة مطاطية']
  },
  {
    id: 'coleslaw-salad',
    name: 'سلطة كول سلو',
    description: 'سلطة كرنب وجزر طازجة بالدريسنج الغني الحلو والمنعش',
    category: 'appetizers',
    price: 25,
    isAvailable: true
  },
  {
    id: 'cheese-jar',
    name: 'برطمان الجبن السائل',
    description: 'برطمان صوص شيدر غني وساخن للتغميس والغرق بالجبنة',
    category: 'appetizers',
    price: 55,
    isAvailable: true,
    badges: ['عشاق الجبن']
  },

  // 6) الصوصات (صغير 20 ج / كبير 35 ج)
  {
    id: 'sauce-cheese',
    name: 'صوص الجبن الشيدر',
    description: 'صوص جبن شيدر كريمي أصلي دافئ وغني بالنكهة',
    category: 'sauces',
    isAvailable: true,
    options: [
      { id: 'small', name: 'صغير', price: 20 },
      { id: 'large', name: 'كبير', price: 35 }
    ],
    defaultOptionId: 'small'
  },
  {
    id: 'sauce-ranch',
    name: 'صوص الرانش المميز',
    description: 'صلصة رانش كريمية بالأعشاب والليمون المنعش',
    category: 'sauces',
    isAvailable: true,
    options: [
      { id: 'small', name: 'صغير', price: 20 },
      { id: 'large', name: 'كبير', price: 35 }
    ],
    defaultOptionId: 'small'
  },
  {
    id: 'sauce-sweet-chili',
    name: 'صوص السويت تشيلي',
    description: 'مزيج رائع بين الحلاوة والحرارة الممتعة',
    category: 'sauces',
    isAvailable: true,
    options: [
      { id: 'small', name: 'صغير', price: 20 },
      { id: 'large', name: 'كبير', price: 35 }
    ],
    defaultOptionId: 'small'
  },
  {
    id: 'sauce-bbq',
    name: 'صوص الباربكيو المدخن',
    description: 'نكهة سموكي مدخنة حقيقية مع قوام غني',
    category: 'sauces',
    isAvailable: true,
    options: [
      { id: 'small', name: 'صغير', price: 20 },
      { id: 'large', name: 'كبير', price: 35 }
    ],
    defaultOptionId: 'small'
  },
  {
    id: 'sauce-thousand-island',
    name: 'صوص الألف جزيرة',
    description: 'صوص كلاسيكي غني بالخيار المخلل والمايونيز الخاص',
    category: 'sauces',
    isAvailable: true,
    options: [
      { id: 'small', name: 'صغير', price: 20 },
      { id: 'large', name: 'كبير', price: 35 }
    ],
    defaultOptionId: 'small'
  },
  {
    id: 'sauce-big-tasty',
    name: 'صوص بيج تايستي',
    description: 'صوص بيج تايستي الأسطوري بنكهته المدخنة الفريدة',
    category: 'sauces',
    isAvailable: true,
    options: [
      { id: 'small', name: 'صغير', price: 20 },
      { id: 'large', name: 'كبير', price: 35 }
    ],
    defaultOptionId: 'small'
  }
];

export interface CartItem {
  cartItemId: string; // unique item id + option + notes hash
  menuItemId: string;
  name: string;
  category: string;
  selectedOptionName?: string;
  selectedOptionPrice?: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
  includedSauces?: string[];
}

export interface CustomerOrder {
  id?: string;
  orderNumber: number;
  dateString: string; // YYYY-MM-DD in Africa/Cairo
  createdAt: any;
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
}
