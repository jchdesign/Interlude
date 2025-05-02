import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { updateProfileFields } from '@/firestore';
import { useState } from 'react';
import ThemedInput from '@/components/ThemedInput';
import { Colors } from '@/constants/Colors';
import { ThemedSearch } from '@/components/ThemedSearch';
import { collection, query, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '@/firestore';

interface Genre {
  id: string;
  name: string;
}

export default function LocationScreen() {
  const [location, setLocation] = useState('');
  const [genre, setGenre] = useState('');
  const [subgenre, setSubgenre] = useState('');

  const searchGenres = async (searchQuery: string) => {
    try {
      const genresRef = collection(db, 'genres');
      const q = query(
        genresRef,
        orderBy('__name__'),
        startAt(searchQuery),
        endAt(searchQuery + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.id
      }));
    } catch (error) {
      console.error('Error searching genres:', error);
      return [];
    }
  };

  // const searchSubgenres = async (searchQuery: string) => {
  //   try {
  //     const subgenresRef = collection(db, 'subgenres');
  //     const q = query(
  //       subgenresRef,
  //       orderBy('__name__'),
  //       startAt(searchQuery),
  //       endAt(searchQuery + '\uf8ff')
  //     );
  //     const snapshot = await getDocs(q);
  //     return snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       name: doc.id
  //     }));
  //   } catch (error) {
  //     console.error('Error searching subgenres:', error);
  //     return [];
  //   }
  // };

  const handleNext = async () => {
    try {
      await updateProfileFields({
        location,
        genre,
        subgenre
      });
      router.push('/(onboarding)/artist/bio');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile information. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Now, let's build your profile on Interlude.</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, alignItems: 'flex-start' }]}>
        Add some essential details to your profile.
      </ThemedText>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputGroup}>
          <ThemedInput
            placeholder="Enter your location"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <ThemedSearch
            placeholder="Genre"
            value={genre}
            onSearch={searchGenres}
            onItemSelect={(selectedGenre) => {
              console.log('Setting genre to:', selectedGenre.name);
              setGenre(selectedGenre.name);
            }}
            renderItem={(item) => (
              <ThemedText>{item.name}</ThemedText>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedSearch
            placeholder="Subgenre"
            value={subgenre}
            onSearch={searchGenres}
            onItemSelect={(selectedSubgenre) => {
              console.log('Setting subgenre to:', selectedSubgenre.name);
              setSubgenre(selectedSubgenre.name);
            }}
            renderItem={(item) => (
              <ThemedText>{item.name}</ThemedText>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titlePadding: {
    paddingBottom: 10,
  },
  subtitlePadding: {
    paddingBottom: 50,
  },
  inputContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: Colors.dark.textGrey,
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