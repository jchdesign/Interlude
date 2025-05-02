import { getFirestore, collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';

if (!app) {
  throw new Error('Firebase app not initialized');
}

const db = getFirestore(app);

export interface UserData {
  type: 'artist' | 'listener';
  name?: string;
  username?: string;
  email: string;
  profilePicture?: string;
  birthday?: Date;
  // Artist specific fields
  spotifyId?: string;
  location?: string;
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
}

export const createUserProfile = async (userData: UserData) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    // Determine which collection to use based on user type
    const collectionName = userData.type === 'artist' ? 'artists' : 'listeners';
    const userRef = doc(db, collectionName, user.uid);

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

    console.log('Successfully created user profile in collection:', collectionName);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (updates: Partial<UserData>) => {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No user logged in');

  // Get the user's current type to determine which collection to update
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const userType = userDoc.data()?.type;

  if (!userType) throw new Error('User type not found');

  const collectionName = userType === 'artist' ? 'artists' : 'listeners';
  const profileRef = doc(db, collectionName, user.uid);
  
  await updateDoc(profileRef, {
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

    // First check if the user exists in either collection
    const artistRef = doc(db, 'artists', user.uid);
    const listenerRef = doc(db, 'listeners', user.uid);
    
    const [artistDoc, listenerDoc] = await Promise.all([
      getDoc(artistRef),
      getDoc(listenerRef)
    ]);

    let collectionName: string;
    if (artistDoc.exists()) {
      collectionName = 'artists';
    } else if (listenerDoc.exists()) {
      collectionName = 'listeners';
    } else {
      console.error('User profile not found in either collection');
      throw new Error('User profile not found');
    }

    const profileRef = doc(db, collectionName, user.uid);
    
    await updateDoc(profileRef, {
      ...fields,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export { db };