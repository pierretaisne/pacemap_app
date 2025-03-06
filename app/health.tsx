import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useHealthData from '../hooks/useHealthData';

export default function HealthScreen() {
  const [selectedDate] = useState(new Date());
  const { 
    steps, 
    flightsClimbed, 
    distance,
    hasPermissions,
    error, 
    refreshData 
  } = useHealthData(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Today's Activity</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{steps}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{flightsClimbed}</Text>
            <Text style={styles.statLabel}>Floors</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(distance / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>KM</Text>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        
        {!hasPermissions && (
          <Text style={styles.warning}>
            Please grant access to Health data in your device settings
          </Text>
        )}

        <TouchableOpacity style={styles.button} onPress={refreshData}>
          <Text style={styles.buttonText}>Refresh Data</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    fontFamily: 'Outfit-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
  warning: {
    color: '#FF9500',
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