import { StyleSheet, View, Text, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function Notifications() {
  return (
    <View>
        <ThemedText>Hello World</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  
});