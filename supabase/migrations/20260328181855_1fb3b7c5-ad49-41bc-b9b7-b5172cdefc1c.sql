-- Rename leads → contact_unlocks
ALTER TABLE public.leads RENAME TO contact_unlocks;

-- Update the foreign key constraint name for clarity
ALTER TABLE public.contact_unlocks RENAME CONSTRAINT leads_tradesman_id_fkey TO contact_unlocks_tradesman_id_fkey;

-- Recreate the reviews insert RLS policy that references the old table name
DROP POLICY IF EXISTS "Residents with leads can create reviews" ON public.reviews;
CREATE POLICY "Residents with unlocks can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = resident_id) AND (EXISTS (
    SELECT 1
    FROM contact_unlocks
    WHERE contact_unlocks.tradesman_id = reviews.tradesman_id
      AND contact_unlocks.resident_id = auth.uid()
      AND contact_unlocks.created_at <= (now() - '24:00:00'::interval)
  ))
);

-- Rename RLS policies on contact_unlocks for clarity
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.contact_unlocks;
CREATE POLICY "Authenticated users can create contact_unlocks"
ON public.contact_unlocks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = resident_id);

DROP POLICY IF EXISTS "Tradesmen can view their leads" ON public.contact_unlocks;
CREATE POLICY "Tradesmen can view their contact_unlocks"
ON public.contact_unlocks FOR SELECT TO authenticated
USING (is_tradesman_owner(tradesman_id));

DROP POLICY IF EXISTS "Users can view own leads" ON public.contact_unlocks;
CREATE POLICY "Users can view own contact_unlocks"
ON public.contact_unlocks FOR SELECT TO authenticated
USING (auth.uid() = resident_id);