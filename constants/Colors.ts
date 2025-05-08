/**
 * Below are the colors that are used in the app. The colors are defined for both light and dark mode.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#D1A5D9';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    icon: '#000',
    tabIconDefault: '#E1E1E1',
    tabIconSelected: tintColorLight,
    purple: '#502B8C',
    purpleDark: '#2E1753',
    shayla: '#933273',
    blue: '#6763C6',
    pink: '#D1A5D9',
    white: '#fff',
    error: '#ff3b30',
  },
  dark: {
    text: '#E1E1E1',
    textGrey: '#8C8C8C',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#fff',
    tabIconDefault: '#E1E1E1',
    tabIconSelected: tintColorDark,
    purple: '#502B8C',
    purpleDark: '#2E1753',
    darkGrey: '#2F2F2F',
    shayla: '#933273',
    blue: '#6763C6',
    pink: '#D1A5D9',
    white: '#E1E1E1',
    error: '#ff3b30',
    greyMedium: '#383838',
  },
};

export function hexToRgba(hex: string, alpha: number): string {
  hex = hex.replace(/^#/, '');
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
