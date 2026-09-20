export type ThemePalette = 'emerald' | 'beige' | 'cream' | 'slate';

export interface ThemeConfig {
  id: ThemePalette;
  nameEn: string;
  nameHi: string;
  dotColor: string;
  topBarBg: string;
  topBarText: string;
  topBarBorder: string;
  headerText: string;
  headerHoverText: string;
  headerButtonBg: string;
  navBg: string;
  navBorder: string;
  navText: string;
  navActiveBg: string;
  navActiveText: string;
  navActiveBorder: string;
  navHoverBg: string;
  heroGradient: string;
  heroBadgeBg: string;
  heroBadgeText: string;
  heroBadgeBorder: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  cardSelectedBg: string;
  cardSelectedBorder: string;
  cardSelectedText: string;
  cardActionBg: string;
  footerBg: string;
  footerBorder: string;
  kpiBg: string;
  kpiText: string;
}

export const THEMES: Record<ThemePalette, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    nameEn: 'Jharkhand Forest Emerald',
    nameHi: 'झारखंड पन्ना',
    dotColor: '#059669',
    topBarBg: 'bg-[#faf6ee]',
    topBarText: 'text-stone-700',
    topBarBorder: 'border-stone-200/80',
    headerText: 'text-emerald-900',
    headerHoverText: 'hover:text-emerald-700',
    headerButtonBg: 'bg-emerald-700 hover:bg-emerald-800',
    navBg: 'bg-white/95',
    navBorder: 'border-stone-200/90',
    navText: 'text-stone-700',
    navActiveBg: 'bg-[#f4efe4]',
    navActiveText: 'text-emerald-900',
    navActiveBorder: 'border-emerald-600',
    navHoverBg: 'hover:bg-[#faf7f0]',
    heroGradient: 'from-[#f5efe6] via-[#faf6ee] to-white',
    heroBadgeBg: 'bg-emerald-100/90',
    heroBadgeText: 'text-emerald-800',
    heroBadgeBorder: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-500',
    cardSelectedBg: 'bg-emerald-50/90',
    cardSelectedBorder: 'border-emerald-600',
    cardSelectedText: 'text-emerald-950 font-bold',
    cardActionBg: 'bg-emerald-700 hover:bg-emerald-800',
    footerBg: 'bg-[#f5efe6]/90',
    footerBorder: 'border-stone-200',
    kpiBg: 'bg-[#f5efe6]',
    kpiText: 'text-emerald-900',
  },
  beige: {
    id: 'beige',
    nameEn: 'Warm Sandstone Beige',
    nameHi: 'रेत-बलुआ बेज',
    dotColor: '#b4916c',
    topBarBg: 'bg-[#f6f0e4]',
    topBarText: 'text-stone-800',
    topBarBorder: 'border-[#e5dcce]',
    headerText: 'text-emerald-900',
    headerHoverText: 'hover:text-emerald-700',
    headerButtonBg: 'bg-emerald-800 hover:bg-emerald-900',
    navBg: 'bg-white/95',
    navBorder: 'border-stone-200/90',
    navText: 'text-stone-700',
    navActiveBg: 'bg-[#eee6d8]',
    navActiveText: 'text-emerald-950',
    navActiveBorder: 'border-emerald-700',
    navHoverBg: 'hover:bg-[#f6f0e4]',
    heroGradient: 'from-[#ede3d1] via-[#f7f2e8] to-white',
    heroBadgeBg: 'bg-[#e5dcce]',
    heroBadgeText: 'text-stone-900',
    heroBadgeBorder: 'border-[#d4c7b2]',
    badgeBg: 'bg-[#e5dcce]',
    badgeText: 'text-emerald-900',
    accentText: 'text-emerald-800',
    accentBg: 'bg-emerald-700',
    accentBorder: 'border-emerald-600',
    cardSelectedBg: 'bg-[#f4ede1]',
    cardSelectedBorder: 'border-emerald-700',
    cardSelectedText: 'text-emerald-950 font-bold',
    cardActionBg: 'bg-emerald-800 hover:bg-emerald-900',
    footerBg: 'bg-[#ede5d6]',
    footerBorder: 'border-[#d4c8b4]',
    kpiBg: 'bg-[#f0e7d7]',
    kpiText: 'text-emerald-900',
  },
  cream: {
    id: 'cream',
    nameEn: 'Royal Ivory Cream',
    nameHi: 'रॉयल क्रीम',
    dotColor: '#e0cfa9',
    topBarBg: 'bg-[#fdfbf7]',
    topBarText: 'text-stone-700',
    topBarBorder: 'border-[#ebd9b8]',
    headerText: 'text-emerald-900',
    headerHoverText: 'hover:text-emerald-700',
    headerButtonBg: 'bg-emerald-700 hover:bg-emerald-800',
    navBg: 'bg-white/95',
    navBorder: 'border-stone-200/90',
    navText: 'text-stone-700',
    navActiveBg: 'bg-[#faf3e3]',
    navActiveText: 'text-emerald-950',
    navActiveBorder: 'border-emerald-600',
    navHoverBg: 'hover:bg-[#fcf7ec]',
    heroGradient: 'from-[#fbf4e2] via-[#fdfaf2] to-white',
    heroBadgeBg: 'bg-[#f7ebce]',
    heroBadgeText: 'text-emerald-900',
    heroBadgeBorder: 'border-[#ebd9b8]',
    badgeBg: 'bg-[#f7ebce]',
    badgeText: 'text-emerald-900',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-500',
    cardSelectedBg: 'bg-[#fbf4e2]',
    cardSelectedBorder: 'border-emerald-600',
    cardSelectedText: 'text-emerald-950 font-bold',
    cardActionBg: 'bg-emerald-700 hover:bg-emerald-800',
    footerBg: 'bg-[#f9f2df]',
    footerBorder: 'border-[#e8d7b7]',
    kpiBg: 'bg-[#f8f1de]',
    kpiText: 'text-emerald-900',
  },
  slate: {
    id: 'slate',
    nameEn: 'Earth Stone & Moss',
    nameHi: 'पत्थर एवं काई',
    dotColor: '#78716c',
    topBarBg: 'bg-[#f5f5f4]',
    topBarText: 'text-stone-700',
    topBarBorder: 'border-stone-200',
    headerText: 'text-stone-900',
    headerHoverText: 'hover:text-emerald-700',
    headerButtonBg: 'bg-emerald-800 hover:bg-emerald-900',
    navBg: 'bg-white/95',
    navBorder: 'border-stone-200/90',
    navText: 'text-stone-700',
    navActiveBg: 'bg-[#eae8e4]',
    navActiveText: 'text-emerald-950',
    navActiveBorder: 'border-emerald-800',
    navHoverBg: 'hover:bg-stone-50',
    heroGradient: 'from-[#eceae5] via-[#f7f6f4] to-white',
    heroBadgeBg: 'bg-stone-200',
    heroBadgeText: 'text-stone-800',
    heroBadgeBorder: 'border-stone-300',
    badgeBg: 'bg-stone-200',
    badgeText: 'text-stone-800',
    accentText: 'text-emerald-800',
    accentBg: 'bg-emerald-800',
    accentBorder: 'border-emerald-700',
    cardSelectedBg: 'bg-[#edebe7]',
    cardSelectedBorder: 'border-emerald-800',
    cardSelectedText: 'text-stone-900 font-bold',
    cardActionBg: 'bg-emerald-800 hover:bg-emerald-900',
    footerBg: 'bg-[#ebe8e2]',
    footerBorder: 'border-stone-300',
    kpiBg: 'bg-[#edebe7]',
    kpiText: 'text-emerald-950',
  },
};

export const getTheme = (palette?: ThemePalette): ThemeConfig => {
  return THEMES[palette || 'emerald'] || THEMES.emerald;
};
