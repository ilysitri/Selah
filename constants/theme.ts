export const Colors = {
  accent: '#C9A09A',
  background: '#FAF8F5',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textDark: '#2A2A2A',
  textSecondary: '#444',
  textMuted: '#666',
  textFaint: '#888',
  textThin: '#999',
  textWarm: '#7A7269',
  accentWarm: '#9C7272',
  border: '#E5E0D8',
  borderLight: '#EDE8E3',
  statusYes: '#3A7D44',
  statusNo: '#C0392B',
  statusMaybe: '#C47A1E',
} as const;

export const FontFamily = {
  display: 'Didot',
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  caption: 13,
  body: 14,
  bodyMd: 15,
  bodyLg: 16,
  subheading: 17,
  heading: 18,
  headingMd: 22,
  headingLg: 26,
  headingXl: 28,
  display: 32,
  hero: 48,
  verdict: 72,
} as const;

export const Radius = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04 as number,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardMd: {
    shadowColor: '#000',
    shadowOpacity: 0.05 as number,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLg: {
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.07 as number,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
} as const;
