import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { PostButton } from '@/components/PostButton';
import { Colors } from '@/constants/Colors';
import { useCreateMusic } from './CreateMusicContext';

const MUSIC_CATEGORIES = [
  {
    icon: 'music-note-outline',
    title: 'Story Behind the Music',
    subtitle: 'Share the inspiration or process.',
    category: 'story',
  },
  {
    icon: 'music-circle-outline',
    title: 'Unreleased Demos',
    subtitle: 'Share demos and works in progress.',
    category: 'unreleased',
  },
  {
    icon: 'video-outline',
    title: 'Videos',
    subtitle: 'Music videos, live sessions, and more.',
    category: 'videos',
  },
  {
    icon: 'playlist-music-outline',
    title: 'Playlists',
    subtitle: 'Curate and share playlists.',
    category: 'playlists',
  },
  {
    icon: 'account-voice',
    title: 'Interviews',
    subtitle: 'Share interviews and Q&As.',
    category: 'interviews',
  },
  {
    icon: 'dots-horizontal',
    title: 'More',
    subtitle: 'Anything we missed.',
    category: 'more',
  },
];

export default function SelectMusicPostCategory() {
  const router = useRouter();
  const { updatePostData } = useCreateMusic();

  const handleCategorySelect = (category: string, title: string) => {
    updatePostData({ category: title });
    router.push({ pathname: './add-post', params: { type: 'music', category: title } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <ThemedText type='h3' style={styles.back} onPress={() => router.back()}>Back</ThemedText>
        <ThemedText type='h2' style={styles.header}>Select Category</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>What kind of music post is this?</ThemedText>
      {MUSIC_CATEGORIES.map((cat) => (
        <PostButton
          key={cat.category}
          icon={cat.icon as any}
          title={cat.title}
          subtitle={cat.subtitle}
          onPress={() => handleCategorySelect(cat.category, cat.title)}
        />
      ))}
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
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 16,
  },
  back: {
    color: Colors.dark.shayla,
    marginRight: 16,
  },
  subtitle: {
    color: Colors.dark.textGrey,
    marginBottom: 16,
    marginLeft: 2,
  },
}); 