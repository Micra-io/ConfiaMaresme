ALTER TABLE public.tradesmen 
ADD COLUMN additional_categories text[] NOT NULL DEFAULT '{}',
ADD COLUMN languages text[] NOT NULL DEFAULT '{}';