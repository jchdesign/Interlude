import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, useColorScheme, View, Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useState } from 'react';
import { onAuthStateChanged } from '@/firebase';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as Font from 'expo-font';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
// import { initializeSpotify } from '@/services/spotify';
import { PlayerProvider } from '@/context/PlayerContext';
import Player from '@/components/Player';
import { Colors } from '@/constants/Colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [fontsLoaded, fontError] = useFonts({
    ...MaterialCommunityIcons.font,
    'MaterialCommunityIcons': require('../assets/fonts/MaterialCommunityIcons.ttf'),
    'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
    'Figtree-Medium': require('../assets/fonts/Figtree-Medium.ttf'),
    'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
    'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
    'Figtree-Black': require('../assets/fonts/Figtree-Black.ttf'),
  });

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'MaterialCommunityIcons': require('../assets/fonts/MaterialCommunityIcons.ttf'),
        'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
        'Figtree-Medium': require('../assets/fonts/Figtree-Medium.ttf'),
        'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
        'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
        'Figtree-Black': require('../assets/fonts/Figtree-Black.ttf'),
      });
    }
    loadFonts();
  }, []);

  // Remove or comment out the initializeSpotify call
  // await initializeSpotify();

  const onAuthStateChangedCallback = (user: FirebaseAuthTypes.User | null) => {
    console.log('onAuthStateChanged', user)
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(onAuthStateChangedCallback);
    return subscriber;
  }, [])

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="(auth)" 
          />
          <Stack.Screen 
            name="(onboarding)" 
          />
          <Stack.Screen 
            name="artist/(tabs)" 
          />
          <Stack.Screen 
            name="listener/(tabs)" 
          />
        </Stack>
        <Player />
      </PlayerProvider>
    </ThemeProvider>
  );
}