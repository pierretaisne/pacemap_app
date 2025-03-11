/*
  # Create users and user_assets tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text)
      - `steps` (integer)
      - `coins` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `user_assets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `asset_id` (uuid, references assets)
      - `purchase_price` (integer)
      - `purchase_date` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE,
  steps integer DEFAULT 0,
  coins integer DEFAULT 1000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  asset_id uuid NOT NULL REFERENCES assets(id),
  purchase_price integer NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can read their own assets
CREATE POLICY "Users can read own assets"
  ON user_assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own assets
CREATE POLICY "Users can insert own assets"
  ON user_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();