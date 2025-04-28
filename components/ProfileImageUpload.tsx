import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { pickImage, uploadProfilePicture, uploadCoverPhoto, uploadAdditionalPhoto } from '@/storage';
import { getAuth } from 'firebase/auth';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ProfileImageUploadProps {
  onImageUploaded?: (url: string) => void;
  initialImage?: string;
  type: 'profile' | 'cover' | 'additional';
  index?: number;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  onImageUploaded,
  initialImage,
  type,
  index,
}) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      console.log('Starting image pick...');
      const uri = await pickImage();
      console.log('Image picked:', uri);
      if (uri) {
        setImage(uri);
        await handleUpload(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to pick image. Please try again.');
    }
  };

  const handleUpload = async (uri: string) => {
    try {
      console.log('Starting upload...');
      setUploading(true);
      setError(null);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      let downloadURL: string | null;
      switch (type) {
        case 'profile':
          downloadURL = await uploadProfilePicture(uri, user.uid);
          break;
        case 'cover':
          downloadURL = await uploadCoverPhoto(uri, user.uid);
          break;
        case 'additional':
          if (index === undefined) throw new Error('Index required for additional photos');
          downloadURL = await uploadAdditionalPhoto(uri, user.uid, index);
          break;
        default:
          throw new Error('Invalid image type');
      }

      console.log('Upload complete, downloadURL:', downloadURL);

      if (!downloadURL) {
        throw new Error('Failed to upload image');
      }
      
      setImage(downloadURL);
      if (onImageUploaded) {
        console.log('Calling onImageUploaded with:', downloadURL);
        onImageUploaded(downloadURL);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getAspectRatio = () => {
    switch (type) {
      case 'cover':
        return 16/9;
      case 'profile':
      case 'additional':
      default:
        return 1;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          type === 'profile' && styles.profileContainer
        ]}
        onPress={handleImagePick}
        disabled={uploading}
      >
        {image ? (
          <Image 
            source={{ uri: image }} 
            style={[
              styles.image,
              type === 'profile' && styles.profileImage
            ]}
            onError={(e) => {
              console.error('Image loading error:', e.nativeEvent.error);
              setError('Failed to load image. Please try again.');
            }}
          />
        ) : (
          <View style={[
            styles.placeholder,
            type === 'profile' && styles.profilePlaceholder
          ]}>
            <Ionicons name="add" size={40} color={Colors.dark.shayla} />
          </View>
        )}
        {uploading && (
          <View style={[
            styles.overlay,
            type === 'profile' && styles.profileOverlay
          ]}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.dark.darkGrey,
  },
  profileContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.darkGrey,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImage: {
    borderRadius: 100,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  profilePlaceholder: {
    minHeight: 'auto',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileOverlay: {
    borderRadius: 100,
  },
  errorText: {
    color: Colors.dark.error,
    marginTop: 10,
    textAlign: 'center',
  },
}); 