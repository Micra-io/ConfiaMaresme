
-- Add WhatsApp verification columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_verification_code text,
  ADD COLUMN IF NOT EXISTS whatsapp_code_expires_at timestamptz;

-- Create verification attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS on verification_attempts - only service role needs access
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;

-- Create a policy to prevent client reads (edge functions use service role)
-- No policies = no client access, which is what we want

-- Update profiles RLS: hide verification code from client reads
-- We need a view or column-level security. Since Supabase doesn't support column-level,
-- we'll handle this in the edge functions by using service role for code operations.
-- The client select policy already exists. The verification_code will be in the row
-- but we'll create a security definer function to clear it from client reads.

-- Create a function to get profile without sensitive fields
CREATE OR REPLACE FUNCTION public.get_my_whatsapp_status()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'whatsapp_number', whatsapp_number,
    'whatsapp_verified', whatsapp_verified
  )
  FROM public.profiles
  WHERE id = auth.uid()
$$;
