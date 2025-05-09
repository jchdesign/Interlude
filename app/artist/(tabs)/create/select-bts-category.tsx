import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { PostButton } from '@/components/PostButton';
import { Colors } from '@/constants/Colors';
import { ChatBubbleLeftIcon, DocumentTextIcon, VideoCameraIcon, MicrophoneIcon, EllipsisHorizontalIcon } from 'react-native-heroicons/outline';

// Friendly display names for types and categories
const TYPE_LABELS: Record<string, string> = {
  music: 'Music',
  behind_scenes: 'Behind the Scenes',
  live_event: 'Live Event',
  playlist: 'Playlist',
  merch: 'Merch',
};

const CATEGORY_LABELS: Record<string, string> = {
  messages: 'Artist Message',
  articles: 'Articles and Blogs',
  video: 'Video Check-In',
  interviews: 'Interviews',
  more: 'More',
};

const BTS_CATEGORIES = [
  {
    icon: 'message-outline',
    title: CATEGORY_LABELS['messages'],
    subtitle: 'Hand written notes for your listeners.',
    category: 'messages',
  },
  {
    icon: 'file-document-outline',
    title: CATEGORY_LABELS['articles'],
    subtitle: "Share where you've been featured.",
    category: 'articles',
  },
  {
    icon: 'video-outline',
    title: CATEGORY_LABELS['video'],
    subtitle: 'Any clip from your musical life.',
    category: 'video',
  },
  {
    icon: 'account-voice',
    title: CATEGORY_LABELS['interviews'],
    subtitle: "Let's hear it from you.",
    category: 'interviews',
  },
  {
    icon: 'dots-horizontal',
    title: CATEGORY_LABELS['more'],
    subtitle: 'Anything we missed.',
    category: 'more',
  },
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'message-outline': ChatBubbleLeftIcon,
  'file-document-outline': DocumentTextIcon,
  'video-outline': VideoCameraIcon,
  'account-voice': MicrophoneIcon,
  'dots-horizontal': EllipsisHorizontalIcon,
};

export default function SelectBTSCategory() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type || 'behind_scenes';

  const handleCategorySelect = (category: string) => {
    // Navigate to the next page, passing type and category
    router.push({ pathname: './add-post', params: { type, category } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <ThemedText type='h3' style={styles.back} onPress={() => router.back()}>Back</ThemedText>
        <ThemedText type='h2' style={styles.header}>Select Category</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>Share something about you.</ThemedText>
      {BTS_CATEGORIES.map((cat) => (
        <PostButton
          key={cat.category}
          icon={ICON_MAP[cat.icon]}
          title={cat.title}
          subtitle={cat.subtitle}
          onPress={() => handleCategorySelect(cat.category)}
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