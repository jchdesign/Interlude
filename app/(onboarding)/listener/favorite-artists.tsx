import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { router } from 'expo-router';
import { useState } from 'react';
import { updateProfileFields } from '@/firestore';
import { Colors } from '@/constants/Colors';

// TODO: Replace with actual Spotify API search
const MOCK_ARTISTS = [
  { id: '1', name: 'Artist 1' },
  { id: '2', name: 'Artist 2' },
  { id: '3', name: 'Artist 3' },
  { id: '4', name: 'Artist 4' },
  { id: '5', name: 'Artist 5' },
];

export default function FavoriteArtistsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const handleNext = async () => {
    try {
      await updateProfileFields({
        favoriteArtists: selectedArtists,
      });
      router.push('/(onboarding)/listener/genres');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile information. Please try again.');
    }
  };

  const toggleArtist = (artistId: string) => {
    setSelectedArtists(prev => {
      if (prev.includes(artistId)) {
        return prev.filter(id => id !== artistId);
      } else {
        return [...prev, artistId];
      }
    });
  };

  const renderItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.artistItem,
        selectedArtists.includes(item.id) && styles.selectedArtist,
      ]}
      onPress={() => toggleArtist(item.id)}
    >
      <ThemedText>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>Who are your favorite artists?</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Follow artists you love to discover new music
      </ThemedText>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search artists..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={MOCK_ARTISTS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
  searchInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  artistItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedArtist: {
    backgroundColor: '#333',
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