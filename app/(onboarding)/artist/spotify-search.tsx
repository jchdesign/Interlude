import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { useState, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { ThemedSearch, ThemedSearchRef } from '@/components/ThemedSearch';
import { searchArtists, saveArtistToProfile, type SpotifyArtist } from '@/services/spotify';

export default function SpotifySearchScreen() {
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const searchRef = useRef<ThemedSearchRef>(null);

  const handleSearch = async (query: string): Promise<SpotifyArtist[]> => {
    return await searchArtists(query);
  };

  const handleArtistSelect = (artist: SpotifyArtist) => {
    setSelectedArtist(artist);
    searchRef.current?.clearSearch();
  };

  const handleNext = async () => {
    if (!selectedArtist) {
      alert('Please select an artist first');
      return;
    }

    try {
      await saveArtistToProfile({
        id: selectedArtist.id,
        name: selectedArtist.name,
        popularity: selectedArtist.popularity,
        external_urls: selectedArtist.external_urls,
        images: selectedArtist.images,
        links: { spotify: selectedArtist.external_urls?.spotify || '' }
      });
      router.push('/(onboarding)/artist/location');
    } catch (error) {
      console.error('Error saving artist:', error);
      alert('Failed to save artist information. Please try again.');
    }
  };

  const renderArtistItem = (artist: SpotifyArtist) => (
    <View style={styles.artistItem}>
      {artist.images[0] && (
        <Image
          source={{ uri: artist.images[0].url }}
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
      <ThemedText type="h1" style={styles.titlePadding}>Connect your Spotify</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Link your Spotify account to import your music and profile
      </ThemedText>
      
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <ThemedSearch
            ref={searchRef}
            placeholder="Search for an artist..."
            onSearch={handleSearch}
            onItemSelect={handleArtistSelect}
            renderItem={renderArtistItem}
            keyExtractor={(artist: SpotifyArtist) => artist.id}
            maxHeight={300}
          />
        </View>
      </View>

      {selectedArtist && (
        <View style={styles.selectedArtistContainer}>
          {renderArtistItem(selectedArtist)}
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
    padding: 20,
    justifyContent: 'center',
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
    paddingBottom: 20,
  },
  subtitlePadding: {
    paddingBottom: 20,
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
  selectedArtistContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.dark.background + '20',
    position: 'relative',
    zIndex: 1,
  },
  selectedArtistTitle: {
    marginBottom: 10,
    color: Colors.dark.textGrey,
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 2,
    marginBottom: 20,
  },
  searchContainer: {
    width: '100%',
  },
}); 