
-- Add phone_verified to tradesmen
ALTER TABLE public.tradesmen ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false;

-- Create a security definer function to claim a tradesman profile
CREATE OR REPLACE FUNCTION public.claim_tradesman_profile(_phone TEXT, _user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tradesman_id UUID;
BEGIN
  SELECT id INTO _tradesman_id
  FROM public.tradesmen
  WHERE whatsapp_number = _phone
    AND is_claimed = false
  LIMIT 1;

  IF _tradesman_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.tradesmen
  SET user_id = _user_id, is_claimed = true
  WHERE id = _tradesman_id;

  -- Update profile role to tradesman
  UPDATE public.profiles
  SET user_role = 'tradesman'
  WHERE id = _user_id;

  RETURN _tradesman_id;
END;
$$;
