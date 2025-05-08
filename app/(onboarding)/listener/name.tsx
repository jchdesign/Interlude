import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ThemedInput from '@/components/ThemedInput';
import ButtonNav from '@/components/ButtonNav';
import { router } from 'expo-router';
import { useState } from 'react';
import { updateProfileFields } from '@/firestore';
import { Colors } from '@/constants/Colors';

export default function NameScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleNext = async () => {
    try {
      await updateProfileFields({
        name,
        username,
      });
      router.push('/(onboarding)/listener/birthday' as const);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile information. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="h1" style={styles.title}>What's your name?</ThemedText>
        <ThemedText style={styles.subtitle}>Let's get to know each other.</ThemedText>
      </View>
      <View style={styles.inputContainer}>
        <ThemedInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <ThemedInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
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
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: 40,
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
    marginBottom: 20,
  },
  subtitlePadding: {
    marginBottom: 20,
  },
  content: {
    marginBottom: 40,
  },
  title: {
    marginBottom: 20,
  },
  subtitle: {
    marginBottom: 20,
  },
}); 