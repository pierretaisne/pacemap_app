/*
  # Create buildings table

  1. New Tables
    - `buildings`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `longitude` (float, not null)
      - `latitude` (float, not null)
      - `description` (text)
      - `color` (text)
      - `price` (text)
      - `image_url` (text)
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `buildings` table
    - Add policy for authenticated and anonymous users to read buildings
*/

CREATE TABLE IF NOT EXISTS buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  longitude float NOT NULL,
  latitude float NOT NULL,
  description text,
  color text,
  price text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read buildings
CREATE POLICY "Anyone can read buildings"
  ON buildings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample buildings data
INSERT INTO buildings (name, longitude, latitude, description, color, price, image_url)
VALUES 
  ('Luxury Apartment', 2.3522, 48.8566, 'Modern luxury apartment in the heart of Paris with stunning views.', '#E31C79', '1.2M', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'),
  ('Historic Townhouse', 2.2945, 48.8584, 'Beautiful historic townhouse near the Eiffel Tower with original features.', '#4A89F3', '2.5M', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop'),
  ('Riverside Penthouse', 2.3376, 48.8606, 'Exclusive penthouse with panoramic views of the Seine and the Louvre.', '#FF9500', '1.8M', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop'),
  ('Montmartre Studio', 2.3431, 48.8867, 'Charming artist studio in the bohemian Montmartre district.', '#AF52DE', '750K', 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=2070&auto=format&fit=crop'),
  ('Latin Quarter Loft', 2.3499, 48.8530, 'Spacious loft in the historic Latin Quarter near Notre-Dame.', '#34C759', '950K', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop'),
  ('Champs-Élysées Condo', 2.3088, 48.8698, 'Elegant condominium on the prestigious Champs-Élysées avenue.', '#FF2D55', '3.2M', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop'),
  ('Saint-Germain Duplex', 2.3338, 48.8539, 'Stylish duplex in the fashionable Saint-Germain-des-Prés neighborhood.', '#5856D6', '1.5M', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop'),
  ('Marais Heritage Home', 2.3592, 48.8567, 'Preserved heritage home in the trendy Marais district with courtyard.', '#FF9500', '2.1M', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;