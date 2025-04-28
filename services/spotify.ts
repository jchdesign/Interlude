import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firestore';
import { SPOTIFY_CONFIG } from '@/config/spotify';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
}

let accessToken: string | null = null;

export async function initializeSpotify() {
  if (!SPOTIFY_CONFIG.accessToken) {
    throw new Error('Spotify access token is not configured');
  }
  accessToken = SPOTIFY_CONFIG.accessToken;
}

export async function searchArtists(query: string): Promise<SpotifyArtist[]> {
  try {
    if (!accessToken) {
      await initializeSpotify();
    }

    const response = await fetch(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      await initializeSpotify();
      return searchArtists(query); // Retry with new token
    }

    if (!response.ok) {
      throw new Error('Failed to search artists');
    }

    const data = await response.json();
    return data.artists.items;
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
}

export async function getArtist(artistId: string): Promise<SpotifyArtist | null> {
  try {
    if (!accessToken) {
      await initializeSpotify();
    }

    const response = await fetch(`${SPOTIFY_API_BASE}/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      await initializeSpotify();
      return getArtist(artistId); // Retry with new token
    }

    if (!response.ok) {
      throw new Error('Failed to get artist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting artist:', error);
    return null;
  }
}

export async function saveArtistToProfile(artist: SpotifyArtist) {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user logged in');
  }

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    name: artist.name,
    popularity: artist.popularity,
    spotify_link: artist.external_urls.spotify,
    spotify_data: artist
  });
} 