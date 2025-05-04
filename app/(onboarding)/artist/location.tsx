import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { updateProfileFields } from '@/firestore';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { ThemedSearch } from '@/components/ThemedSearch';
import { collection, query, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '@/firestore';
import Constants from 'expo-constants';
import { getAuth } from 'firebase/auth';
import { setArtistVector } from '@/firestore';

interface Genre {
  id: string;
  name: string;
}

interface LocationResult {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function LocationScreen() {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [genre, setGenre] = useState('');
  const [subgenre, setSubgenre] = useState('');

  const searchGenres = async (searchQuery: string) => {
    try {
      const genresRef = collection(db, 'genres');
      const q = query(
        genresRef,
        orderBy('__name__'),
        startAt(searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1).toLowerCase()),
        endAt((searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1).toLowerCase()) + '\uf8ff')
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

  const searchLocations = async (searchQuery: string): Promise<LocationResult[]> => {
    if (!searchQuery.trim()) return [];
    
    try {
      // Use Firebase Function URL in production, localhost in development
      const baseUrl = __DEV__ 
        ? `http://localhost:5001/${Constants.expoConfig?.extra?.firebaseProjectId}/us-central1/placesProxy`
        : `https://us-central1-${Constants.expoConfig?.extra?.firebaseProjectId}.cloudfunctions.net/placesProxy`;

      console.log('Making request to:', `${baseUrl}?input=${encodeURIComponent(searchQuery)}`);
      const response = await fetch(
        `${baseUrl}?input=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      console.log('Full API response:', data);
      
      if (data.predictions) {
        const results = data.predictions.map((prediction: any) => ({
          id: prediction.place_id,
          name: prediction.description,
          coordinates: { latitude: 0, longitude: 0 } // We'll get these later
        }));
        console.log('Processed results:', results);
        return results;
      }
      console.log('No predictions found in response');
      return [];
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<{ latitude: number; longitude: number }> => {
    try {
      // Use Firebase Function URL in production, localhost in development
      const baseUrl = __DEV__ 
        ? `http://localhost:5001/${Constants.expoConfig?.extra?.firebaseProjectId}/us-central1/placesProxy`
        : `https://us-central1-${Constants.expoConfig?.extra?.firebaseProjectId}.cloudfunctions.net/placesProxy`;

      const response = await fetch(
        `${baseUrl}?type=details&placeId=${placeId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng
        };
      }
      throw new Error('No coordinates found');
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  };

  const handleLocationSelect = async (selectedLocation: LocationResult) => {
    try {
      const coordinates = await getPlaceDetails(selectedLocation.id);
      setLocation({
        ...selectedLocation,
        coordinates
      });
    } catch (error) {
      console.error('Error getting location coordinates:', error);
      alert('Failed to get location coordinates. Please try again.');
    }
  };

  const handleNext = async () => {
    if (!location) {
      alert('Please select a location');
      return;
    }

    try {
      // Get all genres to create a complete vector
      const genresRef = collection(db, 'genres');
      const snapshot = await getDocs(genresRef);
      const allGenreIds = snapshot.docs.map(doc => doc.id);
      
      // Create vector with 1.0 for selected genre and subgenre, 0 for others
      const vector: Record<string, number> = {};
      allGenreIds.forEach(genreId => {
        vector[genreId] = (genreId === genre || genreId === subgenre) ? 1.0 : 0;
      });

      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      // Update user profile with display genre and subgenre
      await updateProfileFields({
        location: {
          name: location.name,
          coordinates: location.coordinates
        },
        genre: genre,
        subgenre: subgenre
      });

      // Update artist vector
      await setArtistVector(currentUser.uid, vector);

      router.push('/(onboarding)/artist/bio');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile information. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Now, let's build your profile on Interlude.</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Add some essential details to your profile.
      </ThemedText>
      
      <View style={{ width: '100%' }}>
        <View style={{ zIndex: 3, position: 'relative', marginBottom: 20 }}>
          <ThemedSearch
            placeholder="Enter your location"
            value={location?.name || ''}
            onSearch={searchLocations}
            onItemSelect={handleLocationSelect}
            renderItem={(item) => (
              <ThemedText>{item.name}</ThemedText>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
        <View style={{ zIndex: 2, position: 'relative', marginBottom: 20 }}>
          <ThemedSearch
            placeholder="Genre"
            value={genre}
            onSearch={searchGenres}
            onItemSelect={(selectedGenre) => {
              setGenre(selectedGenre.name);
            }}
            renderItem={(item) => (
              <ThemedText>{item.name}</ThemedText>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
        <View style={{ zIndex: 1, position: 'relative', marginBottom: 20 }}>
          <ThemedSearch
            placeholder="Subgenre"
            value={subgenre}
            onSearch={searchGenres}
            onItemSelect={(selectedSubgenre) => {
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