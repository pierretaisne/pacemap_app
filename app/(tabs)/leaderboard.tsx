import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

// Money icon URL
const MONEY_ICON_URL = 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/Group%2060.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL0dyb3VwIDYwLnBuZyIsImlhdCI6MTc0MTAxNDU5MSwiZXhwIjoyMDU2Mzc0NTkxfQ.zKhfnMiJLbm-wOeBWemq3CZmJsJWLF76QAAcoSvAw18';

// Default avatar URL
const DEFAULT_AVATAR_URL = 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/default_avatar.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL2RlZmF1bHRfYXZhdGFyLnBuZyIsImlhdCI6MTcwOTQ5NTg5OCwiZXhwIjoyMDI0ODU1ODk4fQ.mwwgYxXOHXXXhPKHDGhPVL_rlUYGDf_4wQZ_oBpzQXE';

interface LeaderboardUser {
  display_name: string;
  avatar_url: string;
  coins: number;
  buildings: number;
}

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          display_name,
          avatar_url,
          coins,
          id
        `)
        .order('coins', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      if (data) {
        const leaderboardWithBuildings = await Promise.all(
          data.map(async (user) => {
            const { data: assets, error: assetsError } = await supabase
              .from('user_assets')
              .select('id', { count: 'exact' })
              .eq('user_id', user.id);

            return {
              display_name: user.display_name || 'Player',
              avatar_url: user.avatar_url || DEFAULT_AVATAR_URL,
              coins: user.coins || 0,
              buildings: assets?.length || 0
            };
          })
        );

        setLeaderboard(leaderboardWithBuildings);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {leaderboard.map((user, index) => (
          <View key={index} style={styles.leaderboardRow}>
            <View style={styles.rankContainer}>
              {index < 3 ? (
                <FontAwesome5 
                  name="crown" 
                  size={20} 
                  color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} 
                />
              ) : (
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Image 
                source={{ uri: user.avatar_url }}
                style={styles.avatar}
                defaultSource={{ uri: DEFAULT_AVATAR_URL }}
              />
              <Text style={styles.username}>{user.display_name}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Image source={{ uri: MONEY_ICON_URL }} style={styles.statIcon} />
                <Text style={styles.statText}>{user.coins.toLocaleString()}</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.iconCircle, { backgroundColor: '#B197FC' }]}>
                  <FontAwesome5 name="building" size={10} color="#ffffff" />
                </View>
                <Text style={styles.statText}>{user.buildings}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 5,
    marginBottom: 10,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
    fontFamily: Platform.select({ ios: 'Outfit-Bold', android: 'Outfit-Bold', web: 'Outfit-Bold' }),
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#000000',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.select({ ios: 'Outfit-SemiBold', android: 'Outfit-SemiBold', web: 'Outfit-SemiBold' }),
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    width: 20,
    height: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.select({ ios: 'Outfit-Medium', android: 'Outfit-Medium', web: 'Outfit-Medium' }),
  },
}); 