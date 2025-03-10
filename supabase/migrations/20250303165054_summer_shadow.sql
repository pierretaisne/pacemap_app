/*
  # Create assets table

  1. New Tables
    - `assets`
      - `id` (uuid, primary key)
      - `name` (text)
      - `city_id` (uuid, foreign key to cities)
      - `type` (text) - 'landmark' or 'building'
      - `coordinates` (jsonb)
      - `description` (text)
      - `price` (integer)
      - `image_url` (text)
      - `color` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city_id uuid NOT NULL REFERENCES cities(id),
  type text NOT NULL CHECK (type IN ('landmark', 'building')),
  coordinates jsonb NOT NULL,
  description text,
  price integer NOT NULL,
  image_url text,
  color text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read assets
CREATE POLICY "Anyone can read assets"
  ON assets
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample landmarks for Paris
INSERT INTO assets (name, city_id, type, coordinates, description, price, image_url, color)
VALUES 
  ('Eiffel Tower', 
   (SELECT id FROM cities WHERE name = 'Paris'), 
   'landmark', 
   '[2.2945, 48.8584]', 
   'Iconic iron tower built in 1889, standing 324 meters tall.', 
   3500000, 
   'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?q=80&w=2001&auto=format&fit=crop', 
   '#4A89F3'),
   
  ('Louvre Museum', 
   (SELECT id FROM cities WHERE name = 'Paris'), 
   'landmark', 
   '[2.3376, 48.8606]', 
   'World''s largest art museum and historic monument in Paris.', 
   4200000, 
   'https://images.unsplash.com/photo-1565099824688-e8c8a0b5b8d6?q=80&w=1974&auto=format&fit=crop', 
   '#FF9500'),
   
  ('Notre-Dame', 
   (SELECT id FROM cities WHERE name = 'Paris'), 
   'landmark', 
   '[2.3499, 48.8530]', 
   'Medieval Catholic cathedral on the Île de la Cité.', 
   2800000, 
   'https://kccxtmvqzwqgoiiweahd.supabase.co/storage/v1/object/sign/img%20buildings/pencilpal_47396_can_I_have_an_arcade_styled_image_of_notre_da_da02ea8f-53ab-4cb3-b1fb-3f111525eca9_1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcgYnVpbGRpbmdzL3BlbmNpbHBhbF80NzM5Nl9jYW5fSV9oYXZlX2FuX2FyY2FkZV9zdHlsZWRfaW1hZ2Vfb2Zfbm90cmVfZGFfZGEwMmVhOGYtNTNhYi00Y2IzLWIxZmItM2YxMTE1MjVlY2E5XzEucG5nIiwiaWF0IjoxNzQxMDIwNTIwLCJleHAiOjIwNTYzODA1MjB9.Orp1j2sG6n2rIY6O3aLqLs95lUcDAeaQdSxLPqfgJb8', 
   '#34C759');

-- Insert sample landmarks for NYC
INSERT INTO assets (name, city_id, type, coordinates, description, price, image_url, color)
VALUES 
  ('Empire State Building', 
   (SELECT id FROM cities WHERE name = 'New York City'), 
   'landmark', 
   '[-73.9857, 40.7484]', 
   'Iconic 102-story skyscraper completed in 1931.', 
   4800000, 
   'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop', 
   '#E31C79'),
   
  ('Statue of Liberty', 
   (SELECT id FROM cities WHERE name = 'New York City'), 
   'landmark', 
   '[-74.0445, 40.6892]', 
   'Colossal neoclassical sculpture on Liberty Island, a gift from France to the United States.', 
   3900000, 
   'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?q=80&w=1964&auto=format&fit=crop', 
   '#AF52DE');