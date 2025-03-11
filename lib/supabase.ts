import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from './database.types';

// URL and anon key from environment variables or fallback to hardcoded values
// This ensures the app doesn't crash if env vars aren't loaded
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kccxtmvqzwqgoiiweahd.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjY3h0bXZxendxZ29paXdlYWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzM4MjIsImV4cCI6MjA1NjUwOTgyMn0.udXs1URzPwGuyiENjLnPW7DfwtYFGWhhz7_RAlUdm1w';

// Maximum size for SecureStore (2048 bytes)
const SECURE_STORE_MAX_SIZE = 2000; // Slightly less than 2048 to be safe

// Custom storage implementation for Supabase with AsyncStorage fallback
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    
    try {
      // Check if we're using AsyncStorage fallback
      const isUsingFallback = await AsyncStorage.getItem(`${key}_uses_fallback`);
      
      if (isUsingFallback === 'true') {
        return await AsyncStorage.getItem(key);
      }
      
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('Error reading from storage:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    
    try {
      // Check if value exceeds the size limit
      if (value.length > SECURE_STORE_MAX_SIZE) {
        console.warn(`Value for key "${key}" exceeds SecureStore size limit. Using AsyncStorage fallback.`);
        
        // Mark this key as using fallback storage
        await AsyncStorage.setItem(`${key}_uses_fallback`, 'true');
        // Store the value in AsyncStorage
        await AsyncStorage.setItem(key, value);
        return;
      }
      
      // If within size limit, use SecureStore
      await SecureStore.setItemAsync(key, value);
      // Remove fallback marker if it exists
      await AsyncStorage.removeItem(`${key}_uses_fallback`);
    } catch (error) {
      console.warn('Error writing to storage:', error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    
    try {
      // Clean up both storage locations and markers
      await SecureStore.deleteItemAsync(key);
      await AsyncStorage.removeItem(key);
      await AsyncStorage.removeItem(`${key}_uses_fallback`);
    } catch (error) {
      console.warn('Error removing from storage:', error);
    }
  },
};

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if Supabase is connected
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('countries').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};

// Function to get user profile
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return mock data for demo purposes when not authenticated
      return {
        id: 'demo-user-id',
        username: 'demo_user',
        steps: 5000,
        coins: 2500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    // Get authenticated user's profile
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      
      // Create a new profile if it doesn't exist
      const newProfile = {
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        steps: 0,
        coins: 1000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(newProfile);
        
      if (insertError) {
        console.error('Error creating user profile:', insertError);
      }
      
      return newProfile;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    
    // Return mock data as fallback
    return {
      id: 'demo-user-id',
      username: 'demo_user',
      steps: 5000,
      coins: 2500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

// Function to update user steps
export const updateUserSteps = async (steps: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: 'Not authenticated' };
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a step log for today
    const { data: existingLog } = await supabase
      .from('step_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
      
    if (existingLog) {
      // Update existing log
      const { error } = await supabase
        .from('step_logs')
        .update({ steps: existingLog.steps + steps })
        .eq('id', existingLog.id);
        
      if (error) return { error: error.message };
      
      return { success: true };
    } else {
      // Create new log
      const { error } = await supabase
        .from('step_logs')
        .insert({ user_id: user.id, steps, date: today });
        
      if (error) return { error: error.message };
      
      return { success: true };
    }
  } catch (error) {
    console.error('Error in updateUserSteps:', error);
    return { error: 'Failed to update steps' };
  }
};

// Function to get user assets
export const getUserAssets = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // For demo purposes when not authenticated
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .limit(3);
        
      if (assetsError) {
        console.error('Error fetching assets:', assetsError);
        return { data: [] };
      }
      
      // Create mock user assets from the first few assets
      const mockUserAssets = assets.map((asset, index) => ({
        id: `mock-user-asset-${index}`,
        user_id: 'demo-user-id',
        asset_id: asset.id,
        purchase_price: asset.price || 1000000,
        purchase_date: new Date(Date.now() - (index * 86400000)).toISOString(),
        asset: asset
      }));
      
      return { data: mockUserAssets };
    }
    
    // Get authenticated user's assets
    const { data, error } = await supabase
      .from('user_assets')
      .select(`
        *,
        asset:assets(*)
      `)
      .eq('user_id', user.id);
      
    if (error) return { error: error.message };
    
    return { data };
  } catch (error) {
    console.error('Error in getUserAssets:', error);
    return { data: [] };
  }
};

// Function to purchase an asset
export const purchaseAsset = async (assetId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: 'Not authenticated' };
    
    // Get user profile to check coins
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (!userProfile) return { error: 'User profile not found' };
    
    // Get asset details
    const { data: asset } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();
      
    if (!asset) return { error: 'Asset not found' };
    
    // Check if user has enough coins
    if (userProfile.coins < asset.price) {
      return { error: 'Not enough coins' };
    }
    
    // Start a transaction
    const { error: purchaseError } = await supabase.rpc('purchase_asset', {
      p_user_id: user.id,
      p_asset_id: assetId,
      p_price: asset.price
    });
    
    if (purchaseError) return { error: purchaseError.message };
    
    return { success: true };
  } catch (error) {
    console.error('Error in purchaseAsset:', error);
    return { error: 'Failed to purchase asset' };
  }
};

// Function to get all assets
export const getAllAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*');
      
    if (error) return { error: error.message };
    
    return { data };
  } catch (error) {
    console.error('Error in getAllAssets:', error);
    return { error: 'Failed to fetch assets' };
  }
};