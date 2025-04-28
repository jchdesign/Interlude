import { View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { updateProfileFields } from '@/firestore';
import { useState } from 'react';
import { uploadAdditionalPhoto } from '@/storage';
import { getAuth } from 'firebase/auth';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AdditionalPhotosScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleImageUploaded = async (url: string, index: number) => {
    try {
      setIsUploading(true);
      setUploadingIndex(index);
      setError(null);

      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload image to Firebase Storage
      const downloadURL = await uploadAdditionalPhoto(url, user.uid, index);
      
      if (!downloadURL) {
        throw new Error('Failed to upload image');
      }

      // Update the uploadedImageUrls array
      const newUrls = [...uploadedImageUrls];
      newUrls[index] = downloadURL;
      setUploadedImageUrls(newUrls);

      // Update user profile with the image URLs
      await updateProfileFields({ additionalPhotos: newUrls });
    } catch (error) {
      console.error('Error updating additional photo:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
    }
  };

  const handleNext = () => {
    if (uploadedImageUrls.length === 0) {
      setError('Please upload at least one photo before continuing');
      return;
    }
    router.push('/(onboarding)/artist/similar-artists');
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Add more photos</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Show your fans more of your personality and style
      </ThemedText>
      
      <View style={styles.gridContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.gridItem}
            onPress={() => {
              if (!uploadedImageUrls[index]) {
                // Handle image pick and upload
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    await handleImageUploaded(url, index);
                  }
                };
                input.click();
              }
            }}
          >
            {uploadedImageUrls[index] ? (
              <Image 
                source={{ uri: uploadedImageUrls[index] }} 
                style={styles.image}
              />
            ) : (
              <View style={styles.plusContainer}>
                <Ionicons name="add" size={40} color={Colors.dark.shayla} />
              </View>
            )}
            {uploadingIndex === index && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={Colors.dark.purple} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

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
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: '4%',
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  plusContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
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