import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import MusicCard from './MusicCard';

type Props = {
    content: any
}

// Friendly display names for types and categories
const TYPE_LABELS: Record<string, string> = {
  music: 'Music',
  behind_scenes: 'Behind the Scenes',
  live_event: 'Live Event',
  playlist: 'Playlist',
  merch: 'Merch',
};

const CATEGORY_LABELS: Record<string, string> = {
  messages: 'Aritst Message',
  articles: 'Articles and Blogs',
  interviews: 'Interviews',
  shitpost: 'Shitpost',
  more: 'More',
  story: 'Story Behind the Music',
  unreleased: 'Unreleased Demos',
  videos: 'Videos',
  playlists: 'Playlists',
  more_music: 'More',
};

const MAX_LINES = 5;
const SHOW_MORE_CHAR_LIMIT = 200;

export default function Post({ content }: Props) {
  const [userName, setUserName] = useState<string>('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Fetch user name and profile picture from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!content.user_id) return;
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', content.user_id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || content.user_id);
          if (data.profilePicture) {
            try {
              const storage = getStorage();
              const url = await getDownloadURL(ref(storage, data.profilePicture));
              setProfilePicUrl(url);
            } catch (e) {
              setProfilePicUrl(null);
            }
          } else {
            setProfilePicUrl(null);
          }
        } else {
          setUserName(content.user_id);
          setProfilePicUrl(null);
        }
      } catch (e) {
        setUserName(content.user_id);
        setProfilePicUrl(null);
      }
    };
    fetchUserData();
  }, [content.user_id]);

  // If the post has an image, get its aspect ratio
  useEffect(() => {
    if (content.media && !content.media.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
      Image.getSize(
        content.media,
        (width, height) => setImageAspectRatio(width / height),
        () => setImageAspectRatio(undefined)
      );
    }
  }, [content.media]);

  // Format date if present
  let dateString = '';
  if (content.created_at) {
    let date;
    if (typeof content.created_at === 'string') {
      date = new Date(content.created_at);
    } else if (content.created_at && typeof content.created_at.toDate === 'function') {
      date = content.created_at.toDate();
    } else {
      date = content.created_at;
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    if (diffMins < 60) {
      dateString = `${diffMins <= 0 ? 1 : diffMins} minute${diffMins === 1 ? '' : 's'}`;
    } else if (diffHours < 24) {
      dateString = `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    } else if (diffDays < 7) {
      dateString = `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    } else if (diffWeeks < 4) {
      dateString = `${diffWeeks} week${diffWeeks === 1 ? '' : 's'}`;
    } else if (diffMonths < 12) {
      dateString = `${diffMonths} month${diffMonths === 1 ? '' : 's'}`;
    } else {
      dateString = `${diffYears} year${diffYears === 1 ? '' : 's'}`;
    }
  }

  const captionText = content.content || content.caption || '';
  const shouldShowMoreButton = captionText.length > SHOW_MORE_CHAR_LIMIT;

  return (
    <View style={styles.postContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/profile/[id]', params: { id: content.user_id } })}>
          <Image
            style={styles.profilePicture}
            source={profilePicUrl ? { uri: profilePicUrl } : require('@/assets/images/default_profile.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/profile/[id]', params: { id: content.user_id } })}>
          <ThemedText type='large' style={styles.userName}>{userName}</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.categoryDateRow}>
        <View style={styles.categoryTag}>
          <ThemedText style={styles.categoryTagText}>{TYPE_LABELS[content.type] || capitalize(content.type)}</ThemedText>
          {content.category && (
            <>
              <View style={styles.verticalDivider} />
              <ThemedText style={styles.categoryTagText}>
                {CATEGORY_LABELS[content.category] || capitalize(content.category)}
              </ThemedText>
            </>
          )}
        </View>
        <ThemedText style={styles.time}>{dateString}</ThemedText>
      </View>
      <View style={styles.captionContainer}>
        <ThemedText 
          style={styles.caption} 
          numberOfLines={isExpanded ? undefined : MAX_LINES}
        >
          {captionText}
        </ThemedText>
        {shouldShowMoreButton && (
          <TouchableOpacity 
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.moreButtonContainer}
          >
            <ThemedText style={styles.moreButton}>
              {isExpanded ? 'Show less' : 'Show more'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
      {content.media && (
        content.media.match(/\.(mp4|mov|avi|mkv|webm)$/i)
          ? <Video source={{ uri: content.media }} style={styles.mediaImage} useNativeControls resizeMode={ResizeMode.COVER} />
          : <Image style={[styles.mediaImage, imageAspectRatio ? { aspectRatio: imageAspectRatio } : { height: 200 }]} source={{ uri: content.media }} resizeMode="contain" />
      )}
      {/* Show MusicCard if post is of type 'music' and has a tag or song_id */}
      {content.type === 'music' && (content.tag || content.song_id) && (
        <MusicCard songId={content.tag || content.song_id} />
      )}
      <View style={styles.interactionBar}>
        <MaterialCommunityIcons name="heart-outline" size={28} color={Colors.dark.white} />
        <MaterialCommunityIcons name="comment-outline" size={28} color={Colors.dark.white} />
        <MaterialCommunityIcons name="send" size={28} color={Colors.dark.white} />
        <MaterialCommunityIcons name="repeat-variant" size={28} color={Colors.dark.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    flexDirection: 'column',
    gap: 16,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E1E1E1',
  },
  userName: {
    flexShrink: 1,
  },
  categoryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.dark.pink,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTagText: {
    fontSize: 12,
    color: '#D1A5D9',
  },
  time: {
    color: Colors.dark.textGrey,
    textAlign: 'right',
    fontSize: 12,
  },
  captionContainer: {
    marginBottom: 8,
  },
  caption: {
    fontSize: 16,
    color: '#E1E1E1',
    lineHeight: 24,
  },
  mediaImage: {
    width: '100%',
    aspectRatio: undefined,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.textGrey,
    marginTop: 0,
  },
  interactionBar: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.dark.pink,
    marginHorizontal: 8,
  },
  moreButtonContainer: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  moreButton: {
    color: Colors.dark.pink,
    fontSize: 14,
    fontWeight: '500',
  },
});

// Helper function
function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}