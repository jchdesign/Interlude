import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Pressable } from 'react-native';
import { HomeIcon, MagnifyingGlassIcon, CalendarIcon, UserCircleIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, usePathname } from 'expo-router';

interface CustomTabBarButtonProps extends React.ComponentProps<typeof Pressable> {
  children: React.ReactNode;
  accessibilityState?: { selected?: boolean };
}

function CustomTabBarButton({ children, accessibilityState, ...rest }: CustomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;
  return (
    <Pressable style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} {...rest}>
      {focused && (
        <View style={{
          position: 'absolute',
          top: 0,
          width: '80%',
          height: 5,
          backgroundColor: Colors.dark.pink,
        }} />
      )}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ height: 80, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 32, width: 32 }}>
            {children}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  const iconMap: Record<string, React.ComponentType<any>> = {
    home: HomeIcon,
    search: MagnifyingGlassIcon,
    events: CalendarIcon,
    profile: UserCircleIcon,
  };

  return (
    <Tabs
      screenOptions={({ route }) => {
        return {
          tabBarActiveTintColor: Colors.dark.white,
          tabBarInactiveTintColor: Colors.dark.white,
          headerShown: false,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarShowLabel: false,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              height: 80,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: Colors.dark.background,
              borderTopWidth: 1,
              borderTopColor: Colors.dark.textGrey,
            },
            default: {
              height: 80,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: Colors.dark.background,
              borderTopWidth: 1,
              borderTopColor: Colors.dark.textGrey,
            },
          }),
          tabBarIcon: ({ color, size }) => {
            const Icon = iconMap[route.name] || HomeIcon;
            return <Icon color={color} size={size ?? 40} />;
          },
        };
      }}
    >
      <Tabs.Screen
        name="home"
        listeners={{
          tabPress: (e) => {
            if (pathname !== '/listener/(tabs)/home') {
              e.preventDefault();
              router.replace('/listener/(tabs)/home');
            }
          },
        }}
      />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
