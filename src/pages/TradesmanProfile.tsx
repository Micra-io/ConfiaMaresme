import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, MessageCircle, ShieldCheck, User, Phone, Lock, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUnlockContact } from '@/hooks/useUnlockContact';
import UnlockContactModal from '@/components/UnlockContactModal';
import { formatDistanceToNow } from 'date-fns';
import { es, ca, enUS, ru } from 'date-fns/locale';

const dateFnsLocales: Record<string, typeof es> = { es, ca, en: enUS, ru };

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`h-4 w-4 ${s <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
    ))}
  </div>
);

const TradesmanProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();

  const { data: tradesman, isLoading } = useQuery({
    queryKey: ['tradesman', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tradesmen')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tradesman_id', id!)
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
    enabled: !!id,
  });

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const { isUnlocked, isUnlocking, handleUnlock, showAuthModal, setShowAuthModal } =
    useUnlockContact(id || '');

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!tradesman) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">{t('profile.notFound')}</p>
        <Link to="/">
          <Button variant="outline" className="mt-4">{t('profile.backToDirectory')}</Button>
        </Link>
      </div>
    );
  }

  const whatsappLink = tradesman.whatsapp_number
    ? `https://wa.me/${tradesman.whatsapp_number.replace(/\D/g, '')}`
    : null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t('profile.backToDirectory')}
      </Link>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-start gap-6 md:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
              {tradesman.profile_image_url ? (
                <img src={tradesman.profile_image_url} alt={tradesman.full_name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold">{tradesman.full_name}</h1>
              <p className="mt-1 text-lg font-medium text-secondary">
                {t(`categories.${tradesman.trade_category}`)}
              </p>

              {tradesman.location && (
                <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {tradesman.location}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {tradesman.vetted_by_community && (
                  <Badge className="gap-1 bg-success text-success-foreground">
                    <ShieldCheck className="h-3 w-3" /> {t('profile.verifiedByCommunity')}
                  </Badge>
                )}
                {tradesman.is_available ? (
                  <Badge variant="outline" className="text-secondary border-secondary">{t('profile.available')}</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">{t('profile.notAvailable')}</Badge>
                )}
                {avgRating !== null && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({reviews?.length})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {tradesman.bio && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold">{t('profile.aboutMe')}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{tradesman.bio}</p>
            </div>
          )}

          {tradesman.services && tradesman.services.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold">{t('profile.services')}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {tradesman.services.map((s: string, i: number) => (
                  <Badge key={i} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            {isUnlocked ? (
              <div className="space-y-3">
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="gap-2 bg-success text-success-foreground hover:bg-success/90">
                      <MessageCircle className="h-5 w-5" /> {t('profile.contactWhatsApp')}
                    </Button>
                  </a>
                )}
                {tradesman.whatsapp_number && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {tradesman.whatsapp_number}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-center">
                <Lock className="mx-auto mb-2 h-8 w-8 text-primary/60" />
                <p className="mb-3 text-sm text-muted-foreground">
                  {t('profile.contactProtected')}
                </p>
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                >
                  <Lock className="h-4 w-4" />
                  {isUnlocking ? t('card.unlocking') : t('card.unlockContact')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews section */}
      {reviews && reviews.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold mb-4">{t('profile.reviews')}</h2>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-1">
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
          </CardContent>
        </Card>
      )}

      <UnlockContactModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default TradesmanProfile;
