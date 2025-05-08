import React, { createContext, useState, useCallback } from 'react';

export interface SongData {
  file: string;
  cover: string;
  title: string;
  artist: string;
  album: string;
}

interface PlayerContextType {
  currentSong: SongData | null;
  isVisible: boolean;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  showPlayer: (song: SongData) => void;
  hidePlayer: () => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  currentSong: null,
  isVisible: false,
  isPlaying: false,
  play: () => {},
  pause: () => {},
  showPlayer: () => {},
  hidePlayer: () => {},
});

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const showPlayer = useCallback((song: SongData) => {
    setCurrentSong(song);
    setIsVisible(true);
    setIsPlaying(true);
  }, []);
  const hidePlayer = useCallback(() => {
    setIsVisible(false);
    setIsPlaying(false);
  }, []);

  return (
    <PlayerContext.Provider value={{ currentSong, isVisible, isPlaying, play, pause, showPlayer, hidePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}; 