import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';

// TODO: Replace with actual app artists
const MOCK_APP_ARTISTS = [
  { id: '1', name: 'App Artist 1' },
  { id: '2', name: 'App Artist 2' },
  { id: '3', name: 'App Artist 3' },
  { id: '4', name: 'App Artist 4' },
];

export default function FollowArtistsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const handleNext = () => {
    // TODO: Save followed artists to Firestore
    router.push('../artist/(tabs)/home');
  };

  const toggleArtist = (artistId: string) => {
    setSelectedArtists(prev => 
      prev.includes(artistId)
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  const renderItem = ({ item }: { item: typeof MOCK_APP_ARTISTS[0] }) => (
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
      <ThemedText type="h1" style={styles.titlePadding}>Follow your favorite artists</ThemedText>
      <ThemedText type="h3" style={[styles.subtitlePadding, { color: Colors.dark.textGrey, textAlign: 'left' }]}>
        Stay connected with artists who inspire you
      </ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Search for artists..."
        placeholderTextColor={Colors.dark.textGrey}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={MOCK_APP_ARTISTS}
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
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.dark.purple,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: Colors.dark.text,
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
    marginBottom: 20,
  },
  subtitlePadding: {
    marginBottom: 20,
  },
}); 