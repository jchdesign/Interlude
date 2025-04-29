import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin
admin.initializeApp();

// Get Spotify credentials from Firebase config
const config = functions.config();
const SPOTIFY_CLIENT_ID = config.spotify.client_id;
const SPOTIFY_CLIENT_SECRET = config.spotify.client_secret;

let accessToken: string | null = null;
let tokenExpires: Date | null = null;

interface SpotifyAuthResponse {
  access_token: string;
  expires_in: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  popularity: number;
}

interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[];
  };
}

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpires && new Date() < tokenExpires) {
    return accessToken;
  }

  const authUrl = 'https://accounts.spotify.com/api/token';
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');

  try {
    const response = await axios.post<SpotifyAuthResponse>(authUrl, authData, {
      auth: {
        username: SPOTIFY_CLIENT_ID,
        password: SPOTIFY_CLIENT_SECRET
      }
    });

    accessToken = response.data.access_token;
    tokenExpires = new Date();
    tokenExpires.setSeconds(tokenExpires.getSeconds() + response.data.expires_in - 60); // Refresh 1 minute early

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to get Spotify access token');
  }
}

export const searchSpotifyArtist = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Get query parameter
  const query = req.query.q as string;
  if (!query) {
    res.status(400).json({ error: 'Missing "q" parameter' });
    return;
  }

  try {
    // Get access token
    const token = await getAccessToken();

    // Search Spotify
    const searchUrl = 'https://api.spotify.com/v1/search';
    const response = await axios.get<SpotifySearchResponse>(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: query,
        type: 'artist',
        limit: 10
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error searching Spotify:', error);
    res.status(500).json({ error: 'Error searching Spotify' });
  }
}); 