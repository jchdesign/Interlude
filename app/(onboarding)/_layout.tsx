import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="artist/spotify-search" options={{ headerShown: false }} />
      <Stack.Screen name="artist/location" options={{ headerShown: false }} />
      <Stack.Screen name="artist/bio" options={{ headerShown: false }} />
      <Stack.Screen name="artist/profile-picture" options={{ headerShown: false }} />
      <Stack.Screen name="artist/cover-photo" options={{ headerShown: false }} />
      <Stack.Screen name="artist/additional-photos" options={{ headerShown: false }} />
      <Stack.Screen name="artist/similar-artists" options={{ headerShown: false }} />
      <Stack.Screen name="artist/follow-artists" options={{ headerShown: false }} />
      
      <Stack.Screen name="listener/name" options={{ headerShown: false }} />
      <Stack.Screen name="listener/genres" options={{ headerShown: false }} />
      <Stack.Screen name="listener/favorite-artists" options={{ headerShown: false }} />
      <Stack.Screen name="listener/moods" options={{ headerShown: false }} />
      <Stack.Screen name="listener/profile-picture" options={{ headerShown: false }} />
    </Stack>
  );
} 