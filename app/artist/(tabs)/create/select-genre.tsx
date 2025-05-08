import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { GeneralSearch } from '@/components/GeneralSearch';
import { FilteredGrid } from '@/components/FilteredGrid';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useCreateMusic } from './CreateMusicContext';

export default function SelectGenre() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { songData, updateSongData } = useCreateMusic();

  const selected = songData.genre;

  const [search, setSearch] = useState('');
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, 'genres'));
        const genres = snapshot.docs.map(doc => doc.id);
        setAllGenres(genres);
      } catch (e) {
        setAllGenres([]);
      }
      setLoading(false);
    };
    fetchGenres();
  }, []);

  const filteredGenres = useMemo(() => {
    if (!search) return allGenres;
    return allGenres.filter(g => g.toLowerCase().includes(search.toLowerCase()));
  }, [search, allGenres]);

  const handleToggle = (genre: string) => {
    const newSelected = selected.includes(genre) ? selected.filter(g => g !== genre) : [...selected, genre];
    updateSongData({ genre: newSelected });
  };

  const handleSave = () => {
    router.replace({ pathname: './add-music' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText type="h3" style={styles.cancel}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <ThemedText type="h3" style={styles.save}>Save</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="h2" style={styles.title}>Select Genre</ThemedText>
      <ThemedText style={styles.subtitle}>Pick a couple of genres to describe your music.</ThemedText>
      <GeneralSearch
        onSearch={async (query) => {
          if (!query) return allGenres;
          return allGenres.filter(g => g.toLowerCase().includes(query.toLowerCase()));
        }}
        onResultsChange={setAllGenres}
        initialData={allGenres}
        placeholder="Search"
      />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.pink} style={{ marginTop: 32 }} />
      ) : (
        <FilteredGrid
          data={filteredGenres}
          selectedItems={selected}
          onItemSelect={handleToggle}
          type="genre"
          columns={2}
          renderLabel={item => item}
          getId={item => item}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cancel: {
    color: Colors.dark.shayla,
  },
  save: {
    color: Colors.dark.shayla,
  },
  title: {
    color: Colors.dark.text,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.dark.textGrey,
    marginBottom: 16,
  },
}); 