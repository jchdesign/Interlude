import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface PostButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap; // MaterialCommunityIcons icon name
  title: string;
  subtitle: string;
  onPress?: () => void;
  style?: ViewStyle;
  iconBgColor?: string;
  iconColor?: string;
  iconSize?: number;
}

export const PostButton: React.FC<PostButtonProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  style,
  iconBgColor = Colors.dark.purpleDark, // default purple
  iconColor = Colors.dark.white,
  iconSize = 28,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}> 
        <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type='h3'>{title}</ThemedText>
        <ThemedText type='small' style={{opacity: 0.5}}>{subtitle}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.darkGrey,
    borderRadius: 16,
    marginVertical: 8,
    overflow: 'hidden',
    minHeight: 72,
  },
  iconContainer: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  textContainer: {
    flex: 1,
    gap: 8,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 24,
  }
}); 