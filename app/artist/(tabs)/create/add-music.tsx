import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { WebSafeMaterialCommunityIcon } from '@/components/ui/WebSafeMaterialCommunityIcon';
import { pickImage } from '@/storage';
import { uploadSongCover, uploadAlbumCover, uploadSongAudio } from '@/storage';
import { createSong, createPostFromTemporary } from '@/firestore';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/Colors';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useCreateMusic } from './CreateMusicContext';
import { CameraIcon, PlusIcon, ChevronRightIcon } from 'react-native-heroicons/outline';

export default function AddMusic() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = typeof params.category === 'string' ? params.category : 'song';
  const { songData, postData, updateSongData, updatePostData, resetForm } = useCreateMusic();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.genres) {
      try {
        const genres = JSON.parse(params.genres as string);
        if (Array.isArray(genres)) {
          updateSongData({ genre: genres });
        }
      } catch {}
    }
  }, [params.genres]);

  useEffect(() => {
    if (params.links) {
      try {
        const links = JSON.parse(params.links as string);
        if (Array.isArray(links)) {
          updateSongData({ links: { spotify: links[0] || '', appleMusic: links[1] || '', youtube: links[2] || '', soundcloud: links[3] || '' } });
        }
      } catch {}
    }
  }, [params.links]);

  // Handlers for each field
  const handleSongInputChange = (field: string, value: string) => {
    updateSongData({ [field]: value });
  };
  const handleBlurbChange = (value: string) => {
    updatePostData({ blurb: value });
  };

  // Image picker handler
  const handlePickImage = async () => {
    const uri = await pickImage();
    updateSongData({ image: uri ? uri : '' });
  };

  // Audio picker handler
  const handlePickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      updateSongData({ audio: result.assets[0].uri ? result.assets[0].uri : '' });
    }
  };

  // Post handler
  const handlePost = async () => {
    setLoading(true);
    try {
      // 1. Create the song doc to get the songId
      const songDoc = await createSong({
        file: '', // will update after upload
        title: songData.title,
        genre: songData.genre,
        links: [songData.links.spotify, songData.links.appleMusic, songData.links.youtube, songData.links.soundcloud],
        year: parseInt(songData.year) || new Date().getFullYear(),
        vector: [],
        user_id: '', // will be set in backend
      });
      const songId = songDoc.song_id;
      let imageUrl: string = '';
      let audioUrl: string = '';
      // 2. Upload image if present
      if (songData.image) {
        const uploaded = await uploadSongCover(songData.image as string, `${songId}`);
        imageUrl = uploaded ?? '';
      }
      // 3. Upload audio if present
      if (songData.audio) {
        const uploaded = await uploadSongAudio(songData.audio as string, `${songId}`);
        audioUrl = uploaded ?? '';
      }
      // 4. Update song doc with image/audio URLs
      const db = getFirestore();
      await setDoc(doc(db, 'songs', songId), {
        file: audioUrl,
        cover: imageUrl,
      }, { merge: true });
      // 5. Save post to Firestore with songId in tag field
      await createPostFromTemporary({
        type: 'music',
        category,
        content: postData.blurb,
        tag: songId,
      });
      setLoading(false);
      resetForm();
      router.replace('../home');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'There was a problem posting your song.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          resetForm();
          router.back();
        }}>
          <ThemedText type='h3' style={{color: Colors.dark.shayla}}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type='h2'>{category === 'song' ? 'Song' : 'Album/EP'}</ThemedText>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          <ThemedText type='h3' style={{color: Colors.dark.shayla}}>Post</ThemedText>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color={Colors.dark.shayla} style={{ marginBottom: 16 }} />}

      {/* Form Fields with consistent gap */}
      <View style={styles.formGroup}>
        {/* Upload File (Image) */}
        <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
          {songData.image ? (
            <Image source={{ uri: songData.image }} style={styles.coverImage} />
          ) : (
            <CameraIcon size={40} color={Colors.dark.shayla} />
          )}
        </TouchableOpacity>
        
        <View style={styles.formField}>
          <ThemedText type='large' style={styles.label}>Upload File</ThemedText>
          <TouchableOpacity style={styles.uploadInput} onPress={handlePickAudio}>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <PlusIcon size={24} color={Colors.dark.shayla} />
                  <ThemedText style={styles.uploadInputText}>
                  {songData.audio ? 'Audio Selected' : '  .wav, .mp3, .m4a'}
                  </ThemedText>
              </View>
          </TouchableOpacity>
        </View>

        {/* Gap between uploadInput and Title */}
        <View style={{ height: 8 }} />

        {/* Title */}
        <View style={styles.formField}>
          <ThemedText type='large' style={styles.label}>Title</ThemedText>
          <TextInput
              style={styles.input}
              placeholder="Let's hear it."
              placeholderTextColor={Colors.dark.textGrey}
              value={songData.title}
              onChangeText={text => handleSongInputChange('title', text)}
          />
        </View>

        {/* Genre */}
        <TouchableOpacity style={[styles.row]} onPress={() => router.push({ pathname: './select-genre', params: { selected: JSON.stringify(songData.genre) } })}>
          <View style={[styles.formFieldContent, styles.formField]}>
            <ThemedText type='large' style={styles.label}>Genre</ThemedText>
            {songData.genre.length > 0 ? (
              <ThemedText style={styles.subLabel}>{songData.genre.join(', ')}</ThemedText>
            ) : (
              <ThemedText style={styles.subLabelPlaceholder}>Select a couple of genres for this song.</ThemedText>
            )}
          </View>
          <ChevronRightIcon size={22} color={Colors.dark.shayla} />
        </TouchableOpacity>

        {/* Links */}
        <TouchableOpacity style={[styles.row, styles.formField]} onPress={() => router.push({ pathname: './add-music-links', params: { links: JSON.stringify(songData.links) } })}>
          <View style={[styles.formFieldContent, styles.formField]}>
            <ThemedText type='large' style={styles.label}>Links</ThemedText>
            {(() => {
              const linkArray = [songData.links.spotify, songData.links.appleMusic, songData.links.youtube, songData.links.soundcloud];
              const validLinks = linkArray.filter(Boolean);
              return validLinks.length > 0 ? (
                <ThemedText style={styles.subLabel}>
                  {validLinks.map((link, idx) => ['Spotify', 'Apple Music', 'YouTube', 'SoundCloud'][idx]).join(', ')}
                </ThemedText>
              ) : (
                <ThemedText style={styles.subLabelPlaceholder}>Add links to stream your music</ThemedText>
              );
            })()}
          </View>
          <ChevronRightIcon size={22} color={Colors.dark.shayla} />
        </TouchableOpacity>

        {/* Year */}
        <View style={styles.formField}>
          <ThemedText type='large' style={styles.label}>Year</ThemedText>
          <TextInput
              style={styles.input}
              placeholder="Past release? No problem."
              placeholderTextColor={Colors.dark.textGrey}
              value={songData.year}
              onChangeText={text => handleSongInputChange('year', text)}
          />
        </View>

        {/* Blurb */}
        <View style={styles.formField}>
          <ThemedText type='large' style={styles.label}>Blurb</ThemedText>
          <TextInput
              style={styles.input}
                  placeholder="A short note about your track."
                  placeholderTextColor={Colors.dark.textGrey}
                  value={postData.blurb}
                  onChangeText={handleBlurbChange}
              />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerText: {
    color: Colors.dark.shayla,
    fontSize: 18,
    fontWeight: '500',
  },
  uploadBox: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 16,
    backgroundColor: Colors.dark.darkGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: 150,
    height: 150,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  cameraIcon: {
    fontSize: 40,
    color: '#A259D9',
  },
  formGroup: {
    gap: 18,
  },
  formField: {
    gap: 10,
    flex: 1,
  },
  uploadLabel: {
    color: Colors.dark.white,
    marginBottom: 4,
  },
  uploadInput: {
    borderWidth: 1,
    height: 40,
    borderColor: Colors.dark.textGrey,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
  },
  uploadInputText: {
    color: Colors.dark.white,
  },
  label: {
    color: Colors.dark.pink,
  },
  subLabel: {
    color: Colors.dark.white,
  },
  subLabelPlaceholder: {
    color: Colors.dark.textGrey,
  },
  input: {
    color: Colors.dark.white,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    backgroundColor: '#232029',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  arrow: {
    color: '#fff',
    fontSize: 22,
  },
  formFieldContent: {
    flex: 1,
  },
}); 