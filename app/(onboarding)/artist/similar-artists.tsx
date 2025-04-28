import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import ThemedInput from '@/components/ThemedInput';

// TODO: Replace with actual Spotify API search
const MOCK_ARTISTS = [
  { id: '1', name: 'Artist 1' },
  { id: '2', name: 'Artist 2' },
  { id: '3', name: 'Artist 3' },
  { id: '4', name: 'Artist 4' },
];

export default function SimilarArtistsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const handleNext = () => {
    // TODO: Save selected artists to Firestore
    router.push('/(onboarding)/artist/follow-artists');
  };

  const toggleArtist = (artistId: string) => {
    setSelectedArtists(prev => 
      prev.includes(artistId)
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  const renderItem = ({ item }: { item: typeof MOCK_ARTISTS[0] }) => (
    <TouchableOpacity
      style={[
        styles.artistItem,
        selectedArtists.includes(item.id) && styles.selectedArtist
      ]}
      onPress={() => toggleArtist(item.id)}
    >
      <ThemedText>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Who are your similar artists?</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Help fans discover your music by connecting with similar artists
      </ThemedText>
      
      <ThemedInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search for artists..."
      />

      <FlatList
        data={MOCK_ARTISTS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
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
  list: {
    flex: 1,
    marginBottom: 100,
  },
  artistItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.purple,
  },
  selectedArtist: {
    backgroundColor: Colors.dark.purple,
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
}); 