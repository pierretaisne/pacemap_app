import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { MapPin, TrendingUp } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import StepCounter from '../../components/StepCounter';
import CoinBalance from '../../components/CoinBalance';
import { getUserProfile } from '../../lib/supabase';
import { UserProfile } from '../../lib/types';

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop' }} 
          style={styles.headerImage} 
        />
        <View style={styles.overlay}>
          <Text style={styles.title}>Step Explorer</Text>
          <Text style={styles.subtitle}>Walk to earn, explore to learn</Text>
        </View>
        <View style={styles.coinBalanceContainer}>
          <CoinBalance />
        </View>
      </View>
      
      <View style={styles.content}>
        <StepCounter />
        
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <TrendingUp size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>Your Progress</Text>
          </View>
          <Text style={styles.infoText}>
            You've walked a total of {userProfile?.steps?.toLocaleString() || 0} steps and earned {userProfile?.coins?.toLocaleString() || 0} coins.
          </Text>
          <Text style={styles.infoText}>
            Keep walking to earn more coins and unlock exclusive landmarks around the world!
          </Text>
        </View>
        
        <Link href="/map" asChild>
          <TouchableOpacity style={styles.button}>
            <MapPin size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Explore Map</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    color: '#fff',
    opacity: 0.9,
  },
  coinBalanceContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    marginLeft: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Outfit-Regular',
    color: '#555',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
});