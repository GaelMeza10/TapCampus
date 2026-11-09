export const COLORS = {
  primary: '#17613B',
  primaryDark: '#124D2F',
  accent: '#4CAF6F',
  background: '#EDEAE3',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMedium: '#56615B',
  textLight: '#A0AEC0',
  inputBg: '#F3F4F6',
  border: '#D7DED8',
  error: '#B42318',
  errorBg: '#FEF2F2',
  disabled: '#B9C2B9',
  primarySoft: '#E8F5EE',
  navigationSelected: 'rgba(23, 97, 59, 0.12)',
  staticSoft: '#F0EDE8',
  staticAccent: '#8B7355',
  gangaSoft: '#FFF1E4',
  ganga: '#A44B16',
  overlay: 'rgba(0, 0, 0, 0.45)',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999,
};

export const SHADOW = {
  card: {
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
};

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, page: 20, xl: 24, xxl: 32, section: 40 };
export const TYPE = {
  brand: { fontFamily: FONTS.bold, fontSize: 28, lineHeight: 36, color: COLORS.primary },
  title: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 34, color: COLORS.textDark },
  section: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 30, color: COLORS.textDark },
  heading: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 25, color: COLORS.textDark },
  body: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20, color: COLORS.textDark },
  label: { fontFamily: FONTS.semibold, fontSize: 14, lineHeight: 20, color: COLORS.textDark },
  caption: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19, color: COLORS.textMedium },
  badge: { fontFamily: FONTS.semibold, fontSize: 12, lineHeight: 17, color: COLORS.primary },
  price: { fontFamily: FONTS.bold, fontSize: 24, lineHeight: 32, color: COLORS.primary },
  countdown: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 28, color: COLORS.primary },
};
export const METRICS = { control: 52, compactControl: 44, fab: 56, tabBar: 76, photoWidth: 100, photoHeight: 100 };
