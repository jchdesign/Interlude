import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the song data
export interface SongData {
  title: string;
  genre: string[];
  links: {
    spotify: string;
    appleMusic: string;
    youtube: string;
    soundcloud: string;
  };
  year: string;
  file: string;
  image: string;
  audio: string;
}

// Define the shape of the post data
export interface PostData {
  blurb: string;
  image: string;
  tag?: string;
  category?: string;
  type?: string;
}

// Define the shape of the context value
interface CreateMusicContextType {
  songData: SongData;
  postData: PostData;
  updateSongData: (data: Partial<SongData>) => void;
  updatePostData: (data: Partial<PostData>) => void;
  resetForm: () => void;
}

// Create the context with a default value
const CreateMusicContext = createContext<CreateMusicContextType | undefined>(undefined);

// Initial state for song data
const initialSongData: SongData = {
  title: '',
  genre: [],
  links: {
    spotify: '',
    appleMusic: '',
    youtube: '',
    soundcloud: '',
  },
  year: '',
  file: '',
  image: '',
  audio: '',
};

// Initial state for post data
const initialPostData: PostData = {
  blurb: '',
  image: '',
  tag: undefined,
  category: undefined,
  type: undefined,
};

// Provider component
export const CreateMusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songData, setSongData] = useState<SongData>(initialSongData);
  const [postData, setPostData] = useState<PostData>(initialPostData);

  // Update song data
  const updateSongData = (data: Partial<SongData>) => {
    setSongData((prev) => ({ ...prev, ...data }));
  };

  // Update post data
  const updatePostData = (data: Partial<PostData>) => {
    setPostData((prev) => ({ ...prev, ...data }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setSongData(initialSongData);
    setPostData(initialPostData);
  };

  const value = {
    songData,
    postData,
    updateSongData,
    updatePostData,
    resetForm,
  };

  return <CreateMusicContext.Provider value={value}>{children}</CreateMusicContext.Provider>;
};

// Custom hook to use the context
export const useCreateMusic = () => {
  const context = useContext(CreateMusicContext);
  if (context === undefined) {
    throw new Error('useCreateMusic must be used within a CreateMusicProvider');
  }
  return context;
}; 