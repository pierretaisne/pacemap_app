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
// Import from our local file
import AppleHealthKit from '../hooks/AppleHealthKit';
import type { HealthKitPermissions } from 'react-native-health';

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

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [healthKitInitialized, setHealthKitInitialized] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
  });

  // Initialize HealthKit once at app startup
  useEffect(() => {
    const initializeHealthKit = async () => {
      if (Platform.OS !== 'ios' || healthKitInitialized) {
        return;
      }

      // Check if running on simulator
      const isSimulator = process.env.NODE_ENV !== 'production';
      if (isSimulator) {
        console.log('[HealthKit] Running on simulator. HealthKit may not work properly.');
      }

      try {
        const permissions = {
          permissions: {
            read: [
              AppleHealthKit.Constants.Permissions.Steps,
              AppleHealthKit.Constants.Permissions.StepCount
            ],
            write: [],
          },
        } as HealthKitPermissions;

        console.log('[HealthKit] Starting initialization...');
        
        // First initialize
        AppleHealthKit.initHealthKit(permissions, (err: any) => {
          if (err) {
            console.log('[HealthKit] Error initializing:', err);
            return;
          }
          console.log('[HealthKit] Initialized successfully');
          
          // After initialization, explicitly request authorization
          AppleHealthKit.isAvailable((error: any, available: boolean) => {
            if (error) {
              console.log('[HealthKit] Error checking availability:', error);
              return;
            }
            
            if (!available) {
              console.log('[HealthKit] Not available on this device');
              return;
            }

            // Request authorization
            AppleHealthKit.getAuthStatus(permissions, (error: any, result: any) => {
              if (error) {
                console.log('[HealthKit] Error getting auth status:', error);
                return;
              }
              console.log('[HealthKit] Auth status:', result);
              setHealthKitInitialized(true);
            });
          });
        });
      } catch (error) {
        console.log('[HealthKit] Caught error during initialization:', error);
      }
    };

    initializeHealthKit();
  }, [healthKitInitialized]);

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
    async function prepare() {
      try {
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    }
    prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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