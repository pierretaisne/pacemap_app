import { StyleSheet, Text, View, Switch, ScrollView } from 'react-native';
import { useState } from 'react';
import { Map, MapPin, Navigation, Layers, Compass, Database, User, Heart } from 'lucide-react-native';
import SupabaseConnectionStatus from '../../components/SupabaseConnectionStatus';
import AuthButton from '../../components/AuthButton';
import AppleHealthConnect from '../../components/AppleHealthConnect';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const [showTraffic, setShowTraffic] = useState(false);
  const [showSatellite, setShowSatellite] = useState(false);
  const [showCompass, setShowCompass] = useState(true);
  const [trackLocation, setTrackLocation] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get user email
  supabase.auth.getUser().then(({ data }) => {
    if (data?.user) {
      setUserEmail(data.user.email || null);
    }
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Map size={32} color="#007AFF" />
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.accountInfo}>
          <User size={40} color="#007AFF" style={styles.userIcon} />
          <View>
            <Text style={styles.emailText}>{userEmail || 'User'}</Text>
            <Text style={styles.accountTypeText}>Explorer Account</Text>
          </View>
        </View>
        
        <AuthButton style={styles.signOutButton} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map Display</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Layers size={24} color="#555" />
            <Text style={styles.settingText}>Show Traffic</Text>
          </View>
          <Switch
            value={showTraffic}
            onValueChange={setShowTraffic}
            trackColor={{ false: '#d1d1d6', true: '#81b0ff' }}
            thumbColor={showTraffic ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MapPin size={24} color="#555" />
            <Text style={styles.settingText}>Satellite View</Text>
          </View>
          <Switch
            value={showSatellite}
            onValueChange={setShowSatellite}
            trackColor={{ false: '#d1d1d6', true: '#81b0ff' }}
            thumbColor={showSatellite ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Compass size={24} color="#555" />
            <Text style={styles.settingText}>Show Compass</Text>
          </View>
          <Switch
            value={showCompass}
            onValueChange={setShowCompass}
            trackColor={{ false: '#d1d1d6', true: '#81b0ff' }}
            thumbColor={showCompass ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Connections</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Heart size={24} color="#FF2D55" />
            <Text style={styles.settingText}>Apple Health</Text>
          </View>
          <AppleHealthConnect inSettings={true} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Navigation size={24} color="#555" />
            <Text style={styles.settingText}>Track My Location</Text>
          </View>
          <Switch
            value={trackLocation}
            onValueChange={setTrackLocation}
            trackColor={{ false: '#d1d1d6', true: '#81b0ff' }}
            thumbColor={trackLocation ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Map size={24} color="#555" />
            <Text style={styles.settingText}>Night Mode</Text>
          </View>
          <Switch
            value={nightMode}
            onValueChange={setNightMode}
            trackColor={{ false: '#d1d1d6', true: '#81b0ff' }}
            thumbColor={nightMode ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database</Text>
        <View style={styles.settingInfo}>
          <Database size={24} color="#555" />
          <Text style={styles.settingText}>Supabase Connection</Text>
        </View>
        <SupabaseConnectionStatus />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About This Map</Text>
        <Text style={styles.infoText}>
          This application uses Mapbox Light style (v11) for optimal readability and performance.
        </Text>
        <Text style={styles.infoText}>
          Map data © Mapbox contributors
        </Text>
        <Text style={styles.versionText}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    marginLeft: 12,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 15,
    marginTop: 5,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userIcon: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 24,
    marginRight: 16,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
    color: '#333',
  },
  accountTypeText: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    color: '#666',
    marginTop: 4,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    marginLeft: 12,
  },
  infoSection: {
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Outfit-Regular',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});