import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import MusicCard from '@/components/MusicCard';
import { Colors } from '@/constants/Colors';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useCreateMusic } from './CreateMusicContext';
import { getAuth } from 'firebase/auth';

export default function SelectMusicForPost() {
  const router = useRouter();
  const { updatePostData } = useCreateMusic();
  const [musicList, setMusicList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const db = getFirestore();
        const q = query(collection(db, 'songs'), where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);
        setMusicList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setMusicList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, []);

  const handleSelect = (songId: string) => {
    updatePostData({ tag: songId, type: 'music' });
    router.push('/artist/(tabs)/create/select-music-post-category');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <ThemedText type='h3' style={styles.back} onPress={() => router.back()}>Back</ThemedText>
        <ThemedText type='h2' style={styles.header}>Select Music</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>Pick a song to feature in your post.</ThemedText>
      <View style={styles.musicListWrapper}>
        {musicList.length === 0 && !loading && (
          <ThemedText>No music found.</ThemedText>
        )}
        {musicList.map((music, idx) => (
          <View key={music.id}>
            <View style={styles.musicCardContainer}>
              <MusicCard songId={music.id} profile={true} onPress={() => handleSelect(music.id)} />
            </View>
            {idx < musicList.length - 1 && (
              <View style={styles.divider} />
            )}
          </View>
        ))}
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  musicListWrapper: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.dark.textGrey,
    marginTop: 8,
    marginBottom: 8,
  },
  musicCardContainer: {
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.textGrey,
    marginVertical: 8,
  },
}); 