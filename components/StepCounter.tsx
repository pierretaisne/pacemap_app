import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { updateUserSteps } from '../lib/supabase';
import { Footprints } from 'lucide-react-native';

// Mock function for step counting (in a real app, this would use HealthKit/Google Fit)
const getStepCount = async (): Promise<number> => {
  // In a real app, this would connect to HealthKit/Google Fit
  // For demo purposes, we'll generate a random number between 100-1000
  return Math.floor(Math.random() * 900) + 100;
};

export default function StepCounter() {
  const [steps, setSteps] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    if (Platform.OS === 'web') {
      // On web, we'll just use mock data
      setSteps(Math.floor(Math.random() * 9000) + 1000);
      setLastSync(new Date());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const count = await getStepCount();
      setSteps(count);
      setLastSync(new Date());
    } catch (err) {
      setError('Failed to fetch step count');
      console.error('Error fetching steps:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncSteps = async () => {
    if (!steps) return;
    
    try {
      setSyncing(true);
      setError(null);
      
      const result = await updateUserSteps(steps);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Reset steps after successful sync
        setSteps(0);
        setLastSync(new Date());
      }
    } catch (err) {
      setError('Failed to sync steps');
      console.error('Error syncing steps:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Footprints size={28} color="#007AFF" />
        <Text style={styles.title}>Step Counter</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching step count...</Text>
        </View>
      ) : (
        <>
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsCount}>{steps || 0}</Text>
            <Text style={styles.stepsLabel}>steps</Text>
          </View>
          
          {lastSync && (
            <Text style={styles.syncInfo}>
              Last updated: {lastSync.toLocaleTimeString()}
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={fetchSteps}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={syncSteps}
              disabled={syncing || !steps}
            >
              {syncing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Sync Steps
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Text style={styles.infoText}>
            Every 100 steps = 1 coin
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    color: '#666',
  },
  stepsContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  stepsCount: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    color: '#007AFF',
  },
  stepsLabel: {
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    color: '#666',
    marginTop: 4,
  },
  syncInfo: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Outfit-Medium',
    color: '#333',
  },
  primaryButtonText: {
    color: '#fff',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Medium',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});