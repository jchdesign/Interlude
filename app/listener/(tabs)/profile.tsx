import { StyleSheet, Dimensions, View, ScrollView, Image, Platform, ImageBackground } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
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

interface ListenerData {
  name: string;
  bio: string;
  profilePicture?: string;
  username?: string;
}

export default function Profile() {
  const [listenerData, setListenerData] = useState<ListenerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchListenerData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        // Fetch listener data from users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setListenerData({
            name: data.name || '',
            bio: data.bio || '',
            profilePicture: data.profilePicture || undefined,
            username: data.username || '',
          });
        }

        // Fetch friends count (where user is involved)
        const friendsQuery = query(collection(db, 'friends'), where('users', 'array-contains', user.uid));
        const friendsSnapshot = await getDocs(friendsQuery);
        setFriendsCount(friendsSnapshot.size);

        // Fetch following count (where user is the follower)
        const followingQuery = query(collection(db, 'following'), where('follower_id', '==', user.uid));
        const followingSnapshot = await getDocs(followingQuery);
        setFollowingCount(followingSnapshot.size);
      } catch (error) {
        console.error('Error fetching listener data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListenerData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  if (!listenerData) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText>No listener data found</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: Colors.dark.background }}>
      <View style={styles.topSection}>
        <View style={styles.purpleBg} />
        <View style={styles.profilePicWrapper}>
          {listenerData.profilePicture ? (
            <Image source={{ uri: listenerData.profilePicture }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, styles.profilePicPlaceholder]} />
          )}
        </View>
      </View>
      <View style={styles.container}>
        <ThemedText style={styles.name}>{listenerData.name}</ThemedText>
        <View style={styles.bioSection}>
          <ThemedText type='small' style={styles.username}>@{listenerData.username}</ThemedText>
          <ThemedText style={styles.bio}>{listenerData.bio}</ThemedText>
          <View style={styles.countsRow}>
            <ThemedText style={styles.countText}>{friendsCount} friends </ThemedText>
            <ThemedText style={styles.countText}>{followingCount} following</ThemedText>
          </View>
        </View>
        {/* Add more profile sections here as needed */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
    paddingRight: 24,
    paddingLeft: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 60, // space for the overlap
  },
  purpleBg: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: Colors.dark.purple,
  },
  profilePicWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -60, // half of profilePic height
    alignItems: 'center',
    zIndex: 2,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: Colors.dark.textGrey,
  },
  profilePicPlaceholder: {
    backgroundColor: Colors.dark.textGrey,
  },
  bioSection: {
    alignItems: 'flex-start',
    paddingTop: 12, // space for the overlap
    paddingBottom: 32,
    backgroundColor: Colors.dark.background,
  },
  name: {
    paddingTop: 12,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  bio: {
    fontSize: 16,
    color: Colors.dark.white,
    marginBottom: 16,
    textAlign: 'left',
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  countText: {
    color: Colors.dark.textGrey,
    fontSize: 15,
    fontWeight: '400',
  },
  username: {
    color: Colors.dark.textGrey,
    marginBottom: 10,
  },
});
