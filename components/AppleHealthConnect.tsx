import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View, ActivityIndicator, Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import useHealthData from '../hooks/useHealthData';


interface StepLog {
  user_id: string;
  steps: number;
  date: string;
  created_at: string;
}

interface AppleHealthConnectProps {
  inSettings?: boolean;
}

export default function AppleHealthConnect({ inSettings = true }: AppleHealthConnectProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Wrap the hook in try-catch to prevent crashes
  let healthData;
  try {
    healthData = useHealthData();
  } catch (error) {
    console.error('Error initializing health data:', error);
    healthData = {
      steps: 0,
      isLoading: false,
      error: 'Failed to initialize health tracking',
      hasPermissions: false,
      refreshSteps: () => {}
    };
  }

  const { steps, isLoading, error, hasPermissions, refreshSteps } = healthData;

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          return;
        }
        
        if (data?.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('Error in checkUser:', err);
        setComponentError('Failed to verify user authentication');
      }
    };
    
    checkUser();
  }, []);

  // Function to open Health app settings
  const openHealthAppSettings = () => {
    try {
      Linking.openURL('x-apple-health://').catch(() => {
        Linking.openURL('app-settings:').catch(() => {
          Alert.alert(
            'Cannot Open Settings', 
            'Please Open the Settings App Manually and go to Privacy & Security > Health to grant permissions.'
          );
        });
      });
    } catch (err) {
      console.error('Error opening settings:', err);
      Alert.alert(
        'Error',
        'Unable to open Health settings. Please open Settings app manually.'
      );
    }
  };

  // Function to handle HealthKit connection
  const handleHealthKitConnection = async () => {
    try {
      if (!hasPermissions) {
        openHealthAppSettings();
        return;
      }
      
      refreshSteps();
      await saveStepData();
    } catch (err) {
      console.error('Error in handleHealthKitConnection:', err);
      Alert.alert('Error', 'Failed to connect to Health. Please try again.');
    }
  };

  // Function to save step data to Supabase
  const saveStepData = async () => {
    if (!userId) {
      Alert.alert('Authentication Required', 'Please log in to save your step data.');
      return;
    }

    if (steps === 0) {
      Alert.alert('No Steps', 'No step data available to save.');
      return;
    }

    setIsSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const stepLog: StepLog = {
        user_id: userId,
        steps: steps,
        date: today,
        created_at: new Date().toISOString()
      };

      const { error: saveError } = await supabase
        .from('step_logs')
        .upsert(stepLog, {
          onConflict: 'user_id,date'
        });

      if (saveError) {
        throw new Error(saveError.message);
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ steps: steps })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error updating user profile:', profileError);
      }

      setLastSyncDate(new Date());
      Alert.alert('Success', 'Successfully saved your step data!');
    } catch (err) {
      console.error('Error in saveStepData:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving your data.');
    } finally {
      setIsSaving(false);
    }
  };

  // If not on iOS, don't render anything
  if (Platform.OS !== 'ios') {
    return null;
  }

  // If there's a component error, show error state
  if (componentError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{componentError}</Text>
      </View>
    );
  }

  // Render a compact version for settings screen
  if (inSettings) {
    return (
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={handleHealthKitConnection}
          disabled={isLoading || isSaving}
        >
          {isLoading || isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.settingsButtonText}>
              {hasPermissions ? 'Sync Steps' : 'Connect Health'}
            </Text>
          )}
        </TouchableOpacity>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {lastSyncDate && (
          <Text style={styles.lastSyncText}>
            Last sync: {lastSyncDate.toLocaleTimeString()}
          </Text>
        )}
      </View>
    );
  }

  // Full component for dedicated screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apple Health</Text>
        {hasPermissions && (
          <Text style={styles.subtitle}>Connected</Text>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={openHealthAppSettings}
          >
            <Text style={styles.buttonText}>Open Health Settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{steps}</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleHealthKitConnection}
            disabled={isSaving || !userId}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {hasPermissions ? 'Save to PaceMap' : 'Connect Health'}
              </Text>
            )}
          </TouchableOpacity>

          {lastSyncDate && (
            <Text style={styles.lastSyncText}>
              Last sync: {lastSyncDate.toLocaleTimeString()}
            </Text>
          )}

          {!hasPermissions && (
            <TouchableOpacity 
              style={styles.button} 
              onPress={openHealthAppSettings}
            >
              <Text style={styles.buttonText}>Open Health Settings</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Outfit-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 4,
    fontFamily: 'Outfit-Regular',
  },
  loader: {
    marginVertical: 30,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Outfit-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Outfit-Regular',
  },
  lastSyncText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
  },
  settingsContainer: {
    padding: 16,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
  },
}); 