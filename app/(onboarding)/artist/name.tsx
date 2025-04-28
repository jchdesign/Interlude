import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { updateProfileFields } from '@/firestore';
import { useState } from 'react';
import ThemedInput from '@/components/ThemedInput';
import { Colors } from '@/constants/Colors';

export default function NameScreen() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      await updateProfileFields({ name: name.trim() });
      router.push('/(onboarding)/artist/location');
    } catch (error) {
      console.error('Error updating name:', error);
      setError('Failed to save name. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>What's your name?</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        This will be displayed on your profile
      </ThemedText>

      <ThemedInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoCapitalize="words"
        autoCorrect={false}
      />

      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}

      <View style={styles.navigation}>
        <ButtonNav onPress={() => router.back()} forward={false} />
        <ButtonNav onPress={handleNext} forward={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titlePadding: {
    paddingBottom: 10,
  },
  subtitlePadding: {
    paddingBottom: 50,
  },
  input: {
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 10,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
}); 