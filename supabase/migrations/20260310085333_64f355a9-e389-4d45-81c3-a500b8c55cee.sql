CREATE OR REPLACE FUNCTION public.claim_tradesman_profile(_phone TEXT)
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
  WHERE whatsapp_number = _phone AND is_claimed = false
  LIMIT 1;

  IF _tradesman_id IS NULL THEN RETURN NULL; END IF;

  UPDATE public.tradesmen SET user_id = auth.uid(), is_claimed = true WHERE id = _tradesman_id;
  UPDATE public.profiles SET user_role = 'tradesman' WHERE id = auth.uid();

  RETURN _tradesman_id;
END;
$$;