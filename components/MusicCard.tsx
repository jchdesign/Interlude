import { useEffect, useState, useContext } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { PlayerContext } from '@/context/PlayerContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MusicCardProps {
  songId: string;
  square?: boolean;
  profile?: boolean;
  onPress?: () => void;
}

export default function MusicCard({ songId, square = false, profile = false, onPress }: MusicCardProps) {
  const [song, setSong] = useState<any>(null);
  const [artist, setArtist] = useState<any>(null);
  const [album, setAlbum] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const { showPlayer } = useContext(PlayerContext);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const db = getFirestore();
        const songDoc = await getDoc(doc(db, 'songs', songId));
        if (songDoc.exists()) {
          const songData = songDoc.data();
          setSong(songData);
          // Fetch artist
          if (songData.user_id) {
            const artistDoc = await getDoc(doc(db, 'users', songData.user_id));
            if (artistDoc.exists()) setArtist(artistDoc.data());
          }
          // Fetch album if applicable
          if (songData.album_id) {
            const albumDoc = await getDoc(doc(db, 'albums', songData.album_id));
            if (albumDoc.exists()) setAlbum(albumDoc.data());
          }
          // Get cover image
          if (songData.cover) {
            setCoverUrl(songData.cover);
          }
        }
      } catch (e) {
        setSong(null);
        setArtist(null);
        setAlbum(null);
        setCoverUrl(null);
      }
    };
    fetchSongData();
  }, [songId]);

  if (!song) return null;

  const handlePress = () => {
    if (!profile) {
      showPlayer({
        file: song.file,
        cover: coverUrl || '',
        title: song.title,
        artist: artist?.name || 'Unknown Artist',
        album: album?.title || '',
      });
    }
  };

  if (square) {
    return (
      <TouchableOpacity style={styles.squareCard} onPress={handlePress}>
        <Image
          source={coverUrl ? { uri: coverUrl } : require('../assets/images/artist/default_album_cover.png')}
          style={styles.squareImage}
        />
      </TouchableOpacity>
    );
  }

  if (profile) {
    return (
      <TouchableOpacity style={styles.profileCardContainer} onPress={onPress ?? handlePress}>
        <Image
          source={coverUrl ? { uri: coverUrl } : require('../assets/images/artist/default_album_cover.png')}
          style={styles.profileCoverImage}
        />
        <View style={styles.infoContainer}>
          <ThemedText style={styles.songTitle} numberOfLines={1}>{song.title}</ThemedText>
          <ThemedText style={styles.artistName} numberOfLines={1}>{artist?.name || 'Unknown Artist'}</ThemedText>
          {album && <ThemedText style={styles.albumName} numberOfLines={1}>| {album.title}</ThemedText>}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={32} color={Colors.dark.textGrey} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
      <Image
        source={coverUrl ? { uri: coverUrl } : require('../assets/images/artist/default_album_cover.png')}
        style={styles.coverImage}
      />
      <View style={styles.infoContainer}>
        <ThemedText style={styles.songTitle} numberOfLines={1}>{song.title}</ThemedText>
        <ThemedText style={styles.artistName} numberOfLines={1}>{artist?.name || 'Unknown Artist'}</ThemedText>
        {album && <ThemedText style={styles.albumName} numberOfLines={1}>| {album.title}</ThemedText>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    width: '100%',
    backgroundColor: Colors.dark.greyMedium,
    borderRadius: 15,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  profileCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 8,
  },
  coverImage: {
    width: 70,
    height: 70,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: Colors.dark.textGrey,
    marginRight: 12,
  },
  profileCoverImage: {
    width: 70,
    height: 70,
    backgroundColor: Colors.dark.textGrey,
    marginRight: 12,
    borderRadius: 15,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  songTitle: {
    color: Colors.dark.pink,
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    color: Colors.dark.white,
    fontSize: 14,
    marginTop: 2,
  },
  albumName: {
    color: Colors.dark.pink,
    fontSize: 13,
    marginTop: 2,
  },
  squareCard: {
    width: 90,
    height: 90,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: Colors.dark.greyMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  squareImage: {
    width: 90,
    height: 90,
    borderRadius: 15,
    resizeMode: 'cover',
  },
}); 