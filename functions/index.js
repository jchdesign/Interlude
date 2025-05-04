const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ 
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

admin.initializeApp();

// Get Spotify credentials from Firebase config
const config = functions.config();
const SPOTIFY_CLIENT_ID = config?.spotify?.client_id;
const SPOTIFY_CLIENT_SECRET = config?.spotify?.client_secret;

// Validate credentials
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('Missing Spotify credentials. Please set them using:');
  console.error('firebase functions:config:set spotify.client_id="YOUR_CLIENT_ID" spotify.client_secret="YOUR_CLIENT_SECRET"');
}

let accessToken = null;
let tokenExpires = null;

async function getAccessToken() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured');
  }

  if (accessToken && tokenExpires && new Date() < tokenExpires) {
    return accessToken;
  }

  const authUrl = 'https://accounts.spotify.com/api/token';
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');

  const response = await axios.post(authUrl, authData, {
    auth: {
      username: SPOTIFY_CLIENT_ID,
      password: SPOTIFY_CLIENT_SECRET
    }
  });

  accessToken = response.data.access_token;
  tokenExpires = new Date();
  tokenExpires.setSeconds(tokenExpires.getSeconds() + response.data.expires_in - 60);
  return accessToken;
}

// Original callable function
exports.searchSpotifyArtist = functions.https.onCall(async (data, context) => {
  const query = data.q;
  if (!query) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing "q" parameter');
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { q: query, type: 'artist', limit: 10 }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching Spotify:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', 'Error searching Spotify', error.message);
  }
});

// CORS-enabled function for local development
exports.searchSpotifyArtistCors = functions.https.onRequest((req, res) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  return cors(req, res, async () => {
    const query = req.query.q;
    if (!query) {
      res.status(400).json({ error: 'Missing "q" parameter' });
      return;
    }

    try {
      const token = await getAccessToken();
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { q: query, type: 'artist', limit: 10 }
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error searching Spotify:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Error searching Spotify',
        details: error.message
      });
    }
  });
});

// Get Google Places API key from Firebase config
const GOOGLE_PLACES_API_KEY = config?.google?.places_key;

// Validate API key
if (!GOOGLE_PLACES_API_KEY) {
  console.error('Missing Google Places API key. Please set it using:');
  console.error('firebase functions:config:set google.places_key="YOUR_API_KEY"');
}

// Places API proxy with CORS support
exports.placesProxy = functions.https.onRequest((req, res) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  return cors(req, res, async () => {
    const input = req.query.input;
    const type = req.query.type || 'autocomplete';
    const placeId = req.query.placeId;

    if (!input && !placeId) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    try {
      let url = '';
      if (type === 'autocomplete') {
        url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${
          encodeURIComponent(input)
        }&types=geocode&key=${GOOGLE_PLACES_API_KEY}`;
        console.log('Making Places API request to:', url);
      } else if (type === 'details' && placeId) {
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
          placeId
        }&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`;
      } else {
        res.status(400).json({ error: 'Invalid request type' });
        return;
      }

      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching places data:', error);
      res.status(500).json({ 
        error: 'Error fetching places data',
        details: error.message
      });
    }
  });
});
