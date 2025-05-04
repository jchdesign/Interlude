import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { GeneralSearch } from '@/components/GeneralSearch';
import { FilteredGrid } from '@/components/FilteredGrid';
import { collection, getDocs } from 'firebase/firestore';
import { db, updateProfileFields } from '@/firestore';

interface Mood {
  id: string;
  name: string;
}

export default function MoodsScreen() {
  const [allMoods, setAllMoods] = useState<Mood[]>([]);
  const [filteredMoods, setFilteredMoods] = useState<Mood[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all moods when component mounts
  useEffect(() => {
    const fetchAllMoods = async () => {
      try {
        const moodsRef = collection(db, 'moods');
        const snapshot = await getDocs(moodsRef);
        const moods = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1)
        }));
        setAllMoods(moods);
        setFilteredMoods(moods);
      } catch (error) {
        console.error('Error fetching moods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMoods();
  }, []);

  const searchMoods = async (searchQuery: string): Promise<Mood[]> => {
    if (!searchQuery.trim()) {
      return allMoods;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    return allMoods.filter(mood => 
      mood.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  const handleNext = async () => {
    try {
      await updateProfileFields({
        moods: selectedMoods
      });
      router.push('/(onboarding)/listener/follow-artists' as const);
    } catch (error) {
      console.error('Error saving moods:', error);
      alert('Failed to save mood preferences. Please try again.');
    }
  };

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId)
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading moods...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Let's set the mood. Select your top vibes.</ThemedText>
      
      <GeneralSearch<Mood>
        onSearch={searchMoods}
        onResultsChange={setFilteredMoods}
        initialData={allMoods}
        placeholder="Search moods..."
      />
      
      <FilteredGrid<Mood>
        data={filteredMoods}
        selectedItems={selectedMoods}
        onItemSelect={toggleMood}
        type="mood"
        renderLabel={(mood) => mood.name}
        getId={(mood) => mood.id}
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