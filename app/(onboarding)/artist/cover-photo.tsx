import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { updateProfileFields } from '@/firestore';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';

export default function CoverPhotoScreen() {
  const handleImageUploaded = async (url: string) => {
    try {
      await updateProfileFields({ coverPhoto: url });
    } catch (error) {
      console.error('Error updating cover photo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Add a cover photo</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Choose a photo that represents your music and style
      </ThemedText>
      
      <View style={styles.coverPhotoContainer}>
        <ProfileImageUpload 
          onImageUploaded={handleImageUploaded}
          initialImage={undefined}
          type="cover"
        />
      </View>

      <View style={styles.navigation}>
        <ButtonNav onPress={() => router.back()} forward={false} />
        <ButtonNav onPress={() => router.push('/(onboarding)/artist/additional-photos')} forward={true} />
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
  coverPhotoContainer: {
    width: '100%',
    aspectRatio: 16/9,
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
}); 