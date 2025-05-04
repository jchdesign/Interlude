import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { updateProfileFields, addFan } from '@/firestore';
import { Colors } from '@/constants/Colors';
import { ThemedSearch, ThemedSearchRef } from '@/components/ThemedSearch';

const screenWidth = Dimensions.get('window').width;

interface FirestoreArtist {
  id: string;
  name: string;
  genre?: string;
  location?: string;
  profilePicture?: string;
}

export default function FavoriteArtistsScreen() {
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<FirestoreArtist[]>([]);
  const searchRef = useRef<ThemedSearchRef>(null);

  const handleSearch = async (searchQuery: string): Promise<FirestoreArtist[]> => {
    try {
      const db = require('firebase/firestore').getFirestore();
      const usersRef = require('firebase/firestore').collection(db, 'users');
      const q = require('firebase/firestore').query(
        usersRef,
        require('firebase/firestore').where('role', '==', 'artist'),
        require('firebase/firestore').orderBy('name'),
        require('firebase/firestore').startAt(searchQuery),
        require('firebase/firestore').endAt(searchQuery + '\uf8ff')
      );
      const querySnapshot = await require('firebase/firestore').getDocs(q);
      const artists: FirestoreArtist[] = [];
      querySnapshot.forEach((doc: any) => {
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
      return [];
    }
  };

  const handleArtistSelect = (artist: FirestoreArtist) => {
    setSelectedArtists(prevArtists => {
      const alreadySelected = prevArtists.some(a => a.id === artist.id);
      let newArtists;
      if (alreadySelected) {
        newArtists = prevArtists.filter(a => a.id !== artist.id);
      } else {
        newArtists = [...prevArtists, artist];
      }
      // Sync selectedArtistIds with the new selectedArtists
      setSelectedArtistIds(newArtists.map(a => a.id));
      return newArtists;
    });
    searchRef.current?.clearSearch();
  };

  const handleNext = async () => {
    try {
      const auth = require('firebase/auth').getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is signed in');
      }
      // Add fan relationships in the fans collection
      if (selectedArtists.length > 0) {
        await Promise.all(selectedArtists.map(artist =>
          addFan(currentUser.uid, artist.id)
        ));
      }
      router.push('/(onboarding)/listener/profile-picture');
    } catch (error) {
      console.error('Error saving followed artists:', error);
      alert('Failed to save followed artists. Please try again.');
    }
  };

  const renderArtistItem = (artist: FirestoreArtist) => (
    <View style={styles.artistItem}>
      {artist.profilePicture && (
        <Image
          source={{ uri: artist.profilePicture }}
          style={styles.artistImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.artistInfo}>
        <ThemedText type="h2" style={styles.artistName}>{artist.name}</ThemedText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>What are your playlist essentials?</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>Choose your favorite artists to help guide your music recommendations.</ThemedText>
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <ThemedSearch
            ref={searchRef}
            placeholder="Search for an artist..."
            onSearch={handleSearch}
            onItemSelect={handleArtistSelect}
            renderItem={renderArtistItem}
            keyExtractor={(artist: FirestoreArtist) => artist.id}
            maxHeight={300}
          />
        </View>
      </View>
      {selectedArtists.length > 0 && (
        <View style={styles.selectedArtistsContainer}>
          <View style={styles.selectedArtistsGrid}>
            {selectedArtists.map(artist => (
              <View key={artist.id} style={styles.selectedArtistItem}>
                <View style={{ position: 'relative' }}>
                  <Image
                    source={artist.profilePicture ? { uri: artist.profilePicture } : undefined}
                    style={styles.selectedArtistImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleArtistSelect(artist)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.removeButtonText}>-</ThemedText>
                  </TouchableOpacity>
                </View>
                <ThemedText style={styles.selectedArtistName}>{artist.name}</ThemedText>
              </View>
            ))}
          </View>
        </View>
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
    padding: 24,
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
  selectedArtistsContainer: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: Colors.dark.background + '20',
    position: 'relative',
    zIndex: 1,
    justifyContent: 'center',
  },
  selectedArtistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 24,
  },
  selectedArtistItem: {
    width: (screenWidth-87) / 2,
    alignItems: 'center',
  },
  selectedArtistImage: {
    width: (screenWidth-87) / 2,
    aspectRatio: 1,
    borderRadius: 25,
    marginBottom: 8,
    backgroundColor: Colors.dark.darkGrey,
  },
  removeButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.dark.shayla,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeButtonText: {
    color: Colors.dark.background,
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    textAlign: 'center',
  },
  selectedArtistName: {
    color: Colors.dark.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 2,
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
    marginBottom: 20,
  },
  subtitlePadding: {
    marginBottom: 20,
  },
}); 