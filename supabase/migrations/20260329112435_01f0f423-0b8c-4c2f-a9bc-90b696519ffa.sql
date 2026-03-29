-- Favorites / saved tradesmen table
CREATE TABLE public.saved_tradesmen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tradesman_id uuid NOT NULL REFERENCES public.tradesmen(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resident_id, tradesman_id)
);

ALTER TABLE public.saved_tradesmen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved tradesmen"
  ON public.saved_tradesmen FOR SELECT
  TO authenticated
  USING (auth.uid() = resident_id);

CREATE POLICY "Users can save tradesmen"
  ON public.saved_tradesmen FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = resident_id);

CREATE POLICY "Users can unsave tradesmen"
  ON public.saved_tradesmen FOR DELETE
  TO authenticated
  USING (auth.uid() = resident_id);