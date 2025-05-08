import { StyleSheet, Dimensions, View, Text, ScrollView, Image, Platform, ImageBackground, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';
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
import { getUserPosts } from '@/firestore';
import PostContainer from '@/components/PostContainer';
import { PillButton } from '@/components/PillButton';
import { addFan, addFollowing } from '@/firestore';
import MusicCard from '@/components/MusicCard';

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

interface ArtistProfileProps {
  userId: string;
  isOwnProfile: boolean;
  viewerId?: string;
}

export function ArtistProfile({ userId, isOwnProfile, viewerId }: ArtistProfileProps) {
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [additionalPhotosUrls, setAdditionalPhotosUrls] = useState<string[]>([]);
  const [fansCount, setFansCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedMusicTab, setSelectedMusicTab] = useState<'songs' | 'albums'>('songs');
  const [selectedPostTab, setSelectedPostTab] = useState<'behind_scenes' | 'live_event' | 'playlist' | 'merch'>('behind_scenes');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [viewerRole, setViewerRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        // Fetch artist data from Firestore
        const artistDoc = await getDoc(doc(db, 'users', userId));
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
        const fansQuery = query(collection(db, 'fans'), where('artist_id', '==', userId));
        const fansSnapshot = await getDocs(fansQuery);
        setFansCount(fansSnapshot.size);

        // Fetch following count from 'following' collection
        const followingQuery = query(collection(db, 'following'), where('follower_id', '==', userId));
        const followingSnapshot = await getDocs(followingQuery);
        setFollowingCount(followingSnapshot.size);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getUserPosts(userId);
        setPosts(allPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, [userId]);

  useEffect(() => {
    const fetchViewerRoleAndFollow = async () => {
      if (!viewerId || isOwnProfile) return;
      // Fetch viewer role
      const viewerDoc = await getDoc(doc(db, 'users', viewerId));
      if (viewerDoc.exists()) {
        const data = viewerDoc.data();
        setViewerRole(data.role);
        console.log('Viewer role:', data.role);
        // Check if following
        if (data.role === 'listener') {
          const q = query(collection(db, 'fans'), where('artist_id', '==', userId), where('listener_id', '==', viewerId));
          const snap = await getDocs(q);
          const isFollowing = !snap.empty;
          console.log('Listener follow check:', isFollowing);
          setIsFollowing(isFollowing);
        } else if (data.role === 'artist') {
          const q = query(collection(db, 'following'), where('following_id', '==', userId), where('follower_id', '==', viewerId));
          const snap = await getDocs(q);
          const isFollowing = !snap.empty;
          console.log('Artist follow check:', isFollowing);
          setIsFollowing(isFollowing);
        }
      }
    };
    fetchViewerRoleAndFollow();
  }, [viewerId, userId, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!viewerId || !viewerRole) return;
    try {
      if (isFollowing) {
        // Unfollow logic
        if (viewerRole === 'listener') {
          const q = query(collection(db, 'fans'), where('artist_id', '==', userId), where('listener_id', '==', viewerId));
          const snap = await getDocs(q);
          await Promise.all(snap.docs.map(docu => deleteDoc(doc(db, 'fans', docu.id))));
          console.log('Unfollowed as listener');
          setIsFollowing(false);
        } else if (viewerRole === 'artist') {
          // Remove from following
          const q1 = query(collection(db, 'following'), where('following_id', '==', userId), where('follower_id', '==', viewerId));
          const snap1 = await getDocs(q1);
          await Promise.all(snap1.docs.map(docu => deleteDoc(doc(db, 'following', docu.id))));
          // Remove from fans
          const q2 = query(collection(db, 'fans'), where('artist_id', '==', userId), where('listener_id', '==', viewerId));
          const snap2 = await getDocs(q2);
          await Promise.all(snap2.docs.map(docu => deleteDoc(doc(db, 'fans', docu.id))));
          console.log('Unfollowed as artist');
          setIsFollowing(false);
        }
      } else {
        // Follow logic
        if (viewerRole === 'listener') {
          await addFan(viewerId, userId);
          console.log('Followed as listener');
          setIsFollowing(true);
        } else if (viewerRole === 'artist') {
          await addFollowing(viewerId, userId);
          await addFan(viewerId, userId);
          console.log('Followed as artist');
          setIsFollowing(true);
        }
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
      // Optionally show an error to the user
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  if (!artistData) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText>No artist data found</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView>
      <ImageBackground 
        style={styles.profileFull}
        source={coverPhotoUrl ? { uri: coverPhotoUrl } : require("../assets/images/artist/default_cover_image.png")}
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
          {/* PillButton Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              {!isOwnProfile ? (
                <PillButton
                  color={isFollowing ? 'transparent' : Colors.dark.blue}
                  text={isFollowing ? 'Following' : 'Follow'}
                  onPress={handleFollowToggle}
                  style={isFollowing ? {
                    borderWidth: 1,
                    borderColor: Colors.dark.blue,
                    backgroundColor: 'transparent',
                  } : {}}
                  textStyle={isFollowing ? { color: Colors.dark.blue } : {}}
                />
              ) : (
                <PillButton color={Colors.dark.blue} text="Analytics" onPress={() => {}} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              {isOwnProfile ? (
                <PillButton color={Colors.dark.greyMedium} text="Settings" onPress={() => {}} />
              ) : (
                <PillButton color={Colors.dark.greyMedium} text="Share" onPress={() => {}} />
              )}
            </View>
          </View>
        </View>
        {/* MUSIC SECTION */}
        <View style={styles.container}>
          <Header text={"Music"}/>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
            {['songs', 'albums'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.tabButton, selectedMusicTab === type && styles.tabButtonActive]}
                onPress={() => setSelectedMusicTab(type as 'songs' | 'albums')}
              >
                <ThemedText style={[styles.tabText, selectedMusicTab === type && styles.tabTextActive]}>
                  {type === 'songs' ? 'Songs' : 'Albums/EPs'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.musicList}>
            {posts
              .filter(post => post.type === 'music')
              .map((post, index) => (
                <View key={post.id}>
                  <MusicCard songId={post.song_id || post.tag} profile={true} />
                  {index < posts.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
          </View>
        </View>
        {/* POSTS SECTION */}
        <View style={styles.container}>
          <Header text={"Posts"}/>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
            {['behind_scenes', 'live_event', 'playlist', 'merch'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.tabButton, selectedPostTab === type && styles.tabButtonActive]}
                onPress={() => setSelectedPostTab(type as any)}
              >
                <ThemedText style={[styles.tabText, selectedPostTab === type && styles.tabTextActive]}>
                  {type === 'behind_scenes' ? 'BTS' :
                   type === 'live_event' ? 'Live Events' :
                   type === 'playlist' ? 'Playlists' :
                   'Merch'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.postsList}>
            <PostContainer posts={posts} filter={post => post.type === selectedPostTab} />
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
    gap: 50,
    backgroundColor: Colors.dark.background,
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
    height: screenHeight - 80,
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
    paddingRight: 24,
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
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    paddingHorizontal: 4,
    columnGap: 24,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.dark.blue,
  },
  tabText: {
    color: Colors.dark.textGrey,
    fontSize: 18,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.dark.blue,
  },
  postsList: {
    gap: 24,
  },
  musicList: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.textGrey,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.textGrey,
    gap: 8,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.textGrey,
    marginVertical: 8,
  },
}); 