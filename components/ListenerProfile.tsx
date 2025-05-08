import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/firestore';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface ListenerProfileProps {
  userId: string;
  isOwnProfile: boolean;
  viewerId?: string;
}

interface ListenerData {
  name: string;
  bio: string;
  profilePicture?: string;
  username?: string;
}

export default function ListenerProfile({ userId, isOwnProfile, viewerId }: ListenerProfileProps) {
  const [listenerData, setListenerData] = useState<ListenerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchListenerData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setListenerData({
            name: data.name || '',
            bio: data.bio || '',
            profilePicture: data.profilePicture || undefined,
            username: data.username || '',
          });
        }
        // Fetch friends count
        const friendsQuery = query(collection(db, 'friends'), where('users', 'array-contains', userId));
        const friendsSnapshot = await getDocs(friendsQuery);
        setFriendsCount(friendsSnapshot.size);
        // Fetch following count
        const followingQuery = query(collection(db, 'following'), where('follower_id', '==', userId));
        const followingSnapshot = await getDocs(followingQuery);
        setFollowingCount(followingSnapshot.size);
        // Fetch viewer role if viewerId is present
        if (viewerId) {
          const viewerDoc = await getDoc(doc(db, 'users', viewerId));
          if (viewerDoc.exists()) {
            setViewerRole(viewerDoc.data().role);
          }
        }
        // Check if viewer is already a friend
        if (viewerId && viewerId !== userId) {
          const friendsQuery = query(collection(db, 'friends'), where('users', 'array-contains', viewerId));
          const friendsSnapshot = await getDocs(friendsQuery);
          const isFriend = friendsSnapshot.docs.some(docu => {
            const users = docu.data().users || [];
            return users.includes(userId) && users.includes(viewerId);
          });
          setIsFriend(isFriend);
        }
      } catch (error) {
        console.error('Error fetching listener data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListenerData();
  }, [userId, viewerId]);

  const handleAddFriend = async () => {
    if (!viewerId || isOwnProfile) return;
    try {
      // Add a new friend document with both user IDs
      await setDoc(doc(collection(db, 'friends')), {
        users: [userId, viewerId],
        createdAt: new Date(),
      });
      setIsFriend(true);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

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
          {isOwnProfile && (
            <TouchableOpacity style={styles.editIcon} onPress={() => {/* trigger edit profile */}}>
              <Ionicons name="create-outline" size={28} color={Colors.dark.textGrey} />
            </TouchableOpacity>
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
          {/* Show Add Friend/Share if viewer is another listener and not own profile */}
          {viewerRole === 'listener' && !isOwnProfile && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, isFriend && styles.actionButtonDisabled]}
                onPress={handleAddFriend}
                disabled={isFriend}
              >
                <ThemedText style={styles.actionButtonText}>{isFriend ? 'Friends' : 'Add Friend'}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => {/* share logic */}}>
                <ThemedText style={styles.actionButtonText}>Share</ThemedText>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: 60,
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
    bottom: -60,
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
  editIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    padding: 4,
    zIndex: 3,
  },
  container: {
    backgroundColor: Colors.dark.background,
    paddingRight: 24,
    paddingLeft: 24,
  },
  name: {
    paddingTop: 12,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  bioSection: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: Colors.dark.background,
  },
  username: {
    color: Colors.dark.textGrey,
    marginBottom: 10,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: Colors.dark.blue,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.dark.greyMedium,
  },
  actionButtonText: {
    color: Colors.dark.white,
    fontWeight: '600',
    fontSize: 16,
  },
}); 