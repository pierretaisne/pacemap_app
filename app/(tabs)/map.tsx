import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Building, UserProfile } from '../../lib/types';
import { getUserProfile } from '../../lib/supabase';
import { Svg, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';

// Constants for Mapbox
const MAPBOX_STYLE_URL = 'mapbox://styles/mapbox/cj7t3i5yj0unt2rmt3y4b5e32';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94LW1hcC1kZXNpZ24iLCJhIjoiY2syeHpiaHlrMDJvODNidDR5azU5NWcwdiJ9.x0uSqSWGXdoFKuHZC5Eo_Q';

// Default coordinates (New York City)
const DEFAULT_LATITUDE = 40.7128;
const DEFAULT_LONGITUDE = -74.0060;
const DEFAULT_ZOOM = 11;
const DEFAULT_PITCH = 0;
const DEFAULT_BEARING = 0;

// Arcade-style image URL
const ARCADE_IMAGE_URL = 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/pencilpal_47396_can_I_have_an_arcade_styled_image_of_notre_da_da02ea8f-53ab-4cb3-b1fb-3f111525eca9_1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL3BlbmNpbHBhbF80NzM5Nl9jYW5fSV9oYXZlX2FuX2FyY2FkZV9zdHlsZWRfaW1hZ2Vfb2Zfbm90cmVfZGFfZGEwMmVhOGYtNTNhYi00Y2IzLWIxZmItM2YxMTE1MjVlY2E5XzEucG5nIiwiaWF0IjoxNzQxMDIwNTIwLCJleHAiOjIwNTYzODA1MjB9.Orp1j2sG6n2rIY6O3aLqLs95lUcDAeaQdSxLPqfgJb8';

// Money icon URL
const MONEY_ICON_URL = 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/Group%2060.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL0dyb3VwIDYwLnBuZyIsImlhdCI6MTc0MTAxNDU5MSwiZXhwIjoyMDU2Mzc0NTkxfQ.zKhfnMiJLbm-wOeBWemq3CZmJsJWLF76QAAcoSvAw18';

// Building icon URL
const BUILDING_ICON_URL = 'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/building.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL2J1aWxkaW5nLnBuZyIsImlhdCI6MTcwNzc2NTI5NiwiZXhwIjoyMDIzMTI1Mjk2fQ.Hs_QZmhxN_RM7kKK0CYG_8Gg_5_FQlkZ-iNpWqICLJE';

// Update interfaces to better match our data structure
interface Asset {
  id: string;
  name: string;
  description: string | null;
  price: number;
  latitude: number;
  longitude: number;
  user_id: string;
  city_id: string;
  type: string;
  image_url: string | null;
  color: string | null;
  created_at: string;
  owner_avatar_url?: string | null;
}

interface UserAsset extends Asset {
  purchase_price: number;
  purchase_date: string;
}

export default function MapScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  
  // Get URL parameters - using a different approach that works on both web and native
  const [urlParams, setUrlParams] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    // Parse URL parameters on web
    if (Platform.OS === 'web') {
      const searchParams = new URLSearchParams(window.location.search);
      const params: {[key: string]: string} = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      setUrlParams(params);
    }
    
    fetchAssets();
  }, []);

  // Get current user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setUserId(user.id);
        
        // Fetch user profile to get coins and avatar URL
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('coins, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }
        
        if (profileData) {
          setUserCoins(profileData.coins || 0);
          setUserAvatarUrl(profileData.avatar_url || null);
        }
        
        fetchAssets();
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, fetch all assets
      const { data: allAssetsData, error: allAssetsError } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          description,
          price,
          latitude,
          longitude,
          city_id,
          type,
          image_url,
          color,
          created_at,
          user_assets (
            user_id,
            user_profiles (
              avatar_url
            )
          )
        `);

      if (allAssetsError) {
        console.error('Error fetching assets:', allAssetsError);
        setHasError(true);
        setErrorMessage(allAssetsError.message);
        return;
      }

      // Fetch user's purchased assets to know which ones they own
      const { data: userAssetsData, error: userAssetsError } = await supabase
        .from('user_assets')
        .select('asset_id')
        .eq('user_id', user.id);

      if (userAssetsError) {
        console.error('Error fetching user assets:', userAssetsError);
        setHasError(true);
        setErrorMessage(userAssetsError.message);
        return;
      }

      const userAssetIds = new Set(userAssetsData?.map(ua => ua.asset_id) || []);

      if (allAssetsData) {
        // Transform all assets data
        const transformedAllAssets = allAssetsData.map(asset => {
          // Get the owner's avatar URL if the asset is owned by someone
          const ownerData = asset.user_assets?.[0];
          const ownerAvatarUrl = ownerData?.user_profiles?.avatar_url;

          const assetData = {
            id: asset.id,
            name: asset.name,
            description: asset.description,
            price: asset.price,
            latitude: asset.latitude,
            longitude: asset.longitude,
            city_id: asset.city_id,
            type: asset.type,
            image_url: asset.image_url,
            color: asset.color,
            created_at: asset.created_at,
            owner_avatar_url: ownerAvatarUrl || null,
            user_id: ownerData?.user_id || ''
          };

          return assetData;
        });

        // Separate user's assets and all assets
        const userAssets = transformedAllAssets
          .filter(asset => userAssetIds.has(asset.id))
          .map(asset => ({
            ...asset,
            purchase_price: asset.price, // You might want to get the actual purchase price from user_assets
            purchase_date: new Date().toISOString() // You might want to get the actual purchase date from user_assets
          }));

        setUserAssets(userAssets);
        setAllAssets(transformedAllAssets);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setHasError(true);
      setErrorMessage('Failed to load map data. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handlePurchaseAsset = async (assetId: string, price: number) => {
    try {
      // Check if user has enough coins
      if (userCoins < price) {
        Alert.alert('Not enough coins', 'Not enough coins');
        return;
      }

      if (!userId) {
        Alert.alert('Authentication Error', 'Please log in to purchase assets.');
        return;
      }

      // Update user coins in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({ coins: userCoins - price })
        .eq('id', userId);

      if (error) throw error;

      // Add asset to user's assets
      const { error: assetError } = await supabase
        .from('user_assets')
        .insert({
          user_id: userId,
          asset_id: assetId,
          purchase_price: price,
          purchase_date: new Date().toISOString()
        });

      if (assetError) throw assetError;

      // Update local state
      setUserCoins(userCoins - price);
      
      // Refresh assets
      fetchAssets();
      
      // Show success message
      Alert.alert('Purchase Successful', 'You have successfully purchased this asset!');
      
    } catch (error) {
      console.error('Error purchasing asset:', error);
      Alert.alert('Purchase Failed', 'There was an error processing your purchase. Please try again.');
    }
  };

  // For web platform, we use a direct approach
  if (Platform.OS === 'web') {
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
        script.async = true;
        script.onload = () => {
          const mapboxgl = window.mapboxgl;
          mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
          
          const bounds = [
            [-74.2591, 40.4774], // Southwest coordinates (NYC area)
            [-73.7002, 40.9176]    // Northeast coordinates (NYC area)
          ] as [[number, number], [number, number]];
          
          const map = new mapboxgl.Map({
            container: 'map',
            style: MAPBOX_STYLE_URL,
            center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
            zoom: DEFAULT_ZOOM,
            pitch: 45,
            bearing: -17.6,
            dragRotate: false,
            touchZoomRotate: true,
            maxBounds: bounds,
            minZoom: 8,
            maxZoom: 20,
            renderWorldCopies: false,
            antialias: true,
            projection: {
              name: 'mercator',
              center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE]
            }
          });
          
          // Disable only rotation but keep zoom functionality
          map.dragRotate.disable();
          map.touchZoomRotate.disableRotation();
          map.doubleClickZoom.disable(); // Disable double-click zoom to prevent accidental zooming
          
          map.on('style.load', () => {
            // Insert the layer beneath any symbol layer.
            const layers = map.getStyle().layers;
            const labelLayerId = layers.find(
              (layer) => layer.type === 'symbol' && layer.layout['text-field']
            ).id;

            // Add 3D building layer
            map.addLayer({
              'id': 'add-3d-buildings',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 8,
              'paint': {
                'fill-extrusion-color': '#ADD8E6',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  12,
                  0,
                  12.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  12,
                  0,
                  12.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.9
              }
            }, labelLayerId);

            console.log('Map loaded successfully with 3D buildings');
          });
        };
        document.head.appendChild(script);
        
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }, []);

    return (
      <View style={styles.container}>
        <div id="map" style={{ width: '100%', height: '100%' }} />
        <View style={styles.overlayContainer}>
          <TouchableOpacity style={styles.profileOverlay} onPress={handleProfilePress}>
            <Svg width={14} height={14} viewBox="0 0 448 512" fill="#000000">
              <Path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <View style={styles.buildingOverlay}>
            <View style={[styles.iconCircle, { backgroundColor: '#B197FC' }]}>
              <FontAwesome5 name="building" size={14} color="#ffffff" />
            </View>
            <Text style={styles.buildingText}>{userAssets.length}</Text>
          </View>
          <View style={styles.priceOverlay}>
            <Image source={{ uri: MONEY_ICON_URL }} style={styles.priceIcon} />
            <Text style={styles.priceText}>{userCoins.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  }

  // For mobile platforms, we use WebView with HTML/JS
  const mapboxHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
      <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: 'Outfit', sans-serif;
        }
        #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        .marker {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .marker:hover {
          transform: scale(1.1);
        }
        .user-owned-marker {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          border: 2px solid #000000;
          object-fit: cover;
          cursor: pointer;
        }
        .user-owned-marker:hover {
          transform: scale(1.1);
        }
        .cluster-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #B197FC;
          border: 2px solid #000000;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          font-family: 'Outfit', sans-serif;
        }
        .arcade-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid black;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 1);
          z-index: 1000;
          display: none;
          max-width: 80%;
          width: 300px;
          font-family: 'Outfit', sans-serif;
        }
        .arcade-modal img {
          width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .arcade-modal h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 25px;
          margin-bottom: 12px;
          color: #000000;
          text-align: center;
        }
        .arcade-modal p {
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
          font-size: 17px;
          line-height: 1.5;
          color: #666666;
          margin-bottom: 8px;
        }
        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 15px;
        }
        .modal-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          background-color: #FF6363;
          border-radius: 8px;
          border: 2px solid #000000;
          box-shadow: 3px 2px 0px rgba(0, 0, 0, 1);
          font-weight: 600;
          padding: 10px;
        }
        .modal-container.price-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          border-radius: 8px;
          border: 2px solid #000000;
          box-shadow: 3px 2px 0px rgba(0, 0, 0, 1);
        }
        .modal-container img {
          width: 24px;
          height: 24px;
          margin-right: 8px;
          display: block;
        }
        .modal-container span {
          font-size: 18px;
          color: #000000;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          display: block;
          line-height: 24px;
        }
        .modal-container button {
          width: 100%;
          height: 100%;
          color: white;
          border: none;
          border-radius: 6px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 19px;
          background-color: transparent;
          cursor: pointer;
        }
        .modal-container.button-container {
          background-color: #FF5858;
        }
        .modal-container.button-container.list-button {
          background-color: #B197FC;
        }
        .modal-container button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="arcade-modal" class="arcade-modal">
        <h3 id="modal-title"></h3>
        <img id="modal-image" src="${ARCADE_IMAGE_URL}" alt="Notre Dame Arcade Style" />
        <div id="modal-content"></div>
        <div class="modal-actions">
          <div class="modal-container price-container">
            <img src="${MONEY_ICON_URL}" alt="Coins" />
            <span id="modal-price"></span>
          </div>
          <div id="button-container" class="modal-container button-container">
            <button id="buy-button" disabled>Buy</button>
          </div>
        </div>
      </div>
      <script>
        mapboxgl.accessToken = '${MAPBOX_ACCESS_TOKEN}';
        const map = new mapboxgl.Map({
          container: 'map',
          style: '${MAPBOX_STYLE_URL}',
          center: [${DEFAULT_LONGITUDE}, ${DEFAULT_LATITUDE}],
          zoom: ${DEFAULT_ZOOM},
          pitch: 45,
          bearing: -17.6,
          dragRotate: false,
          touchZoomRotate: true,
          maxBounds: [[-74.2591, 40.4774], [-73.7002, 40.9176]],
          minZoom: 10,
          maxZoom: 20,
          renderWorldCopies: false,
          antialias: true,
          projection: {
            name: 'mercator',
            center: [${DEFAULT_LONGITUDE}, ${DEFAULT_LATITUDE}]
          }
        });
        map.on('style.load', () => {
          // Insert the layer beneath any symbol layer.
          const layers = map.getStyle().layers;
          const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
          ).id;

          // Add 3D building layer
          map.addLayer({
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 8,
            'paint': {
              'fill-extrusion-color': '#ADD8E6',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          }, labelLayerId);

          console.log('Map loaded successfully with 3D buildings');
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
          visualizePitch: false
        }), 'bottom-right');

        map.on('load', () => {
          // Add user assets as source
          map.addSource('assets', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: ${JSON.stringify(allAssets.map(asset => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [asset.longitude, asset.latitude]
                },
                properties: {
                  id: asset.id,
                  name: asset.name,
                  description: asset.description,
                  price: asset.price,
                  owned: userAssets.some(ua => ua.id === asset.id),
                  owner_avatar_url: asset.owner_avatar_url
                }
              })))}
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Add clusters layer
          map.addLayer({
            id: 'clusters',
            type: 'symbol',
            source: 'assets',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-size': 12
            }
          });

          // Add unclustered points layer
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'assets',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#B197FC',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#000000'
            }
          });

          // Create markers for clusters
          function updateMarkers() {
            const markers = document.getElementsByClassName('marker-container');
            while(markers[0]) {
              markers[0].parentNode.removeChild(markers[0]);
            }

            const features = map.queryRenderedFeatures({ layers: ['clusters'] });
            features.forEach(feature => {
              const coordinates = feature.geometry.coordinates;
              const count = feature.properties.point_count;
              
              const el = document.createElement('div');
              el.className = 'marker-container';
              el.innerHTML = \`<div class="cluster-marker">\${count}</div>\`;
              
              new mapboxgl.Marker({
                element: el,
                anchor: 'center'
              })
                .setLngLat(coordinates)
                .addTo(map);
            });
            
            // Add custom markers for individual assets
            const assetFeatures = map.queryRenderedFeatures({ layers: ['unclustered-point'] });
            assetFeatures.forEach(feature => {
              const coordinates = feature.geometry.coordinates;
              const { id, owner_avatar_url } = feature.properties;
              
              const el = document.createElement('div');
              el.className = 'marker-container';
              
              if (owner_avatar_url) {
                // Use owner's avatar for owned assets
                el.innerHTML = \`<img class="user-owned-marker" src="\${owner_avatar_url}" alt="Asset Owner" />\`;
              } else {
                // Use purple marker for unowned assets
                el.innerHTML = \`<div class="marker" style="background-color: #B197FC; width: 15px; height: 15px; border-radius: 50%; border: 1px solid #000000;"></div>\`;
              }
              
              new mapboxgl.Marker({
                element: el,
                anchor: 'center'
              })
                .setLngLat(coordinates)
                .addTo(map);
            });
          }

          // Update markers on move and zoom
          map.on('moveend', updateMarkers);
          map.on('zoomend', updateMarkers);
          updateMarkers(); // Initial markers

          // Handle click events
          map.on('click', 'unclustered-point', (e) => {
            const feature = e.features[0];
            const coordinates = feature.geometry.coordinates.slice();
            const { id, name, description, price, owned } = feature.properties;

            // Show arcade modal
            const modal = document.getElementById('arcade-modal');
            const modalContent = document.getElementById('modal-content');
            const modalTitle = document.getElementById('modal-title');
            const modalPrice = document.getElementById('modal-price');
            const buyButton = document.getElementById('buy-button');
            const buttonContainer = document.getElementById('button-container');
            
            modalTitle.textContent = name;
            modalContent.textContent = description;

            // Format price with 'M' for millions
            const formatPrice = (price) => {
              if (price >= 1000000) {
                return (price / 1000000).toFixed(1) + 'M';
              }
              return price.toLocaleString();
            };

            modalPrice.textContent = formatPrice(price);
            
            // Get user coins from React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'getUserCoins',
              assetId: id,
              assetPrice: price,
              owned: owned
            }));
            
            // Change button based on ownership
            if (owned) {
              buyButton.textContent = 'List for Sale';
              buttonContainer.className = 'modal-container button-container list-button';
              buyButton.disabled = false;
            } else {
              buyButton.textContent = 'Buy';
              buttonContainer.className = 'modal-container button-container';
              // Button will be enabled/disabled based on coin balance in the getUserCoins response
            }
            
            // Set up button click handler
            buyButton.onclick = function() {
              if (owned) {
                // Send list for sale message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'listAssetForSale',
                  assetId: id
                }));
              } else {
                // Send purchase message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'purchaseAsset',
                  assetId: id,
                  price: price
                }));
              }
              
              // Close modal after action
              modal.style.display = 'none';
            };
            
            modal.style.display = 'block';

            // Send message to React Native about asset click
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'assetClick',
              asset: feature.properties
            }));
          });

          // Close modal when clicking outside
          window.onclick = (event) => {
            const modal = document.getElementById('arcade-modal');
            if (event.target === modal) {
              modal.style.display = 'none';
            }
          };

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
        });
      </script>
    </body>
    </html>
  `;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map data...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAssets}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        ref={webViewRef}
        source={{ html: mapboxHtml }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            
            if (data.type === 'mapReady') {
              console.log('Map is ready');
            } 
            else if (data.type === 'assetClick') {
              // Handle asset click if needed
            }
            else if (data.type === 'getUserCoins') {
              // Check if user has enough coins and update button state
              const webview = webViewRef.current;
              const hasEnoughCoins = userCoins >= data.assetPrice;
              const isOwned = data.owned;
              
              webview?.injectJavaScript(`
                (function() {
                  const buyButton = document.getElementById('buy-button');
                  const buttonContainer = document.getElementById('button-container');
                  
                  if (${isOwned}) {
                    buyButton.textContent = 'List for Sale';
                    buttonContainer.className = 'modal-container button-container list-button';
                    buyButton.disabled = false;
                  } else {
                    buyButton.disabled = ${!hasEnoughCoins};
                    buyButton.textContent = ${hasEnoughCoins} ? 'Buy' : 'Not enough coins';
                    buttonContainer.className = 'modal-container button-container';
                  }
                  true;
                })();
              `);
            }
            else if (data.type === 'purchaseAsset') {
              // Process purchase
              handlePurchaseAsset(data.assetId, data.price);
            }
            else if (data.type === 'listAssetForSale') {
              // Handle listing asset for sale
              Alert.alert('Coming Soon', 'Listing assets for sale will be available in a future update!');
            }
          } catch (error) {
            console.error('Error parsing WebView message:', error);
          }
        }}
      />
      <View style={styles.overlayContainer}>
        <TouchableOpacity style={styles.profileOverlay} onPress={handleProfilePress}>
          <Svg width={18} height={18} viewBox="0 0 448 512" fill="#000000">
            <Path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <View style={styles.buildingOverlay}>
          <View style={[styles.iconCircle, { backgroundColor: '#B197FC' }]}>
            <FontAwesome5 name="building" size={14} color="#ffffff" />
          </View>
          <Text style={styles.buildingText}>{userAssets.length}</Text>
        </View>
        <View style={styles.priceOverlay}>
          <Image source={{ uri: MONEY_ICON_URL }} style={styles.priceIcon} />
          <Text style={styles.priceText}>{userCoins.toLocaleString()}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000
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
  overlayContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  profileOverlay: {
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
  },
  buildingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 5,
    marginRight: 10,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B197FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buildingText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Outfit-Bold', android: 'Outfit-Bold', web: 'Outfit-Bold' }),
  },
  priceOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
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
  priceText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Outfit-Bold', android: 'Outfit-Bold', web: 'Outfit-Bold' }),
  },
});