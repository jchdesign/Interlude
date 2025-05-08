import { Stack } from 'expo-router';
import React from 'react';
import { CreateMusicProvider } from './CreateMusicContext';

export default function CreateLayout() {
  return (
    <CreateMusicProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="index"
      >
        <Stack.Screen
          name="index"
        />
        <Stack.Screen
          name="select-music-category"
        />
        <Stack.Screen
          name="select-music-for-post"
        />
        <Stack.Screen
          name="add-post"
        />
      </Stack>
    </CreateMusicProvider>
  );
} 