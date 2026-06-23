import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A18',
    textSecondary: '#6B6B65',
    textTertiary: '#9E9E96',
    background: '#FFFFFF',
    backgroundElement: '#F1F1F3',
    backgroundSelected: '#E8E8EA',
    border: 'rgba(0,0,0,0.07)',
    inputFill: '#F1F1F3',
    tint: '#1A1A18',
    danger: '#D93B30',
    statusExploring: '#F59E0B',
    statusDeveloping: '#3B82F6',
    statusSolid: '#14B8A6',
    statusMastered: '#8B5CF6',
  },
  dark: {
    text: '#F2F2F0',
    textSecondary: '#A8A8A0',
    textTertiary: '#6B6B65',
    background: '#1A1A18',
    backgroundElement: '#242422',
    backgroundSelected: '#2E2E2C',
    border: 'rgba(255,255,255,0.08)',
    inputFill: '#242422',
    tint: '#FFFFFF',
    danger: '#E0735A',
    statusExploring: '#F59E0B',
    statusDeveloping: '#3B82F6',
    statusSolid: '#14B8A6',
    statusMastered: '#8B5CF6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'Fraunces-Regular',
    serifBold: 'Fraunces-SemiBold',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'Fraunces-Regular',
    serifBold: 'Fraunces-SemiBold',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'Fraunces, serif',
    serifBold: 'Fraunces, serif',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
