import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { router } from 'expo-router';
import { useState } from 'react';
import { updateProfileFields } from '@/firestore';
import { Colors } from '@/constants/Colors';
import { ThemedSearch } from '@/components/ThemedSearch';
import Constants from 'expo-constants';

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

  const searchLocations = async (searchQuery: string): Promise<LocationResult[]> => {
    if (!searchQuery.trim()) return [];
    try {
      const baseUrl = __DEV__
        ? `http://localhost:5001/${Constants.expoConfig?.extra?.firebaseProjectId}/us-central1/placesProxy`
        : `https://us-central1-${Constants.expoConfig?.extra?.firebaseProjectId}.cloudfunctions.net/placesProxy`;
      const response = await fetch(
        `${baseUrl}?input=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.predictions) {
        return data.predictions.map((prediction: any) => ({
          id: prediction.place_id,
          name: prediction.description,
          coordinates: { latitude: 0, longitude: 0 }, // Will get these later
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<{ latitude: number; longitude: number }> => {
    try {
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
          longitude: data.result.geometry.location.lng,
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
        coordinates,
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
      await updateProfileFields({
        location: {
          name: location.name,
          coordinates: location.coordinates,
        },
      });
      router.push('/(onboarding)/listener/genres' as const);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile information. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="h1" style={styles.title}>Where are you?</ThemedText>
        <ThemedText style={styles.subtitle}>Help us find local artists and events near you.</ThemedText>
        
        <View style={styles.inputContainer}>
          <ThemedSearch
            placeholder="Current city"
            value={location?.name || ''}
            onSearch={searchLocations}
            onItemSelect={handleLocationSelect}
            renderItem={(item) => <ThemedText>{item.name}</ThemedText>}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.navigation}>
          <ButtonNav onPress={() => router.back()} forward={false} />
          <ButtonNav onPress={handleNext} forward={true} />
        </View>
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
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    paddingBottom: 20,
  },
  subtitle: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
}); 