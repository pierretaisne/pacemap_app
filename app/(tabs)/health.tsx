import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppleHealthConnect from '../../components/AppleHealthConnect';
import useHealthData from '../../hooks/useHealthData';

export default function HealthScreen() {
  const { steps, isLoading, error, hasPermissions } = useHealthData();
  
  const openHealthSettings = () => {
    Linking.openURL('x-apple-health://').catch(() => {
      Linking.openURL('app-settings:').catch(() => {
        Alert.alert(
          'Cannot Open Settings', 
          'Please open the Settings app manually and go to Privacy & Security > Health to grant permissions.'
        );
      });
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health</Text>
          <Text style={styles.headerSubtitle}>Track your activity</Text>
        </View>
        
        {Platform.OS === 'ios' ? (
          <>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading health data...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={openHealthSettings}
                >
                  <Text style={styles.buttonText}>Open Health Settings</Text>
                </TouchableOpacity>
              </View>
            ) : !hasPermissions ? (
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                  Please grant access to your health data to track your steps.
                </Text>
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={openHealthSettings}
                >
                  <Text style={styles.buttonText}>Grant Access</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Today's Activity</Text>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Steps</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min(steps / 10000 * 100, 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(steps / 10000 * 100)}% of daily goal
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.notSupportedContainer}>
            <Text style={styles.notSupportedText}>
              Health tracking is currently only available on iOS devices.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Outfit-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Outfit-Regular',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  errorContainer: {
    padding: 20,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Outfit-Medium',
    marginBottom: 16,
  },
  permissionContainer: {
    padding: 20,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    fontFamily: 'Outfit-SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'Outfit-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Outfit-Regular',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
  notSupportedContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notSupportedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
}); 