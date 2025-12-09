/**
 * Internationalization setup
 * Currently supports English (primary) and Arabic (secondary)
 */

export type Locale = 'en' | 'ar';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'ar'];

export interface Translations {
  [key: string]: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    siteName: 'Kasrah Games',
    tagline: 'Play Amazing HTML5 & WebGL Games',
    browseGames: 'Browse Games',
    login: 'Login',
    register: 'Register',
    home: 'Home',
    games: 'Games',
    about: 'About',
    contact: 'Contact',
    profile: 'Profile',
    logout: 'Logout',
    search: 'Search',
    categories: 'Categories',
    featured: 'Featured',
    popular: 'Popular',
    new: 'New',
    rating: 'Rating',
    plays: 'Plays',
    playNow: 'Play Now',
    viewAll: 'View All',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
  },
  ar: {
    siteName: 'ألعاب كسرة',
    tagline: 'العب ألعاب HTML5 و WebGL الرائعة',
    browseGames: 'تصفح الألعاب',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    home: 'الرئيسية',
    games: 'الألعاب',
    about: 'من نحن',
    contact: 'اتصل بنا',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    search: 'بحث',
    categories: 'الفئات',
    featured: 'مميز',
    popular: 'شائع',
    new: 'جديد',
    rating: 'التقييم',
    plays: 'مرات اللعب',
    playNow: 'العب الآن',
    viewAll: 'عرض الكل',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
  },
};

export function getTranslations(locale: Locale = defaultLocale): Translations {
  return translations[locale] || translations[defaultLocale];
}

export function t(key: string, locale: Locale = defaultLocale): string {
  return getTranslations(locale)[key] || key;
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function formatNumber(num: number, locale: Locale = defaultLocale): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(date: Date | string, locale: Locale = defaultLocale): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatCurrency(amount: number, currency: string, locale: Locale = defaultLocale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Language switching utilities
export function switchLanguage(locale: Locale) {
  if (typeof window === 'undefined') return;
  
  // Store preference in localStorage
  localStorage.setItem('preferred-language', locale);
  
  // Update HTML lang attribute
  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);
  
  // Reload the page to apply translations
  window.location.reload();
}

export function getCurrentLanguage(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const stored = localStorage.getItem('preferred-language');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }
  
  const browserLang = navigator.language.split('-')[0] as Locale;
  return locales.includes(browserLang) ? browserLang : defaultLocale;
}
