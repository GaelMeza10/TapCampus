export const COLORS = {
  primary: '#17613B',
  primaryDark: '#124D2F',
  accent: '#4CAF6F',
  background: '#FAF5EA',
  white: '#FFFFFF',
  textDark: '#202923',
  textMedium: '#58645D',
  textLight: '#68756D',
  inputBg: '#F1ECDF',
  border: '#DDD6C4',
  error: '#B42318',
  errorBg: '#FEF2F2',
  disabled: '#B9C2B9',
  primarySoft: '#EAF1EA',
  navigationBar: '#124D2F',
  navigationGlassTint: 'rgba(18, 77, 47, 0.88)',
  navigationText: '#D9E8DD',
  stockLowBg: '#FBE3E0',
  stockLowText: '#8F1D17',
  navigationSelected: 'rgba(255, 255, 255, 0.16)',
  staticSoft: '#F1F0EC',
  staticAccent: '#8B7355',
  gangaSoft: '#FFF1E4',
  ganga: '#A44B16',
  overlay: 'rgba(0, 0, 0, 0.45)',
};

export const FONTS = {
  display: 'BricolageGrotesque_800ExtraBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const RADIUS = {
  hero: 18,
  sm: 10,
  md: 16,
  lg: 16,
  full: 999,
};

export const SHADOW = {
  card: {
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
};

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, page: 20, xl: 24, xxl: 32, section: 40 };
export const TYPE = {
  brand: { fontFamily: FONTS.display, fontSize: 30, lineHeight: 36, color: COLORS.primary },
  title: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 34, color: COLORS.textDark },
  section: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 30, color: COLORS.textDark },
  heading: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 25, color: COLORS.textDark },
  body: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20, color: COLORS.textDark },
  label: { fontFamily: FONTS.semibold, fontSize: 14, lineHeight: 20, color: COLORS.textDark },
  caption: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19, color: COLORS.textMedium },
  badge: { fontFamily: FONTS.semibold, fontSize: 12, lineHeight: 17, color: COLORS.primary },
  controlCompact: { fontFamily: FONTS.semibold, fontSize: 13, lineHeight: 19, color: COLORS.textDark },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 16, lineHeight: 22, color: COLORS.textDark },
  place: { fontFamily: FONTS.bold, fontSize: 13, lineHeight: 19, color: COLORS.textDark },
  priceHero: { fontFamily: FONTS.display, fontSize: 30, lineHeight: 36, color: COLORS.ganga },
  price: { fontFamily: FONTS.display, fontSize: 24, lineHeight: 30, color: COLORS.primary },
  countdown: { fontFamily: FONTS.display, fontSize: 20, lineHeight: 28, color: COLORS.primary },
};
export const METRICS = { control: 52, compactControl: 48, fab: 56, tabBar: 76, photoWidth: 100, photoHeight: 100, gridMinWidth: 160, gridMaxColumns: 3 };
