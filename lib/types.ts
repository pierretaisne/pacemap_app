// Type definitions for the application

// Country type definition
export type Country = {
  id: string;
  name: string;
  created_at: string;
};

// City type definition
export type City = {
  id: string;
  name: string;
  country_id: string;
  coordinates: [number, number];
  created_at: string;
};

// Asset type definition
export type Asset = {
  id: string;
  name: string;
  city_id: string;
  type: 'landmark' | 'building';
  coordinates: [number, number];
  description: string;
  price: number;
  image_url: string;
  color: string;
  created_at: string;
};

// User profile type definition
export type UserProfile = {
  id: string;
  username: string;
  steps: number;
  coins: number;
  created_at: string;
  updated_at: string;
};

// User asset type definition
export type UserAsset = {
  id: string;
  user_id: string;
  asset_id: string;
  purchase_price: number;
  purchase_date: string;
  asset?: Asset; // Optional joined asset data
};

// Step log type definition
export type StepLog = {
  id: string;
  user_id: string;
  steps: number;
  date: string;
  created_at: string;
};

// Building type definition (for backward compatibility)
export type Building = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  description: string;
  color: string;
  price: string;
  image_url: string;
  created_at: string;
};

// Landmark type definition (for backward compatibility)
export type Landmark = {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  color: string;
  price: string;
  zoom: number;
};