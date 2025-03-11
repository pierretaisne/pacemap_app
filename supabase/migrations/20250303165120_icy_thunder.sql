/*
  # Create step_logs table for tracking user steps

  1. New Tables
    - `step_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `steps` (integer)
      - `date` (date)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS
    - Add policies for authenticated users
  3. Functions
    - Add function to convert steps to coins
*/

CREATE TABLE IF NOT EXISTS step_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  steps integer NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE step_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own step logs
CREATE POLICY "Users can read own step logs"
  ON step_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own step logs
CREATE POLICY "Users can insert own step logs"
  ON step_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own step logs
CREATE POLICY "Users can update own step logs"
  ON step_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to convert steps to coins (1000 steps = 10 coins)
CREATE OR REPLACE FUNCTION convert_steps_to_coins()
RETURNS trigger AS $$
DECLARE
  step_difference integer;
  coins_to_add integer;
BEGIN
  -- Calculate the difference in steps
  IF TG_OP = 'INSERT' THEN
    step_difference = NEW.steps;
  ELSE
    step_difference = NEW.steps - OLD.steps;
  END IF;
  
  -- Convert steps to coins (1000 steps = 10 coins)
  coins_to_add = floor(step_difference / 100);
  
  -- Update user's coins and total steps
  IF coins_to_add > 0 THEN
    UPDATE user_profiles
    SET 
      coins = coins + coins_to_add,
      steps = steps + step_difference,
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to call the function when step logs are inserted or updated
CREATE TRIGGER on_step_log_inserted
  AFTER INSERT ON step_logs
  FOR EACH ROW EXECUTE FUNCTION convert_steps_to_coins();

CREATE TRIGGER on_step_log_updated
  AFTER UPDATE OF steps ON step_logs
  FOR EACH ROW EXECUTE FUNCTION convert_steps_to_coins();