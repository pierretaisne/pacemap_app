/*
  # Create landmarks table

  1. New Tables
    - `landmarks`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `coordinates` (jsonb, not null)
      - `description` (text)
      - `color` (text)
      - `price` (text)
      - `zoom` (integer)
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `landmarks` table
    - Add policy for authenticated and anonymous users to read landmarks
*/

CREATE TABLE IF NOT EXISTS landmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coordinates jsonb NOT NULL,
  description text,
  color text,
  price text,
  zoom integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE landmarks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read landmarks
CREATE POLICY "Anyone can read landmarks"
  ON landmarks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample landmarks data
INSERT INTO landmarks (name, coordinates, description, color, price, zoom)
VALUES 
  ('Paris Center', '[2.3522, 48.8566]', 'The heart of Paris, featuring iconic landmarks, beautiful architecture, and charming streets.', '#E31C79', '1.2M', 12),
  ('Eiffel Tower', '[2.2945, 48.8584]', 'Iconic iron tower built in 1889, standing 324 meters tall.', '#4A89F3', '2.5M', 15),
  ('Louvre Museum', '[2.3376, 48.8606]', 'World''s largest art museum and historic monument in Paris.', '#FF9500', '1.8M', 16),
  ('Notre-Dame', '[2.3499, 48.8530]', 'Medieval Catholic cathedral on the Île de la Cité.', '#34C759', '950K', 16),
  ('Montmartre', '[2.3431, 48.8867]', 'Historic hill in Paris''s 18th arrondissement, known for its artistic history and the Sacré-Cœur Basilica.', '#AF52DE', '750K', 15)
ON CONFLICT (id) DO NOTHING;