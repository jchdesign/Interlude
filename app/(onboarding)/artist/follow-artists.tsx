import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { useState, useRef, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { ThemedSearch, ThemedSearchRef } from '@/components/ThemedSearch';
import { collection, query, where, getDocs, orderBy, startAt, endAt, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { updateProfileFields, addFollowing } from '@/firestore';

interface AppArtist {
  id: string;
  name: string;
  genre: string;
  location: string;
  profilePicture?: string;
}

export default function FollowArtistsScreen() {
  const [selectedArtists, setSelectedArtists] = useState<AppArtist[]>([]);
  const searchRef = useRef<ThemedSearchRef>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string): Promise<AppArtist[]> => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      
      // Create a query that searches for artists where name starts with the search query
      const q = query(
        usersRef,
        where('role', '==', 'artist'),
        orderBy('name'),
        startAt(searchQuery),
        endAt(searchQuery + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      const artists: AppArtist[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        artists.push({
          id: doc.id,
          name: data.name || '',
          genre: data.genre || '',
          location: data.location?.name || '',
          profilePicture: data.profilePicture,
        });
      });

      return artists;
    } catch (error) {
      console.error('Error searching artists:', error);
      setError('Failed to search artists. Please try again.');
      return [];
    }
  };

  const handleArtistSelect = (artist: AppArtist) => {
    setSelectedArtists(prev => {
      const isAlreadySelected = prev.some(a => a.id === artist.id);
      if (isAlreadySelected) {
        return prev.filter(a => a.id !== artist.id);
      } else {
        return [...prev, artist];
      }
    });
    searchRef.current?.clearSearch();
  };

  const handleNext = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is signed in');
      }

      // Add following connections in the following collection
      if (selectedArtists.length > 0) {
        await Promise.all(selectedArtists.map(artist =>
          addFollowing(currentUser.uid, artist.id)
        ));
      }

      router.push('../../artist/(tabs)/home');
    } catch (error) {
      console.error('Error saving followed artists:', error);
      setError('Failed to save followed artists. Please try again.');
    }
  };

  const renderArtistItem = (artist: AppArtist) => (
    <View style={styles.artistItem}>
      <Image
        source={artist.profilePicture ? { uri: artist.profilePicture } : undefined}
        style={styles.artistImage}
        resizeMode="cover"
      />
      <View style={styles.artistInfo}>
        <ThemedText type="h2" style={styles.artistName}>{artist.name}</ThemedText>
        <ThemedText style={styles.artistMeta}>{artist.genre} • {artist.location}</ThemedText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Follow your favorite artists</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Stay connected with artists who inspire you
      </ThemedText>
      
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <ThemedSearch
            ref={searchRef}
            placeholder="Search for artists..."
            onSearch={handleSearch}
            onItemSelect={handleArtistSelect}
            renderItem={renderArtistItem}
            keyExtractor={(artist: AppArtist) => artist.id}
            maxHeight={300}
          />
        </View>
      </View>

      {selectedArtists.length > 0 && (
        <View style={styles.selectedArtistsContainer}>
          <ThemedText style={styles.selectedArtistsTitle}>Selected Artists</ThemedText>
          {selectedArtists.map(artist => (
            <View key={artist.id} style={styles.selectedArtistItem}>
              {renderArtistItem(artist)}
            </View>
          ))}
        </View>
      )}

      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}

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
  searchWrapper: {
    position: 'relative',
    zIndex: 2,
    marginBottom: 20,
  },
  searchContainer: {
    width: '100%',
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.darkGrey,
    marginVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
    height: 70,
  },
  artistImage: {
    width: 70,
    height: 70,
  },
  artistInfo: {
    flex: 1,
    padding: 15,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '500',
  },
  artistMeta: {
    fontSize: 14,
    color: Colors.dark.textGrey,
  },
  selectedArtistsContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.dark.background + '20',
    position: 'relative',
    zIndex: 1,
  },
  selectedArtistsTitle: {
    marginBottom: 10,
    color: Colors.dark.textGrey,
  },
  selectedArtistItem: {
    marginBottom: 10,
  },
  errorText: {
    color: Colors.dark.error,
    textAlign: 'center',
    marginTop: 10,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  titlePadding: {
    marginBottom: 10,
  },
  subtitlePadding: {
    marginBottom: 20,
  },
}); 