import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useHealthData from '../hooks/useHealthData';

export default function HealthScreen() {
  const { steps, error, refreshSteps } = useHealthData();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Today's Steps</Text>
        <Text style={styles.steps}>{steps}</Text>
        
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={refreshSteps}>
          <Text style={styles.buttonText}>Refresh Steps</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Medium',
  },
}); 