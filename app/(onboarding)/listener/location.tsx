import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { router } from 'expo-router';
import { useState } from 'react';
import { updateProfileFields } from '@/firestore';
import { Colors } from '@/constants/Colors';
import ThemedInput from '@/components/ThemedInput';

export default function LocationScreen() {
  const [location, setLocation] = useState('');

  const handleNext = async () => {
    try {
      await updateProfileFields({
        location,
      });
      router.push('/(onboarding)/listener/genres' as const);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile information. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Where do you call home?</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        To connect you with artists and scenes in your city.
      </ThemedText>
      
      <View style={styles.inputContainer}>
        <ThemedInput
          placeholder="Current city"
          value={location}
          onChangeText={setLocation}
        />
      </View>

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
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  titlePadding: {
    paddingBottom: 20,
  },
  subtitlePadding: {
    paddingBottom: 20,
  },
}); 