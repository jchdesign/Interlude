import { Text, type TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'small' | 'large' | 'h3' | 'h2' | 'h1' | 'link';
};

export function ThemedText({
  style,
  lightColor = Colors.dark.white,
  darkColor = Colors.dark.white,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        styles.base,
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'large' ? styles.large : undefined,
        type === 'h3' ? styles.h3 : undefined,
        type === 'h2' ? styles.h2 : undefined,
        type === 'h1' ? styles.h1 : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Figtree-Regular',
  },
  default: {
    fontSize: 16,
  },
  small: {
    fontSize: 12,
  },
  large: {
    fontSize: 20,
  },
  h3: {
    fontSize: 20,
  },
  h2: {
    fontSize: 25,
    fontFamily: 'Figtree-Regular',
  },
  h1: {
    fontSize: 32,
    fontFamily: 'Figtree-SemiBold',
    fontWeight: undefined,
  },
  title: {
    fontSize: 64,
    fontFamily: 'Figtree-Black',
    fontWeight: undefined,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
