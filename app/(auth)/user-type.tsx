import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonLarge from '@/components/ButtonLarge';
import { createUserProfile } from '@/firestore';
import { auth } from '@/firebase';

export default function UserTypeScreen() {
  const handleUserTypeSelect = async (role: 'artist' | 'listener') => {
    try {
      if (!auth) {
        throw new Error('Authentication not initialized');
      }

      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user logged in');
      }

      await createUserProfile({
        role: role,
        email: user.email,
      });

      if (role === 'artist') {
        router.push('/(onboarding)/artist/spotify-search');
      } else {
        router.push('/(onboarding)/listener/name');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Are you a Listener or Artist?</ThemedText>
      <View style={styles.buttonContainer}>
        <ButtonLarge 
          onPress={() => handleUserTypeSelect('artist')} 
          title="Artist"
        />
        <ButtonLarge 
          onPress={() => handleUserTypeSelect('listener')} 
          title="Listener"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
    alignItems: 'center',
  },
}); 