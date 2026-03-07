
-- Create user_role enum
CREATE TYPE public.user_role AS ENUM ('tradesman', 'resident');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role user_role NOT NULL DEFAULT 'resident',
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_role, display_name)
  VALUES (NEW.id, 'resident', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tradesman_id UUID NOT NULL REFERENCES public.tradesmen(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(tradesman_id, resident_id)
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Residents can insert their own leads
CREATE POLICY "Authenticated users can create leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = resident_id);

-- Residents can view their own unlocks
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT TO authenticated USING (auth.uid() = resident_id);

-- Tradesmen can see leads for their profiles
CREATE OR REPLACE FUNCTION public.is_tradesman_owner(_tradesman_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tradesmen
    WHERE id = _tradesman_id AND user_id = auth.uid()
  );
$$;

CREATE POLICY "Tradesmen can view their leads" ON public.leads
  FOR SELECT TO authenticated USING (public.is_tradesman_owner(tradesman_id));
