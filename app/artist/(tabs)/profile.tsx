import { StyleSheet, Dimensions, View, Text, ScrollView, Image, Platform, ImageBackground, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/Colors';

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
  location?: { name: string; coordinates?: any };
  bio: string;
  coverPhoto: string;
  additionalPhotos: string[];
  fans: string[];
  following: string[];
  featured_post?: any;
  spotify_external_url: string;
  links?: Record<string, string>;
}

// Map of link keys to Material Community Icons
const LINK_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  spotify: 'spotify',
  instagram: 'instagram',
  twitter: 'twitter',
  facebook: 'facebook',
  youtube: 'youtube',
  soundcloud: 'music-circle',
  apple: 'apple',
  tiktok: 'video',
  website: 'web',
  bandcamp: 'music-circle',
};

export default function Profile() {
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [additionalPhotosUrls, setAdditionalPhotosUrls] = useState<string[]>([]);
  const [fansCount, setFansCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

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
        const artistDoc = await getDoc(doc(db, 'users', user.uid));
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

        // Fetch fans count from 'fans' collection
        const fansQuery = query(collection(db, 'fans'), where('artist_id', '==', user.uid));
        const fansSnapshot = await getDocs(fansQuery);
        setFansCount(fansSnapshot.size);

        // Fetch following count from 'following' collection
        const followingQuery = query(collection(db, 'following'), where('follower_id', '==', user.uid));
        const followingSnapshot = await getDocs(followingQuery);
        setFollowingCount(followingSnapshot.size);
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
            <ThemedText type='large'>{artistData.location?.name ?? ''}</ThemedText>
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
            <View style={styles.followingContainer}>
              <View style={styles.linkContainer}>
                <ThemedText type='h2'>{fansCount}</ThemedText>
                <ThemedText> Fans</ThemedText>
              </View>
              <View style={styles.linkContainer}>
                <ThemedText type='h2'>{followingCount}</ThemedText>
                <ThemedText> Following</ThemedText>
              </View>
            </View>
            {artistData.links && Object.keys(artistData.links).length > 0 && (
              <View style={styles.socialLinksContainer}>
                {Object.entries(artistData.links).map(([key, url]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.socialIcon}
                    onPress={() => WebBrowser.openBrowserAsync(url)}
                  >
                    <MaterialCommunityIcons
                      name={LINK_ICONS[key] || 'link'}
                      size={36}
                      color={Colors.dark.white}
                      style={{ opacity: 0.8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
    opacity: 0.8,
    flexDirection: 'row',
    alignItems:'flex-end',
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
    flexDirection: 'column',
    gap: 16
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
  },
  socialLinksContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  socialIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
