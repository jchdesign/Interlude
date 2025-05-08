import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { updateProfileFields } from '@/firestore';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';

export default function ProfilePictureScreen() {
  const handleImageUploaded = async (url: string) => {
    try {
      await updateProfileFields({ profilePicture: url });
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="h1" style={styles.title}>Add a profile picture</ThemedText>
        <ThemedText style={styles.subtitle}>Let others recognize you on Interlude.</ThemedText>
      </View>
      
      <ProfileImageUpload 
        onImageUploaded={handleImageUploaded}
        initialImage={undefined}
        type="profile"
      />

      <View style={styles.navigation}>
        <ButtonNav onPress={() => router.back()} forward={false} />
        <ButtonNav onPress={() => router.push('/listener/(tabs)/home')} forward={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    paddingBottom: 20,
  },
  subtitle: {
    paddingBottom: 20,
  },
  content: {
    alignItems: 'center',
  },
}); 