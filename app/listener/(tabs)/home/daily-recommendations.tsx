import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import MusicCard from '@/components/MusicCard';
import { Colors } from '@/constants/Colors';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function DailyRecommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, 'songs'));
        const allSongs = snapshot.docs.map(doc => doc.id);
        for (let i = allSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
        }
        setRecommendations(allSongs.slice(0, 5));
      } catch (e) {
        setRecommendations([]);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeftIcon size={28} color={Colors.dark.white} />
        </TouchableOpacity>
        <ThemedText type="large" style={styles.title}>Daily Recommendations</ThemedText>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 32 }}>
        {recommendations.map(songId => (
          <View key={songId} style={styles.cardWrapper}>
            <MusicCard songId={songId} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    color: Colors.dark.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  cardWrapper: {
    marginBottom: 12,
  },
}); 