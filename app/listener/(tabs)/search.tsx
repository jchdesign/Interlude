import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Dimensions, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors, hexToRgba } from '@/constants/Colors';
import { GeneralSearch } from '@/components/GeneralSearch';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import type { StyleProp, ViewStyle, TextStyle, LayoutChangeEvent, NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import type { ThemedTextProps } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import MusicCard from '@/components/MusicCard';

const { width } = Dimensions.get('window');

const TABS = [
  { key: 'profiles', label: 'Profiles' },
  { key: 'music', label: 'Music' },
  { key: 'nearme', label: 'Near Me' },
];

interface ArtistProfile {
  id: string;
  name: string;
  coverPhoto?: string;
}

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

type FitTextBlockProps = {
  text: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  type?: ThemedTextProps['type'];
};

function FitTextBlock({ text, containerStyle, textStyle, type = 'h2' }: FitTextBlockProps) {
  const [fontSize, setFontSize] = useState(MAX_FONT_SIZE);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    setFontSize(MAX_FONT_SIZE);
  }, [text]);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    let needsShrink = false;
    const lines = e.nativeEvent.lines;
    // Check if any word is split across lines
    if (lines.length > 1) {
      const firstLineWords = lines[0].text.split(' ');
      const secondLineWords = lines[1].text.split(' ');
      // If the last word of the first line is not complete, it was split
      if (
        firstLineWords.length > 0 &&
        secondLineWords.length > 0 &&
        !lines[0].text.endsWith(' ') &&
        !lines[1].text.startsWith(' ')
      ) {
        needsShrink = true;
      }
    }
    // Also check if any word is wider than the container
    for (const line of lines) {
      const words = line.text.split(' ');
      for (const word of words) {
        if (
          word.length > 0 &&
          line.width * (word.length / line.text.length) > containerWidth
        ) {
          needsShrink = true;
          break;
        }
      }
      if (needsShrink) break;
    }
    if (needsShrink && fontSize > MIN_FONT_SIZE) {
      setFontSize((prev) => prev - 1);
    }
  };

  return (
    <View style={containerStyle} onLayout={handleContainerLayout}>
      <ThemedText
        type={type}
        style={[textStyle, { fontSize }]}
        numberOfLines={2}
        ellipsizeMode="tail"
        onTextLayout={handleTextLayout}
      >
        {text}
      </ThemedText>
    </View>
  );
}

const SONG_CARD_GAP = 0;

interface SongSearchResult {
  id: string;
}

const PROFILE_FILTERS = [
  { key: 'artist', label: 'Artists' },
  { key: 'listener', label: 'Listener' },
  { key: 'halloffame', label: 'Hall of Fame' },
];

