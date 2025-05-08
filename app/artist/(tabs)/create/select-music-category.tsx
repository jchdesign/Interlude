import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { PostButton } from '@/components/PostButton';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { createPostFromTemporary, TemporaryPostData } from '@/firestore';

export default function AddMusic() {
  const router = useRouter();
  const [postData, setPostData] = useState<TemporaryPostData>({
    type: 'music',
    content: '',
  });

  const handleSubmit = async () => {
    try {
      await createPostFromTemporary(postData);
      // Navigate back to the create tab after successful post creation
      router.back();
    } catch (error) {
      console.error('Error creating post:', error);
      // Handle error (show error message to user)
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="h3" style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="h1" style={styles.title}>Add Music</ThemedText>
        <View style={styles.placeholder} />
      </View>
      <ThemedText style={styles.subtitle}>
        Create Music Pages on your profile dedicated to your release and put your songs into our recommendation system for listeners.
      </ThemedText>
      <View style={styles.buttonGroup}>
        <PostButton
          icon="music-note"
          title="Song"
          subtitle="Add one standalone song release"
          onPress={() => {
            setPostData(prev => ({ ...prev, category: 'song' }));
            router.push('./add-music?category=song');
          }}
        />
        <PostButton
          icon="album"
          title="Album/EP"
          subtitle="Create a collection of songs"
          onPress={() => {
            setPostData(prev => ({ ...prev, category: 'album' }));
            // Navigate to album upload screen
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    flex: 1,
  },
  backText: {
    color: Colors.dark.shayla,
    fontWeight: '600',
  },
  title: {
    flex: 2,
    textAlign: 'center',
    color: Colors.dark.text,
  },
  placeholder: {
    flex: 1,
  },
  subtitle: {
    color: Colors.dark.textGrey,
    textAlign: 'left',
    marginBottom: 32,
  },
  buttonGroup: {
  },
}); 