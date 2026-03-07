
CREATE TYPE public.trade_category AS ENUM (
  'electrician', 'plumber', 'carpenter', 'painter', 'general_handyman',
  'locksmith', 'gardener', 'cleaner', 'mason', 'roofer', 'hvac', 'other'
);

CREATE TABLE public.tradesmen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  trade_category trade_category NOT NULL DEFAULT 'other',
  whatsapp_number TEXT,
  bio TEXT,
  location TEXT,
  profile_image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  vetted_by_community BOOLEAN NOT NULL DEFAULT false,
  services TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tradesmen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tradesmen" ON public.tradesmen
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tradesman profile" ON public.tradesmen
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tradesman profile" ON public.tradesmen
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
