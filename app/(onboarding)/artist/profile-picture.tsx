import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { updateProfileFields } from '@/firestore';
import { useState } from 'react';
import { uploadProfilePicture } from '@/storage';
import { getAuth } from 'firebase/auth';
import { Colors } from '@/constants/Colors';

export default function ProfilePictureScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUploaded = async (downloadURL: string) => {
    console.log('handleImageUploaded called with URL:', downloadURL);
    try {
      setIsUploading(true);
      setError(null);
      // Only update Firestore with the download URL, do NOT upload again!
      await updateProfileFields({ profilePicture: downloadURL });
      setUploadedImageUrl(downloadURL);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    console.log('handleNext called, uploadedImageUrl:', uploadedImageUrl);
    if (!uploadedImageUrl) {
      setError('Please upload a profile picture before continuing');
      return;
    }
    router.push('/(onboarding)/artist/cover-photo');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <ThemedText type="h1" style={styles.titlePadding}>Add a profile picture.</ThemedText>
        <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>Put yourself in the spotlight. This is your front-page moment.</ThemedText>
      </View>
      <View style={styles.middleSection}>
        <ProfileImageUpload 
          onImageUploaded={handleImageUploaded}
          initialImage={uploadedImageUrl || undefined}
          type="profile"
        />
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color={Colors.dark.purple} />
            <ThemedText style={styles.uploadingText}>Uploading...</ThemedText>
          </View>
        )}
        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}
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
    backgroundColor: 'black',
  },
  topSection: {
    alignItems: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 100,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  uploadingText: {
    marginTop: 10,
    color: Colors.dark.text,
  },
  errorText: {
    color: Colors.dark.error,
    marginTop: 10,
    textAlign: 'center',
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
    marginBottom: 10,
  },
  subtitlePadding: {
    marginBottom: 20,
  },
}); 