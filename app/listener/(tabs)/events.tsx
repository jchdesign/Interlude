import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function Events() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Events</ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText>Upcoming events you're interested in will appear here</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    padding: 24,
    paddingTop: 50,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 