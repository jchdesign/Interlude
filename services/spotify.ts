import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firestore';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import Constants from 'expo-constants';

export interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const isDevelopment = Constants.expoConfig?.extra?.isDevelopment || false;
const functions = getFunctions();

// Connect to emulator if in development
if (isDevelopment) {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Firebase Functions emulator');
  } catch (error) {
    console.warn('Could not connect to Firebase Functions emulator:', error);
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function searchArtists(query: string): Promise<SpotifyArtist[]> {
  try {
    console.log('Searching artists with query:', query);
    
    if (isDevelopment) {
      try {
        // Use CORS-enabled function for local development
        const response = await fetchWithRetry(
          `http://localhost:5001/interlude-8b3a2/us-central1/searchSpotifyArtistCors?q=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        return data.artists.items;
      } catch (error) {
        console.warn('Local development failed, falling back to production:', error);
        // Fall back to production if local development fails
        const response = await fetchWithRetry(
          'https://us-central1-interlude-5d3bf.cloudfunctions.net/searchSpotifyArtistCors?q=' + encodeURIComponent(query),
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        return data.artists.items;
      }
    } else {
      // Use production URL
      const response = await fetchWithRetry(
        'https://us-central1-interlude-5d3bf.cloudfunctions.net/searchSpotifyArtistCors?q=' + encodeURIComponent(query),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      return data.artists.items;
    }
  } catch (error) {
    console.error('Error searching artists:', error);
    throw error;
  }
}

export async function getArtist(artistId: string): Promise<SpotifyArtist | null> {
  try {
    console.log('Getting artist with ID:', artistId);
    
    if (isDevelopment) {
      try {
        // Use CORS-enabled function for local development
        const response = await fetchWithRetry(
          `http://localhost:5001/interlude-8b3a2/us-central1/searchSpotifyArtistCors?q=${encodeURIComponent(artistId)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        return data.artists.items[0] || null;
      } catch (error) {
        console.warn('Local development failed, falling back to production:', error);
        // Fall back to production if local development fails
        const searchArtistsFunction = httpsCallable(functions, 'searchSpotifyArtist');
        const result = await searchArtistsFunction({ q: artistId });
        const data = result.data as { artists: { items: SpotifyArtist[] } };
        return data.artists.items[0] || null;
      }
    } else {
      // Use callable function for production
      const searchArtistsFunction = httpsCallable(functions, 'searchSpotifyArtist');
      const result = await searchArtistsFunction({ q: artistId });
      const data = result.data as { artists: { items: SpotifyArtist[] } };
      return data.artists.items[0] || null;
    }
  } catch (error) {
    console.error('Error getting artist:', error);
    throw error;
  }
}

export async function saveArtistToProfile(artist: SpotifyArtist) {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user logged in');
  }

  const artistRef = doc(db, 'artists', user.uid);
  await updateDoc(artistRef, {
    spotify_id: artist.id,
    name: artist.name,
    popularity: artist.popularity,
    spotify_external_url: artist.external_urls.spotify,
    profile_picture: artist.images[0]?.url || null,
    updatedAt: new Date()
  });
} 