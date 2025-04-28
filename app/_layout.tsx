import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useState } from 'react';
import { onAuthStateChanged } from '@/firebase';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as Font from 'expo-font';
import { initializeSpotify } from '@/services/spotify';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
        'Figtree-Medium': require('../assets/fonts/Figtree-Medium.ttf'),
        'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
        'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
        'Figtree-Black': require('../assets/fonts/Figtree-Black.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    async function initializeServices() {
      try {
        await initializeSpotify();
      } catch (error) {
        console.error('Failed to initialize Spotify:', error);
      }
    }
    initializeServices();
  }, []);

  const onAuthStateChangedCallback = (user: FirebaseAuthTypes.User | null) => {
    console.log('onAuthStateChanged', user)
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(onAuthStateChangedCallback);
    return subscriber;
  }, [])

  if (initializing || !fontsLoaded) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}
      >
        <ActivityIndicator size='large'/>
      </View>
    )
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="(auth)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="(onboarding)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="artist/(tabs)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="listener/(tabs)" 
          options={{ headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}