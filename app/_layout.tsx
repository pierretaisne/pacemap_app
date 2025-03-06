import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMapLocationDot, faHouse } from '@fortawesome/free-solid-svg-icons';
import 'react-native-url-polyfill/auto';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Add FontAwesome icons to the library
library.add(faMapLocationDot, faHouse);

// Set Mapbox access token globally
if (Platform.OS === 'web') {
  // For web
  (window as any).MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHZ0YWlzbmUiLCJhIjoiY203cnRrNThtMDdheDJxcjJ5M3FiazlnbiJ9.ifzyQkQ--m8NlppKG-hstA';
}

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Steps],
    write: [],
  },
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.frameworkReady?.();
    }
  }, []);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
          console.log('Error initializing HealthKit:', err);
        }
      });
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          // Auth screens
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : (
          // Main app screens
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </View>
  );
}