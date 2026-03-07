import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es, ca, enUS, ru } from 'date-fns/locale';

const dateFnsLocales: Record<string, typeof es> = { es, ca, en: enUS, ru };

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

const DashboardReviews = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tradesmen')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: reviews } = useQuery({
    queryKey: ['my-reviews', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tradesman_id', profile!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      if (data && data.length > 0) {
        const residentIds = data.map((r) => r.resident_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', residentIds);
        const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name]) || []);
        return data.map((r) => ({
          ...r,
          resident_name: profileMap.get(r.resident_id) || t('dashboard.anonymousNeighbor'),
        }));
      }
      return [];
    },
    enabled: !!profile?.id,
  });

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          {t('dashboard.reviews')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('dashboard.reviewsDesc')}</p>
      </div>

      {avgRating && (
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="text-4xl font-bold text-accent">{avgRating}</div>
            <div>
              <StarRating rating={Math.round(Number(avgRating))} />
              <p className="mt-1 text-sm text-muted-foreground">
                {t('dashboard.totalReviews', { count: reviews?.length || 0 })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{review.resident_name}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: dateFnsLocales[i18n.language] || dateFnsLocales.es,
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t('dashboard.noReviewsYet')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardReviews;
