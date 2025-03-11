/*
  # Create purchase_asset function

  1. New Functions
    - `purchase_asset` - Function to handle asset purchases in a transaction
      - Deducts coins from user
      - Creates user_asset record
*/

-- Function to handle asset purchases in a transaction
CREATE OR REPLACE FUNCTION purchase_asset(
  p_user_id uuid,
  p_asset_id uuid,
  p_price integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has enough coins
  IF (SELECT coins FROM user_profiles WHERE id = p_user_id) < p_price THEN
    RAISE EXCEPTION 'Not enough coins to purchase this asset';
  END IF;

  -- Check if user already owns this asset
  IF EXISTS (SELECT 1 FROM user_assets WHERE user_id = p_user_id AND asset_id = p_asset_id) THEN
    RAISE EXCEPTION 'You already own this asset';
  END IF;

  -- Deduct coins from user
  UPDATE user_profiles
  SET coins = coins - p_price,
      updated_at = now()
  WHERE id = p_user_id;

  -- Create user_asset record
  INSERT INTO user_assets (user_id, asset_id, purchase_price)
  VALUES (p_user_id, p_asset_id, p_price);
END;
$$;