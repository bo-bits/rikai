import { DefaultTheme, ThemeProvider } from 'expo-router';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { SessionProvider, useSession } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

// Force light mode on web — overrides browser/OS dark mode preference.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.style.colorScheme = 'light';
  document.body.style.backgroundColor = '#ffffff';
}

function AuthGate() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';

    // Routes a signed-in user is allowed to sit on outside the tab group.
    const allowedOutsideTabs = segments[0] === 'chat';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && segments[0] !== '(tabs)' && !allowedOutsideTabs) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.light.background,
        }}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Fraunces-Regular': require('../../assets/fonts/Fraunces-Regular.ttf'),
    'Fraunces-SemiBold': require('../../assets/fonts/Fraunces-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <SessionProvider>
            <AuthGate />
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
