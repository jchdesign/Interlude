import { getFirestore, collection, doc, setDoc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
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
  displayGenre?: string;
  displaySubgenre?: string;
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
  const db = getFirestore();
  const followRef = doc(collection(db, 'following'));
  await setDoc(followRef, {
    follow_id: followRef.id,
    follower_id,
    following_id,
    createdAt: new Date(),
  });
};

// --- Fans Collection ---
export const addFan = async (listener_id: string, artist_id: string) => {
  const db = getFirestore();
  const fanRef = doc(collection(db, 'fans'));
  await setDoc(fanRef, {
    fan_id: fanRef.id,
    listener_id,
    artist_id,
    createdAt: new Date(),
  });
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

export { db };