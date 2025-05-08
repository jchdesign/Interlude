import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated, PanResponder, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { PlayerContext, SongData } from '@/context/PlayerContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function Player() {
  const { currentSong, isVisible, pause, play, isPlaying, hidePlayer } = useContext(PlayerContext);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(1);

  useEffect(() => {
    if (!currentSong) return;
    let isMounted = true;
    let playbackInstance: Audio.Sound | undefined;
    (async () => {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentSong.file },
        { shouldPlay: isPlaying },
        (status: AVPlaybackStatus) => {
          if (!isMounted) return;
          if (status.isLoaded) {
            setPosition((status as AVPlaybackStatusSuccess).positionMillis || 0);
            setDuration((status as AVPlaybackStatusSuccess).durationMillis || 1);
          }
        }
      );
      setSound(newSound);
      setIsLoaded(true);
      playbackInstance = newSound;
    })();
    return () => {
      isMounted = false;
      if (playbackInstance) playbackInstance.unloadAsync();
    };
    // eslint-disable-next-line
  }, [currentSong]);

  useEffect(() => {
    if (sound && isLoaded) {
      if (isPlaying) {
        sound.playAsync();
      } else {
        sound.pauseAsync();
      }
    }
  }, [isPlaying, sound, isLoaded]);

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else play();
  };

  const handleScrub = async (newPosition: number) => {
    if (sound) {
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  // Scrubber logic using touch location
  const handleProgressBarPress = (e: GestureResponderEvent) => {
    if (!duration || !progressBarWidth) return;
    const x = e.nativeEvent.locationX;
    const percent = Math.max(0, Math.min(1, x / progressBarWidth));
    const newPos = percent * duration;
    handleScrub(newPos);
  };

  const onProgressBarLayout = (e: LayoutChangeEvent) => {
    setProgressBarWidth(e.nativeEvent.layout.width);
  };

  if (!isVisible || !currentSong) return null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: currentSong.cover }} style={styles.cover} />
        <View style={styles.info}>
          <ThemedText style={styles.title} numberOfLines={1}>{currentSong.title}</ThemedText>
          <ThemedText type='small' style={styles.subtitle} numberOfLines={1}>
            {currentSong.artist}
            {currentSong.album ? ` | ${currentSong.album}` : ''}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={hidePlayer} style={styles.addButton}>
          <Ionicons name="close" size={28} color={Colors.dark.textGrey} />
        </TouchableOpacity>
      </View>
      <View style={styles.progressRow}>
        <ThemedText style={styles.time}>{formatTime(position)}</ThemedText>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={Colors.dark.blue} />
        </TouchableOpacity>
        <ThemedText style={styles.time}>{formatTime(duration)}</ThemedText>
      </View>
      <View
        style={styles.progressBarContainer}
        onLayout={onProgressBarLayout}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleProgressBarPress}
      >
        <View style={styles.progressBarBg} />
        <View style={[styles.progressBar, { width: `${(position / duration) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: Colors.dark.purpleDark,
    borderWidth: 1,
    borderColor: Colors.dark.textGrey,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80, // above tab bar
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    color: Colors.dark.pink,
    marginBottom: 3,
  },
  subtitle: {
    color: Colors.dark.white,
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  playButton: {
    marginHorizontal: 12,
  },
  time: {
    color: Colors.dark.white,
    fontSize: 12,
    width: 36,
    textAlign: 'center',
    flex: 1,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'transparent',
    borderRadius: 3,
    marginTop: 2,
    marginBottom: 2,
    overflow: 'hidden',
  },
  progressBarBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.dark.white,
    borderRadius: 3,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.dark.blue,
    borderRadius: 3,
  },
  addButton: {
    marginLeft: 8,
    padding: 4,
  },
}); 