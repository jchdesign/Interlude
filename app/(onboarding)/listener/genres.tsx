import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { GeneralSearch } from '@/components/GeneralSearch';
import { FilteredGrid } from '@/components/FilteredGrid';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, updateProfileFields, setListenerVector } from '@/firestore';
import { getAuth } from 'firebase/auth';

interface Genre {
  id: string;
  name: string;
}

export default function GenresScreen() {
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [filteredGenres, setFilteredGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all genres when component mounts
  useEffect(() => {
    const fetchAllGenres = async () => {
      try {
        const genresRef = collection(db, 'genres');
        const snapshot = await getDocs(genresRef);
        const genres = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1)
        }));
        setAllGenres(genres);
        setFilteredGenres(genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllGenres();
  }, []);

  const searchGenres = async (searchQuery: string): Promise<Genre[]> => {
    if (!searchQuery.trim()) {
      return allGenres;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    return allGenres.filter(genre => 
      genre.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  const handleNext = async () => {
    try {
      // Get all genres to create a complete vector
      const genresRef = collection(db, 'genres');
      const snapshot = await getDocs(genresRef);
      const allGenreIds = snapshot.docs.map(doc => doc.id);
      
      // Create vector with 1.0 for selected genres and 0 for others
      const vector: Record<string, number> = {};
      allGenreIds.forEach(genreId => {
        vector[genreId] = selectedGenres.includes(genreId) ? 1.0 : 0;
      });

      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      // Update user profile with favorite genres
      await updateProfileFields({
        favoriteGenres: selectedGenres
      });

      // Update listener vector
      await setListenerVector(currentUser.uid, vector);

      router.push('/(onboarding)/listener/moods' as const);
    } catch (error) {
      console.error('Error saving genres:', error);
      alert('Failed to save genre preferences. Please try again.');
    }
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading genres...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Let's start by picking some genres.</ThemedText>
      
      <GeneralSearch<Genre>
        onSearch={searchGenres}
        onResultsChange={setFilteredGenres}
        initialData={allGenres}
        placeholder="Search genres..."
      />
      
      <FilteredGrid<Genre>
        data={filteredGenres}
        selectedItems={selectedGenres}
        onItemSelect={toggleGenre}
        type="genre"
        renderLabel={(genre) => genre.name}
        getId={(genre) => genre.id}
      />

      <View style={styles.navigation}>
        <ButtonNav onPress={() => router.back()} forward={false} />
        <ButtonNav onPress={handleNext} forward={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titlePadding: {
    paddingBottom: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
}); 