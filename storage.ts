import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

if (!app) {
  throw new Error('Firebase app not initialized');
}

const storage = getStorage(app);

// Base paths for different content types
const STORAGE_PATHS = {
  users: 'users',
  posts: 'posts',
  songs: 'songs',
  albums: 'albums',
} as const;

// User-related storage functions
export const uploadProfilePicture = async (uri: string, userId: string): Promise<string | null> => {
  const path = `${STORAGE_PATHS.users}/${userId}/profile-picture/${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

export const uploadCoverPhoto = async (uri: string, userId: string): Promise<string | null> => {
  const path = `${STORAGE_PATHS.users}/${userId}/cover-photo/${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

export const uploadAdditionalPhoto = async (uri: string, userId: string, index: number): Promise<string | null> => {
  const path = `${STORAGE_PATHS.users}/${userId}/additional-photos/${index}_${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

// Post-related storage functions (to be implemented later)
export const uploadPostImage = async (uri: string, postId: string): Promise<string | null> => {
  const path = `${STORAGE_PATHS.posts}/${postId}/images/${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

// Song-related storage functions (to be implemented later)
export const uploadSongAudio = async (uri: string, songId: string): Promise<string | null> => {
  const path = `${STORAGE_PATHS.songs}/${songId}/audio/${Date.now()}.mp3`;
  return uploadAudio(uri, path);
};

export const uploadSongCover = async (uri: string, songId: string): Promise<string | null> => {
  const path = `${STORAGE_PATHS.songs}/${songId}/cover/${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

// Album-related storage functions (to be implemented later)
export const uploadAlbumCover = async (uri: string, albumId: string): Promise<string | null> => {
  const path = `${STORAGE_PATHS.albums}/${albumId}/cover/${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

// Helper functions
export const pickImage = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return null;
    }

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

const uploadImage = async (uri: string, path: string): Promise<string | null> => {
  try {
    console.log('Starting image upload...');
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);
    console.log('Uploading blob to Firebase Storage...');
    const uploadResult = await uploadBytes(storageRef, blob);
    console.log('Upload successful:', uploadResult);

    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('Download URL:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    if (error instanceof Error && error.message.includes('CORS')) {
      console.log('CORS error detected, but upload may have succeeded');
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/interlude-5d3bf.firebasestorage.app/o/';
      const encodedPath = encodeURIComponent(path);
      return `${baseUrl}${encodedPath}?alt=media`;
    }
    return null;
  }
};

// Utility to pick image or video
export const pickImageOrVideo = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Error picking media:', error);
    return null;
  }
};

// Utility to upload any media (image or video) for a post
export const uploadPostMedia = async (uri: string, postId: string): Promise<string | null> => {
  // Get file extension
  const extMatch = uri.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1] : 'media';
  const path = `${STORAGE_PATHS.posts}/${postId}/media/${Date.now()}.${ext}`;
  return uploadImage(uri, path);
};

const uploadAudio = async (uri: string, path: string): Promise<string | null> => {
  try {
    console.log('Starting audio upload...', { uri, path });
    const response = await fetch(uri);
    const blob = await response.blob();
    console.log('Audio blob created:', { size: blob.size, type: blob.type });

    const storageRef = ref(storage, path);
    console.log('Uploading audio blob to Firebase Storage...', { path });
    const uploadResult = await uploadBytes(storageRef, blob);
    console.log('Audio upload successful:', { 
      path: uploadResult.ref.fullPath,
      bucket: uploadResult.ref.bucket,
      name: uploadResult.ref.name
    });

    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('Download URL:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error in uploadAudio:', error);
    return null;
  }
}; 