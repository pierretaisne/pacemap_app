/*
  # Modify integer columns to bigint for large numbers

  1. Changes:
    - `user_profiles`
      - Change `steps` from integer to bigint
      - Change `coins` from integer to bigint
    - `step_logs`
      - Change `steps` from integer to bigint
    - `assets`
      - Change `price` from integer to bigint
    - `user_assets`
      - Change `purchase_price` from integer to bigint
*/

-- Drop triggers that depend on the columns we're modifying
DROP TRIGGER IF EXISTS on_step_log_inserted ON step_logs;
DROP TRIGGER IF EXISTS on_step_log_updated ON step_logs;

-- Modify user_profiles table
ALTER TABLE user_profiles 
  ALTER COLUMN steps TYPE bigint,
  ALTER COLUMN coins TYPE bigint;

-- Modify step_logs table
ALTER TABLE step_logs
  ALTER COLUMN steps TYPE bigint;

-- Modify assets table
ALTER TABLE assets
  ALTER COLUMN price TYPE bigint;

-- Modify user_assets table
ALTER TABLE user_assets
  ALTER COLUMN purchase_price TYPE bigint;

-- Update the convert_steps_to_coins function to use bigint
CREATE OR REPLACE FUNCTION convert_steps_to_coins()
RETURNS trigger AS $$
DECLARE
  step_difference bigint;
  coins_to_add bigint;
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

-- Recreate the triggers
CREATE TRIGGER on_step_log_inserted
  AFTER INSERT ON step_logs
  FOR EACH ROW EXECUTE FUNCTION convert_steps_to_coins();

CREATE TRIGGER on_step_log_updated
  AFTER UPDATE OF steps ON step_logs
  FOR EACH ROW EXECUTE FUNCTION convert_steps_to_coins(); 