export default function Search() {
  const [selectedTab, setSelectedTab] = useState('profiles');
  const [results, setResults] = useState<ArtistProfile[]>([]);
  const [songResults, setSongResults] = useState<SongSearchResult[]>([]);
  const [profileFilter, setProfileFilter] = useState<'artist' | 'listener' | 'halloffame'>('artist');
  const [recommendedProfiles, setRecommendedProfiles] = useState<ArtistProfile[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<SongSearchResult[]>([]);
  const router = useRouter();
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [musicSearchQuery, setMusicSearchQuery] = useState('');

  // Memoize the empty array to avoid infinite update loop
  const emptyInitialData = useMemo(() => [], []);

  // Initial data: fetch all artists or listeners
  const fetchAllProfiles = async (): Promise<ArtistProfile[]> => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', profileFilter));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        coverPhoto: data.coverPhoto || undefined,
      };
    });
  };

  // Search function for GeneralSearch
  const handleSearch = async (searchQuery: string): Promise<ArtistProfile[]> => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', profileFilter));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          coverPhoto: data.coverPhoto || undefined,
        };
      })
      .filter(profile => profile.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  // Song search function
  const handleSongSearch = async (searchQuery: string): Promise<SongSearchResult[]> => {
    const db = getFirestore();
    const songsRef = collection(db, 'songs');
    const snapshot = await getDocs(songsRef);
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
        };
      })
      .filter(song => song.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  // Render artist card
  const renderArtistCard = ({ item }: { item: ArtistProfile }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id } })}
    >
      <ImageBackground
        source={item.coverPhoto ? { uri: item.coverPhoto } : require("../../../assets/images/artist/default_cover_image.png")}
        style={styles.artistCard}
        imageStyle={{ borderRadius: 18 }}
      >
        <FitTextBlock
          text={item.name}
          containerStyle={styles.artistNameContainer}
          textStyle={styles.artistNameText}
          type="h2"
        />
      </ImageBackground>
    </TouchableOpacity>
  );

  // Render song card
  const renderSongCard = ({ item }: { item: SongSearchResult }) => (
    <View style={{ width: '100%', marginBottom: SONG_CARD_GAP }}>
      <MusicCard songId={item.id} />
    </View>
  );

  // Fetch recommended profiles
  useEffect(() => {
    if (selectedTab === 'profiles') {
      const fetchRecommended = async () => {
        const db = getFirestore();
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', profileFilter));
        const snapshot = await getDocs(q);
        let all = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          coverPhoto: doc.data().coverPhoto || undefined,
        }));
        // Shuffle and take 10
        for (let i = all.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [all[i], all[j]] = [all[j], all[i]];
        }
        setRecommendedProfiles(all.slice(0, 10));
      };
      fetchRecommended();
    }
  }, [selectedTab, profileFilter]);

  // Fetch recommended songs
  useEffect(() => {
    if (selectedTab === 'music') {
      const fetchRecommended = async () => {
        const db = getFirestore();
        const songsRef = collection(db, 'songs');
        const snapshot = await getDocs(songsRef);
        let all = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || '',
        }));
        // Shuffle and take 10
        for (let i = all.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [all[i], all[j]] = [all[j], all[i]];
        }
        setRecommendedSongs(all.slice(0, 10));
      };
      fetchRecommended();
    }
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab === 'profiles') {
      fetchAllProfiles().then(setResults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, profileFilter]);

  return (
    <View style={[styles.container, { flex: 1 }]}>
      {/* Tabs */}
      <View style={styles.tabBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, selectedTab === tab.key && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <ThemedText style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>{tab.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Profiles Tab */}
      {selectedTab === 'profiles' && (
        <>
          <View style={styles.searchBarWrapper}>
            <GeneralSearch<ArtistProfile>
              onSearch={handleSearch}
              onResultsChange={results => {
                if (selectedTab === 'profiles') setResults(results);
              }}
              initialData={emptyInitialData}
              placeholder="Search on Interlude..."
              onQueryChange={setProfileSearchQuery}
            />
          </View>
          {/* Profile Filter Toggles */}
          <View style={styles.filterChipsWrapper}>
            {PROFILE_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, profileFilter === filter.key && styles.filterChipActive]}
                onPress={() => filter.key !== 'halloffame' && setProfileFilter(filter.key as 'artist' | 'listener')}
                disabled={filter.key === 'halloffame'}
              >
                <ThemedText style={[styles.filterChipText, profileFilter === filter.key && styles.filterChipTextActive]}>{filter.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          {profileSearchQuery.trim() === '' ? (
            <View style={{ marginBottom: 16, flex: 1 }}>
              <ThemedText type="h3" style={{ marginBottom: 8 }}>Recommended</ThemedText>
              <FlatList
                data={recommendedProfiles}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={[styles.gridContainer, { marginTop: 0 }]}
                renderItem={renderArtistCard}
                ListEmptyComponent={null}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={[styles.gridContainer, { marginTop: 0 }]}
              renderItem={renderArtistCard}
              style={{ flex: 1 }}
            />
          )}
        </>
      )}
      {/* Songs Tab */}
      {selectedTab === 'music' && (
        <>
          <View style={styles.searchBarWrapper}>
            <GeneralSearch<SongSearchResult>
              onSearch={handleSongSearch}
              onResultsChange={results => {
                if (selectedTab === 'music') setSongResults(results);
              }}
              initialData={[]}
              placeholder="Search for music..."
              onQueryChange={setMusicSearchQuery}
            />
          </View>
          {musicSearchQuery.trim() === '' ? (
            <View style={{ marginBottom: 16, flex: 1, width: '100%', height: '100%' }}>
              <ThemedText type="h3" style={{ marginBottom: 8 }}>Recommended</ThemedText>
              <FlatList
                data={recommendedSongs}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.gridContainer, { marginTop: 0, width: '100%' }]}
                renderItem={renderSongCard}
                ListEmptyComponent={null}
                style={{ flex: 1, width: '100%' }}
              />
            </View>
          ) : (
            <FlatList
            data={songResults}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.gridContainer, { marginTop: 0 }]}
            renderItem={renderSongCard}
            style={{ flex: 1 }}
          />
        )}
        </>
      )}
      {/* Other tabs can be implemented later */}
    </View>
  );
}

const CARD_GAP = 24;
const CARD_WIDTH = (width - 3 * CARD_GAP) / 2;
const CARD_HEIGHT = 225;

const styles = StyleSheet.create({
  tabBarWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    columnGap: 24,
    paddingHorizontal: 0,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.dark.blue,
  },
  tabText: {
    color: Colors.dark.textGrey,
    fontSize: 18,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.dark.white,
  },
  searchBarWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  filterChipsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    columnGap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.dark.darkGrey,
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.dark.shayla,
  },
  filterChipText: {
    color: Colors.dark.white,
    fontWeight: '500',
    fontSize: 15,
  },
  filterChipTextActive: {
    color: Colors.dark.white,
    fontWeight: 'bold',
  },
  gridContainer: {
    paddingHorizontal: 0,
    paddingBottom: 32,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 0,
  },
  artistCard: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  artistNameContainer: {
    backgroundColor: hexToRgba(Colors.dark.shayla, 0.8),
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  artistNameText: {
    color: Colors.dark.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
  },
});
