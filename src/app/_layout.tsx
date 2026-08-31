import '@/global.css';

import { useEffect, useState } from 'react';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { useColorScheme } from 'nativewind';

import { NAV_THEME } from '@/lib/theme';
import { hydrateProfile, startProfilePersistence } from '@/lib/profile-persistence';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    hydrateProfile().finally(() => setProfileReady(true));
  }, []);

  useEffect(() => {
    if (!profileReady) return;
    SplashScreen.hideAsync();
    return startProfilePersistence();
  }, [profileReady]);

  if (!profileReady) return null;

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="session" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
