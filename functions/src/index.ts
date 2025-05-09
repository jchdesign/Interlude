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

async function getAccessToken(): Promise<string | null> {
  if (accessToken && tokenExpires && new Date() < tokenExpires) {
    return accessToken;
  }

  const authUrl = 'https://accounts.spotify.com/api/token';
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');

  try {
    const response = await axios.post(authUrl, authData, {
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
    const response = await axios.get(searchUrl, {
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

// Feature extraction on audio upload
export const extractAudioFeatures = functions
  .region('us-central1')
  .storage.object()
  .onFinalize(async (object) => {
    console.log('extractAudioFeatures triggered with object:', {
      name: object.name,
      bucket: object.bucket,
      contentType: object.contentType,
      size: object.size,
      timeCreated: object.timeCreated,
      updated: object.updated
    });

    const filePath = object.name;
    const contentType = object.contentType;
    if (!filePath || !contentType || !contentType.startsWith('audio/')) {
      console.log('Skipping non-audio file:', { filePath, contentType });
      return null;
    }

    try {
      // Get the download URL
      const bucket = admin.storage().bucket(object.bucket);
      const file = bucket.file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      console.log('Generated signed URL:', url);

      // Call your Python API (replace with your actual Cloud Run URL)
      const response = await axios.post('https://audio-extract-api-634050795095.us-central1.run.app/extract', { audio_url: url });
      const features = response.data;
      console.log('Features extracted:', features);

      // Find the song document in Firestore (adjusted for songs/songId/audio/filename.mp3)
      const parts = filePath.split('/');
      let songId: string | null = null;
      if (parts.length >= 4 && parts[0] === 'songs' && parts[2] === 'audio') {
        songId = parts[1];
      }
      console.log('Parsed songId:', songId);
      if (!songId) {
        console.log('Could not parse songId from path:', filePath);
        return null;
      }

      // Update the Firestore document
      await admin.firestore().collection('songs').doc(songId).update({
        vector: features
      });
      console.log('Vector field added to Firestore for songId:', songId);

      return null;
    } catch (error) {
      console.error('Error in extractAudioFeatures:', error);
      return null;
    }
  });

export const testStorageTrigger = functions
  .region('us-central1')
  .storage.object()
  .onFinalize((object) => {
    console.log('Test trigger fired for:', object.name);
    return null;
  }); 