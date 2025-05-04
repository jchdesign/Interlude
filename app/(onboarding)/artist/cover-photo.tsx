import { View, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { updateProfileFields } from '@/firestore';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { uploadCoverPhoto } from '@/storage';

const { height: screenHeight } = Dimensions.get('window');

export default function CoverPhotoScreen() {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No user is signed in');
          return;
        }

        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setGenre(data.genre || '');
          setLocation(data.location?.name || '');
          setUploadedImageUrl(data.coverPhoto || null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const handleImageUploaded = async (downloadURL: string) => {
    console.log('handleImageUploaded called with URL:', downloadURL);
    try {
      setIsUploading(true);
      setError(null);
      // Only update Firestore with the download URL, do NOT upload again!
      await updateProfileFields({ coverPhoto: downloadURL });
      setUploadedImageUrl(downloadURL);
    } catch (error) {
      console.error('Error updating cover photo:', error);
      setError('Failed to upload cover photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    console.log('handleNext called, uploadedImageUrl:', uploadedImageUrl);
    if (!uploadedImageUrl) {
      setError('Please upload a cover photo before continuing');
      return;
    }
    router.push('/(onboarding)/artist/additional-photos');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ThemedText type="h1" style={styles.titlePadding}>Add a cover photo for your profile.</ThemedText>
        <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
          Set the stage. Add a cover that showcases your style.
        </ThemedText>
        
        <View style={styles.coverPhotoContainer}>
          {uploadedImageUrl && (
            <Image
              source={{ uri: uploadedImageUrl }}
              style={styles.coverImage}
            />
          )}
          <View style={[
            styles.uploadContainer,
            !uploadedImageUrl && styles.placeholderContainer
          ]}>
            <ProfileImageUpload
              onImageUploaded={handleImageUploaded}
              initialImage={uploadedImageUrl || undefined}
              type="cover"
            />
          </View>
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={Colors.dark.purple} />
              <ThemedText style={styles.uploadingText}>Uploading...</ThemedText>
            </View>
          )}
          {error && (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
            pointerEvents="none"
          />
          <View style={styles.textOverlay}>
            <ThemedText style={styles.artistName}>{name || 'ARTIST NAME'}</ThemedText>
            <ThemedText style={styles.artistMeta}>{(genre || 'GENRE') + '  |  ' + (location || 'LOCATION')}</ThemedText>
          </View>
        </View>
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
  },
  contentContainer: {
    flex: 1,
  },
  coverPhotoContainer: {
    width: '100%',
    height: screenHeight * 0.7,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.dark.darkGrey,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  uploadContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: 3,
  },
  uploadingText: {
    marginTop: 10,
    color: Colors.dark.text,
  },
  errorText: {
    color: Colors.dark.error,
    marginTop: 10,
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
    top: '50%',
    zIndex: 3,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    zIndex: 1,
  },
  textOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    zIndex: 2,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artistMeta: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  titlePadding: {
    marginBottom: 10,
  },
  subtitlePadding: {
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
}); 