import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getUserAssets } from '../../lib/supabase';
import { Link } from 'expo-router';
import { Building, MapPin, ArrowRight } from 'lucide-react-native';
import { UserAsset } from '../../lib/types';

export default function AssetsScreen() {
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAssets();
  }, []);

  const fetchUserAssets = async () => {
    try {
      setLoading(true);
      const result = await getUserAssets();
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setUserAssets(result.data);
      }
    } catch (error) {
      console.error('Error fetching user assets:', error);
      setError('Failed to load your assets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your assets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserAssets}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (userAssets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Building size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Assets Yet</Text>
        <Text style={styles.emptyText}>
          You haven't purchased any assets yet. Explore the map and use your coins to buy landmarks and buildings!
        </Text>
        <Link href="/map" asChild>
          <TouchableOpacity style={styles.exploreButton}>
            <MapPin size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.exploreButtonText}>Explore Map</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Assets</Text>
        <Text style={styles.headerSubtitle}>Your property portfolio</Text>
      </View>

      <FlatList
        data={userAssets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.assetCard}>
            {item.asset?.image_url && (
              <Image 
                source={{ uri: item.asset.image_url }} 
                style={styles.assetImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{item.asset?.name || 'Unknown Asset'}</Text>
              <Text style={styles.assetDescription} numberOfLines={2}>
                {item.asset?.description || 'No description available'}
              </Text>
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseLabel}>Purchased for:</Text>
                <View style={styles.priceContainer}>
                  <Image 
                    source={{ uri: 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/Group%2060.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL0dyb3VwIDYwLnBuZyIsImlhdCI6MTc0MTAxNDU5MSwiZXhwIjoyMDU2Mzc0NTkxfQ.zKhfnMiJLbm-wOeBWemq3CZmJsJWLF76QAAcoSvAw18' }} 
                    style={styles.priceIcon} 
                  />
                  <Text style={styles.priceText}>{item.purchase_price.toLocaleString()}</Text>
                </View>
              </View>
              <Text style={styles.purchaseDate}>
                Purchased on {new Date(item.purchase_date).toLocaleDateString()}
              </Text>
            </View>
            <Link href={`/map?asset=${item.asset_id}`} asChild>
              <TouchableOpacity style={styles.viewButton}>
                <MapPin size={20} color="#007AFF" />
              </TouchableOpacity>
            </Link>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  assetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  assetImage: {
    width: '100%',
    height: 180,
  },
  assetInfo: {
    padding: 16,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  assetDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  purchaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  purchaseLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  purchaseDate: {
    fontSize: 12,
    color: '#999',
  },
  viewButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  exploreButton: {
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
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
});