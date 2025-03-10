/*
  # Create countries and cities tables

  1. New Tables
    - `countries`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `cities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `country_id` (uuid, foreign key to countries)
      - `coordinates` (jsonb)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
*/

CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_id uuid NOT NULL REFERENCES countries(id),
  coordinates jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read countries
CREATE POLICY "Anyone can read countries"
  ON countries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to read cities
CREATE POLICY "Anyone can read cities"
  ON cities
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert initial countries
INSERT INTO countries (name)
VALUES 
  ('France'),
  ('United States')
ON CONFLICT (name) DO NOTHING;

-- Insert initial cities with coordinates
INSERT INTO cities (name, country_id, coordinates)
VALUES 
  ('Paris', (SELECT id FROM countries WHERE name = 'France'), '[2.3522, 48.8566]'),
  ('New York City', (SELECT id FROM countries WHERE name = 'United States'), '[-74.0060, 40.7128]')
ON CONFLICT DO NOTHING;