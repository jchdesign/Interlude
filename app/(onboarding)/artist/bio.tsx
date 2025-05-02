import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { updateProfileFields } from '@/firestore';
import { useState } from 'react';
import ThemedInput from '@/components/ThemedInput';
import { Colors } from '@/constants/Colors';

export default function BioScreen() {
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!bio.trim()) {
      setError('Please enter a bio');
      return;
    }

    try {
      await updateProfileFields({ bio });
      router.push('/(onboarding)/artist/profile-picture');
    } catch (err) {
      setError('Failed to save bio. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Add a bio to your profile.</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
      This is the place to tell your listeners about all that you are.
      </ThemedText>
      
      <ThemedInput
        value={bio}
        onChangeText={setBio}
        placeholder="Enter your bio"
        multiline
        numberOfLines={4}
      />

      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

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
  titlePadding: {
    paddingBottom: 10,
  },
  subtitlePadding: {
    paddingBottom: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 10,
  },
  navigation: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
}); 