import { getFirestore, collection, doc, setDoc, updateDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';

if (!app) {
  throw new Error('Firebase app not initialized');
}

const db = getFirestore(app);

export interface UserData {
  role: 'artist' | 'listener';
  name?: string;
  username?: string;
  email: string;
  profilePicture?: string;
  birthday?: Date;
  // Artist specific fields
  spotifyId?: string;
  spotifyPopularity?: number;
  location?: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  genre?: string;
  subgenre?: string;
  bio?: string;
  coverPhoto?: string;
  additionalPhotos?: string[];
  similarArtists?: string[];
  followedArtists?: string[];
  following?: string[];
  // Listener specific fields
  favoriteGenres?: string[];
  favoriteArtists?: string[];
  moods?: string[];
  favorite_artists_spotify?: { id: string; name: string }[];
}

export const createUserProfile = async (userData: UserData) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    const userRef = doc(db, 'users', user.uid);

    // Check if profile already exists
    const existingDoc = await getDoc(userRef);
    if (existingDoc.exists()) {
      console.error('User profile already exists');
      throw new Error('User profile already exists');
    }

    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Successfully created user profile in collection: users');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (updates: Partial<UserData>) => {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No user logged in');

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const updateProfileFields = async (fields: Partial<UserData>) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('User profile not found in users collection');
      throw new Error('User profile not found');
    }

    await updateDoc(userRef, {
      ...fields,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// --- Following Collection ---
export const addFollowing = async (follower_id: string, following_id: string) => {
  try {
    const db = getFirestore();
    const followRef = doc(collection(db, 'following'));
    await setDoc(followRef, {
      follow_id: followRef.id,
      follower_id,
      following_id,
      createdAt: new Date(),
    });
    console.log('Successfully added following record');
  } catch (error) {
    console.error('Error adding following record:', error);
    throw error;
  }
};

// --- Fans Collection ---
export const addFan = async (listener_id: string, artist_id: string) => {
  try {
    const db = getFirestore();
    const fanRef = doc(collection(db, 'fans'));
    await setDoc(fanRef, {
      fan_id: fanRef.id,
      listener_id,
      artist_id,
      createdAt: new Date(),
    });
    console.log('Successfully added fan record');
  } catch (error) {
    console.error('Error adding fan record:', error);
    throw error;
  }
};

// --- User Vector Collection ---
export const setListenerVector = async (user_id: string, vector: Record<string, number>) => {
  const db = getFirestore();
  const vectorRef = doc(db, 'listener_vector', user_id);
  await setDoc(vectorRef, {
    user_id,
    vector,
    date_updated: new Date(),
  });
};

// --- Artist Vector Collection ---
export const setArtistVector = async (user_id: string, vector: Record<string, number>) => {
  const db = getFirestore();
  const vectorRef = doc(db, 'artist_vector', user_id);
  await setDoc(vectorRef, {
    user_id,
    vector,
    date_updated: new Date(),
  });
};

// --- Dynamic Genre Vector Handling ---
// To avoid hardcoding genres, fetch the genres collection and dynamically add genre fields to the vector as needed.
export const getGenreFields = async (): Promise<string[]> => {
  const db = getFirestore();
  const genresRef = collection(db, 'genres');
  const snapshot = await getDocs(genresRef);
  return snapshot.docs.map(doc => `genre_${doc.id.toLowerCase()}`);
};

export interface PostData {
  post_id: string;
  user_id: string;
  created_at: Date;
  type: 'music' | 'behind_scenes' | 'playlist' | 'live_event' | 'merch';
  content: string;
  media?: string; // URL to the media file in storage
  category?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  tag?: string; // song_id or album_id reference
}

export interface TemporaryPostData {
  type: PostData['type'];
  content: string;
  media?: string;
  category?: string;
  tag?: string; // song_id or album_id reference
}

// --- Posts Collection ---
export const createPost = async (postData: Omit<PostData, 'post_id' | 'created_at'>) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    const postsRef = collection(db, 'posts');
    const newPostRef = doc(postsRef);
    
    const post: PostData = {
      ...postData,
      post_id: newPostRef.id,
      user_id: user.uid,
      created_at: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      ...(postData.tag ? { tag: postData.tag } : {}),
    };

    await setDoc(newPostRef, post);
    console.log('Successfully created post in collection: posts');
    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const createPostFromTemporary = async (temporaryData: TemporaryPostData) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    const postsRef = collection(db, 'posts');
    const newPostRef = doc(postsRef);
    
    const post: PostData = {
      ...temporaryData,
      post_id: newPostRef.id,
      user_id: user.uid,
      created_at: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      ...(temporaryData.tag ? { tag: temporaryData.tag } : {}),
    };

    await setDoc(newPostRef, post);
    console.log('Successfully created post in collection: posts');
    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as PostData);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const getPostsByType = async (type: PostData['type']) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('type', '==', type),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as PostData);
  } catch (error) {
    console.error('Error fetching posts by type:', error);
    throw error;
  }
};

export const updatePost = async (postId: string, updates: Partial<PostData>) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...updates,
      updated_at: new Date()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export interface SongData {
  song_id: string;
  title: string;
  user_id: string;
  year: number;
  file: string; // URL to the song file in Firebase Storage
  genre: string[];
  links: string[];
  vector: number[];
}

export const createSong = async (song: Omit<SongData, 'song_id'>) => {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No user logged in');
  const songsRef = collection(db, 'songs');
  const newSongRef = doc(songsRef);
  const songData: SongData = {
    ...song,
    song_id: newSongRef.id,
    user_id: user.uid,
  };
  await setDoc(newSongRef, songData);
  return songData;
};

export { db };