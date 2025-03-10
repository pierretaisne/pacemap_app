import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Asset, UserProfile } from '../../lib/types';
import { useRouter } from 'expo-router';

// Money icon URL
const MONEY_ICON_URL = 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/Group%2060.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL0dyb3VwIDYwLnBuZyIsImlhdCI6MTc0MTAxNDU5MSwiZXhwIjoyMDU2Mzc0NTkxfQ.zKhfnMiJLbm-wOeBWemq3CZmJsJWLF76QAAcoSvAw18';

// Default avatar URL
const DEFAULT_AVATAR_URL = 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/default_avatar.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL2RlZmF1bHRfYXZhdGFyLnBuZyIsImlhdCI6MTcwOTQ5NTg5OCwiZXhwIjoyMDI0ODU1ODk4fQ.mwwgYxXOHXXXhPKHDGhPVL_rlUYGDf_4wQZ_oBpzQXE';

const screenWidth = Dimensions.get('window').width;

interface StepLog {
  date: string;
  steps: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userSteps, setUserSteps] = useState<number>(0);
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL);
  const [userName, setUserName] = useState<string>('');
  const [selectedBarDate, setSelectedBarDate] = useState<string | null>(null);

  // Get the last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile data (coins and steps)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('coins, steps, avatar_url, display_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      // Fetch user's assets
      const { data: userAssetsData, error: assetsError } = await supabase
        .from('user_assets')
        .select(`
          *,
          asset:assets(*)
        `)
        .eq('user_id', user.id);

      // Fetch last 7 days of step logs
      const { data: stepLogsData, error: stepLogsError } = await supabase
        .from('step_logs')
        .select('date, steps')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      if (stepLogsError) {
        console.error('Error fetching step logs:', stepLogsError);
      } else if (stepLogsData) {
        // Create a map of existing logs
        const logsMap = new Map(stepLogsData.map(log => [log.date, log.steps]));
        
        // Fill in missing days with 0 steps
        const last7Days = getLast7Days();
        const filledLogs = last7Days.map(date => ({
          date,
          steps: logsMap.get(date) || 0
        }));
        
        setStepLogs(filledLogs);
      }

      if (assetsError) {
        console.error('Error fetching user assets:', assetsError);
        return;
      }

      if (profileData) {
        setUserCoins(profileData.coins || 0);
        setUserSteps(profileData.steps || 0);
        setAvatarUrl(profileData.avatar_url || DEFAULT_AVATAR_URL);
        setUserName(profileData.display_name || 'Player');
      }

      if (userAssetsData) {
        setUserAssets(userAssetsData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setIsLoading(false);
    }
  };

  const maxSteps = Math.max(...stepLogs.map(log => log.steps), 1); // Use 1 as minimum to avoid division by zero
  const barWidth = (screenWidth - 80) / 7; // Adjust spacing to fit container

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <FontAwesome5 name="cog" size={18} color="#B197FC" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {isLoading ? (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <FontAwesome5 name="user" size={50} color="#666666" />
              </View>
            ) : (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatar}
                defaultSource={{ uri: DEFAULT_AVATAR_URL }}
              />
            )}
          </View>
          <Text style={styles.username}>{userName || 'Player'}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.buildingOverlay}>
          <View style={[styles.iconCircle, { backgroundColor: '#B197FC' }]}>
            <FontAwesome5 name="building" size={14} color="#ffffff" />
          </View>
          <Text style={styles.overlayText}>{userAssets.length}</Text>
        </View>

        <View style={styles.priceOverlay}>
          <Image source={{ uri: MONEY_ICON_URL }} style={styles.priceIcon} />
          <Text style={styles.overlayText}>{userCoins.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        <View style={styles.stepsOverlay}>
          <View style={styles.stepsHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' }]}>
              <FontAwesome5 name="walking" size={14} color="#ffffff" />
            </View>
            <Text style={styles.overlayText}>{userSteps.toLocaleString()}</Text>
          </View>
          
          <View style={styles.chartContainer}>
            {stepLogs.length === 0 ? 
              getLast7Days().map((date, index) => (
                <View key={date} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: 0,
                        width: barWidth - 10,
                        backgroundColor: '#E5E5E5'
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                </View>
              ))
              :
              stepLogs.map((log, index) => (
                <View key={log.date} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${(log.steps / maxSteps) * 100}%`,
                        width: barWidth - 10,
                        backgroundColor: log.steps > 0 ? '#4CAF50' : '#E5E5E5'
                      }
                    ]} 
                  >
                    <TouchableOpacity 
                      style={styles.barTouchable}
                      onPress={() => setSelectedBarDate(selectedBarDate === log.date ? null : log.date)}
                    >
                      {selectedBarDate === log.date && log.steps > 0 && (
                        <View style={styles.stepCountBubble}>
                          <Text style={styles.stepCount}>{log.steps}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.barLabel}>
                    {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                </View>
              ))
            }
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    paddingBottom: 0,
  },
  settingsButton: {
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
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#000000',
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.select({ ios: 'Outfit-Bold', android: 'Outfit-Bold', web: 'Outfit-Bold' }),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  buildingOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  overlayText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Outfit-Bold', android: 'Outfit-Bold', web: 'Outfit-Bold' }),
  },
  priceOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  priceIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  stepsContainer: {
    padding: 20,
  },
  stepsOverlay: {
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
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 1,
    overflow: 'visible',
  },
  barLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Outfit-Medium', android: 'Outfit-Medium', web: 'Outfit-Medium' }),
  },
  barTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  stepCountBubble: {
    position: 'absolute',
    top: -25,
    left: '50%',
    transform: [{ translateX: -20 }],
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  stepCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Outfit-Medium', android: 'Outfit-Medium', web: 'Outfit-Medium' }),
  },
}); 