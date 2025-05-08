import { StyleSheet, View, ScrollView } from 'react-native';
import { PostButton } from '@/components/PostButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TemporaryPostData } from '@/firestore';

export default function Create() {
  const router = useRouter();
  const [temporaryPost, setTemporaryPost] = useState<TemporaryPostData>({
    type: 'music',
    content: '',
  });

  const handlePostTypeSelect = (type: TemporaryPostData['type'], mode?: string) => {
    setTemporaryPost(prev => ({ ...prev, type }));
    if (type === 'music' && mode === 'add') {
      router.push({ pathname: '/artist/(tabs)/create/select-music-category', params: { type: 'music' } });
    } else if (type === 'music' && mode === 'post_to_page') {
      router.push({ pathname: '/artist/(tabs)/create/select-music-for-post', params: { type: 'music' } });
    } else if (type === 'behind_scenes') {
      router.push({ pathname: '/artist/(tabs)/create/select-bts-category', params: { type: 'behind_scenes' } });
    } else if (type === 'playlist') {
      router.push({ pathname: '/artist/(tabs)/create/add-playlist', params: { type: 'playlist' } });
    } else if (type === 'live_event') {
      router.push({ pathname: '/artist/(tabs)/create/add-live-event', params: { type: 'live_event' } });
    } else if (type === 'merch') {
      router.push({ pathname: '/artist/(tabs)/create/add-merch', params: { type: 'merch' } });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type='h1' style={{marginBottom: 36}}>Create Post</ThemedText>
      <ThemedText type='h3' style={{marginBottom: 12}}>Share Something About Your Music</ThemedText>
      <PostButton
        icon="plus"
        title="Add Music"
        subtitle="Add new music to your profile"
        onPress={() => handlePostTypeSelect('music', 'add')}
      />
      <PostButton
        icon="message-outline"
        title="Post to Music Page"
        subtitle="Feature demos, videos, and song breakdowns of your releases"
        onPress={() => handlePostTypeSelect('music', 'post_to_page')}
      />
      <ThemedText type='h3' style={{marginBottom: 12, marginTop: 24}}>Share Something About You</ThemedText>
      <PostButton
        icon="account"
        title="Behind the Scenes"
        subtitle="Share daily check-ins, interviews, articles, and anything about you"
        onPress={() => handlePostTypeSelect('behind_scenes')}
      />
      <PostButton
        icon="repeat"
        title="Playlist"
        subtitle="A collection of songs for any occasion"
        onPress={() => handlePostTypeSelect('playlist')}
      />
      <PostButton
        icon="bell-outline"
        title="Live Event"
        subtitle="Shout out your live event"
        onPress={() => handlePostTypeSelect('live_event')}
      />
      <PostButton
        icon="chevron-right"
        title="Merch"
        subtitle="Let your circle know about your swag"
        onPress={() => handlePostTypeSelect('merch')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 28,
    marginTop: 8,
  },
  section: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 18,
    marginBottom: 8,
  },
}); 