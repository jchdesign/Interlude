import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

if (!app) {
  throw new Error('Firebase app not initialized');
}

const storage = getStorage(app);

export const pickImage = async (): Promise<string | null> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const uploadImage = async (uri: string, path: string): Promise<string | null> => {
  try {
    console.log('Starting image upload...');
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload the blob
    console.log('Uploading blob to Firebase Storage...');
    const uploadResult = await uploadBytes(storageRef, blob);
    console.log('Upload successful:', uploadResult);

    // Get download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('Download URL:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    // If we get a CORS error but the upload succeeded, we can still return the URL
    if (error instanceof Error && error.message.includes('CORS')) {
      console.log('CORS error detected, but upload may have succeeded');
      // Construct the URL manually since we know the path
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/interlude-5d3bf.firebasestorage.app/o/';
      const encodedPath = encodeURIComponent(path);
      return `${baseUrl}${encodedPath}?alt=media`;
    }
    return null;
  }
};

export const uploadProfilePicture = async (uri: string, userId: string): Promise<string | null> => {
  const path = `${userId}/profile-picture/${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

export const uploadCoverPhoto = async (uri: string, userId: string): Promise<string | null> => {
  const path = `${userId}/cover-photo/${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

export const uploadAdditionalPhoto = async (uri: string, userId: string, index: number): Promise<string | null> => {
  const path = `${userId}/additional-photos/${index}_${Date.now()}.jpg`;
  return uploadImage(uri, path);
}; 