import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import useHealthData from '../hooks/useHealthData';

export default function HealthScreen() {
  const { steps, error, isLoading, isAuthorized, refreshSteps } = useHealthData();

  const openHealthApp = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('x-apple-health://');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Today's Steps</Text>
        
        {isAuthorized ? (
          <>
            <Text style={styles.steps}>{steps}</Text>
            
            {error && (
              <Text style={styles.error}>{error}</Text>
            )}

            <TouchableOpacity 
              style={styles.button} 
              onPress={refreshSteps}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Loading...' : 'Refresh Steps'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.message}>
              Health data access is required to display your step count.
            </Text>
            
            {error && (
              <Text style={styles.error}>{error}</Text>
            )}
            
            <TouchableOpacity style={styles.button} onPress={openHealthApp}>
              <Text style={styles.buttonText}>Open Health App</Text>
            </TouchableOpacity>
            
            <Text style={styles.instructions}>
              To enable access, go to the Health app, tap on your profile picture, 
              select "Privacy & Settings" → "Apps" → "PaceMap" and enable "Steps" access.
            </Text>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={refreshSteps}
            >
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'Outfit-Regular',
  },
  steps: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    fontFamily: 'Outfit-Bold',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
  instructions: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Medium',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Medium',
  },
}); 