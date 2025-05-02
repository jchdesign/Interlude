import { StyleSheet, Dimensions, View, Text, ScrollView, Image, Platform, ImageBackground } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ImageCarousel } from '@/components/ImageCarousel';
import { Header } from '@/components/Header';
import { Link } from 'expo-router';
import Post from '@/components/Post';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

interface ArtistData {
  name: string;
  genre: string;
  location: string;
  bio: string;
  coverPhoto: string;
  additionalPhotos: string[];
  followers: string[];
  following: string[];
  featured_post?: any;
  spotify_external_url: string;
}

export default function Profile() {
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [additionalPhotosUrls, setAdditionalPhotosUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.error('No user logged in');
          return;
        }

        // Fetch artist data from Firestore
        const artistDoc = await getDoc(doc(db, 'artists', user.uid));
        if (artistDoc.exists()) {
          const data = artistDoc.data() as ArtistData;
          setArtistData(data);

          // Fetch cover photo URL
          if (data.coverPhoto) {
            const storage = getStorage();
            const coverPhotoRef = ref(storage, data.coverPhoto);
            const url = await getDownloadURL(coverPhotoRef);
            setCoverPhotoUrl(url);
          }

          // Fetch additional photos URLs
          if (data.additionalPhotos && data.additionalPhotos.length > 0) {
            const storage = getStorage();
            const urls = await Promise.all(
              data.additionalPhotos.map(async (photoPath) => {
                const photoRef = ref(storage, photoPath);
                return await getDownloadURL(photoRef);
              })
            );
            setAdditionalPhotosUrls(urls);
          }
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!artistData) {
    return (
      <View style={styles.errorContainer}>
        <Text>No artist data found</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <ImageBackground 
        style={styles.profileFull}
        source={coverPhotoUrl ? { uri: coverPhotoUrl } : require("../../../assets/images/artist/cover_image.png")}
      >
        <View style={styles.container}>
          <View style={styles.artistNameWrapper}>
            <ThemedText style={styles.artistName}>
              {artistData.name}
            </ThemedText>
          </View>
          <View style={styles.artistInfoWrapper}>
            <ThemedText type='large'>{artistData.genre}</ThemedText>
            <ThemedText type='large'>  |  </ThemedText>
            <ThemedText type='large'>{artistData.location}</ThemedText>
          </View>
        </View>
      </ImageBackground>
      <ImageCarousel
        images={additionalPhotosUrls.length > 0 ? additionalPhotosUrls : [
          "https://picsum.photos/200",
          "https://picsum.photos/200",
          "https://picsum.photos/200",
          "https://picsum.photos/200"
        ]}
      />
      <View style={styles.contentContainer}>
        <View style={styles.container}>
          <Header text={"About"}/>
          <View style={styles.bioContainer}>
            <ThemedText>{artistData.bio}</ThemedText>
          </View>
          <View style={styles.followingContainer}>
            <View style={styles.linkContainer}>
              {/* <ThemedText type='h2'>{artistData.followers.length}</ThemedText> */}
              <ThemedText>  Followers</ThemedText>
            </View>
            <View style={styles.linkContainer}>
              <ThemedText type='h2'>{artistData.following.length}</ThemedText>
              <ThemedText>  Following</ThemedText>
            </View>
          </View>
          <View style={styles.followingContainer}>
            <View style={styles.linkContainerMusic}>
              <ThemedText>Spotify</ThemedText>
            </View>
            <View style={styles.linkContainerMusic}>
              <ThemedText>Apple Music</ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.container}>
          <Header text={"Featured"}/>
          {artistData.featured_post && <Post content={artistData.featured_post}/>}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 24,
    gap: 24
  },
  contentContainer: {
    gap: 50
  },
  followingContainer: {
    flexDirection: 'row',
    gap: 20
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems:'flex-end'
  },
  linkContainerMusic: {
    flexDirection: 'row',
    alignItems:'center',
    alignSelf: 'flex-start',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'white'
  },
  profileFull: {
    height: screenHeight - 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  bioContainer: {
    backgroundColor: '#4A469875',
    padding: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  artistInfoWrapper: {
    backgroundColor: '#4A469899',
    padding: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  artistNameWrapper: {
    backgroundColor: '#78376299',
    padding: 12,
    alignSelf: 'flex-start',
    flexDirection: 'column',
    maxWidth: '100%',
  },
  artistName: {
    fontSize: 64,
    fontStyle: 'italic',
    fontWeight: '600',
    color: 'white',
    lineHeight: 72,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
  }
});
