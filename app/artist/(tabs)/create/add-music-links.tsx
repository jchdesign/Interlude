import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { WebSafeMaterialCommunityIcon } from '@/components/ui/WebSafeMaterialCommunityIcon';
import { Colors } from '@/constants/Colors';
import { useCreateMusic } from './CreateMusicContext';
import { GlobeAltIcon } from 'react-native-heroicons/outline';

const LINK_PLATFORMS = [
  { key: 'spotify', label: 'Spotify', icon: 'spotify' },
  { key: 'apple', label: 'Apple Music', icon: 'music' },
  { key: 'youtube', label: 'YouTube', icon: 'youtube' },
  { key: 'soundcloud', label: 'SoundCloud', icon: 'soundcloud' },
];

export default function AddMusicLinks() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { songData, updateSongData } = useCreateMusic();

  const links = [songData.links.spotify, songData.links.appleMusic, songData.links.youtube, songData.links.soundcloud];

  const handleChange = (idx: number, value: string) => {
    const newLinks = { ...songData.links };
    if (idx === 0) newLinks.spotify = value;
    else if (idx === 1) newLinks.appleMusic = value;
    else if (idx === 2) newLinks.youtube = value;
    else if (idx === 3) newLinks.soundcloud = value;
    updateSongData({ links: newLinks });
  };

  const handleSave = () => {
    router.replace({ pathname: './add-music' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText type="h3" style={styles.cancel}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <ThemedText type="h3" style={styles.save}>Save</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="h2" style={styles.title}>Add Links</ThemedText>
      <ThemedText style={styles.subtitle}>Help listeners find your music on other platforms.</ThemedText>
      <View style={{ marginTop: 24 }}>
        {LINK_PLATFORMS.map((platform, idx) => (
          <View key={platform.key} style={styles.linkRow}>
            {/* TODO: Replace GlobeAltIcon with a more specific brand icon if desired */}
            <GlobeAltIcon size={28} color={Colors.dark.textGrey} style={{ marginRight: 12 }} />
            <TextInput
              style={styles.linkInput}
              placeholder={platform.label}
              placeholderTextColor={Colors.dark.textGrey}
              value={links[idx]}
              onChangeText={text => handleChange(idx, text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ))}
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
    marginBottom: 16,
  },
  cancel: {
    color: Colors.dark.shayla,
  },
  save: {
    color: Colors.dark.shayla,
  },
  title: {
    color: Colors.dark.text,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.dark.textGrey,
    marginBottom: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.purple,
    marginBottom: 24,
    paddingBottom: 4,
  },
  linkInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    paddingVertical: 8,
    fontFamily: 'Figtree-Regular',
  },
}); 