import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface PillButtonProps {
  onPress?: () => void;
  color: string;
  text: string;
  style?: ViewStyle;
  textStyle?: any;
}

export const PillButton: React.FC<PillButtonProps> = ({ onPress, color, text, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ThemedText style={[styles.text, textStyle]}>{text}</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 32,
    width: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
}); 