import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { ThemedSearch } from '@/components/ThemedSearch';
import { searchArtists, saveArtistToProfile, type SpotifyArtist } from '@/services/spotify';

export default function SpotifySearchScreen() {
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);

  const handleSearch = async (query: string): Promise<SpotifyArtist[]> => {
    return await searchArtists(query);
  };

  const handleArtistSelect = async (artist: SpotifyArtist) => {
    setSelectedArtist(artist);
    try {
      await saveArtistToProfile(artist);
      router.push('/(onboarding)/artist/location');
    } catch (error) {
      console.error('Error saving artist:', error);
      alert('Failed to save artist information. Please try again.');
    }
  };

  const renderArtistItem = (artist: SpotifyArtist) => (
    <TouchableOpacity
      style={[
        styles.artistItem,
        selectedArtist?.id === artist.id && styles.selectedArtist
      ]}
      onPress={() => handleArtistSelect(artist)}
    >
      {artist.images[0] && (
        <Image
          source={{ uri: artist.images[0].url }}
          style={styles.artistImage}
        />
      )}
      <View style={styles.artistInfo}>
        <ThemedText style={styles.artistName}>{artist.name}</ThemedText>
        <ThemedText style={styles.artistPopularity}>
          Popularity: {artist.popularity}%
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Connect your Spotify</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Link your Spotify account to import your music and profile
      </ThemedText>
      
      <ThemedSearch<SpotifyArtist>
        placeholder="Search for your artist name"
        onSearch={handleSearch}
        onItemSelect={handleArtistSelect}
        renderItem={renderArtistItem}
        keyExtractor={(artist) => artist.id}
        maxHeight={400}
      />

      <View style={styles.navigation}>
        <ButtonNav onPress={() => router.back()} forward={false} />
        <ButtonNav onPress={() => selectedArtist && handleArtistSelect(selectedArtist)} forward={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.purple,
  },
  selectedArtist: {
    backgroundColor: Colors.dark.purple + '20',
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistPopularity: {
    fontSize: 14,
    color: Colors.dark.textGrey,
  },
}); 