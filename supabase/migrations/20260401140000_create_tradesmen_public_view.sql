CREATE VIEW public.tradesmen_public AS
SELECT
  t.id,
  t.full_name,
  t.trade_category,
  t.additional_categories,
  t.bio,
  t.location,
  t.whatsapp_number,
  t.profile_image_url,
  t.is_available,
  t.vetted_by_community,
  t.services,
  t.languages,
  t.is_featured,
  t.subscription_tier,
  COALESCE(r.avg_rating, 0) AS avg_rating,
  COALESCE(r.review_count, 0) AS review_count
FROM public.tradesmen t
LEFT JOIN (
  SELECT
    tradesman_id,
    ROUND(AVG(rating)::numeric, 1) AS avg_rating,
    COUNT(*)::integer AS review_count
  FROM public.reviews
  GROUP BY tradesman_id
) r ON r.tradesman_id = t.id;
