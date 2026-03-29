import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Unlock, Star, Heart, Settings, MessageCircle,
  MapPin, User, Clock, Trash2,
} from 'lucide-react';
import WhatsAppVerificationBanner from '@/components/WhatsAppVerificationBanner';
import WhatsAppSettingsSection from '@/components/WhatsAppSettingsSection';
import { formatDistanceToNow } from 'date-fns';
import { es, ca, enUS, ru } from 'date-fns/locale';
import { toast } from 'sonner';

const dateFnsLocales: Record<string, typeof es> = { es, ca, en: enUS, ru };

const ResidentDashboard = () => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = dateFnsLocales[i18n.language] || dateFnsLocales.es;

  // Unlocked contacts
  const { data: unlocks } = useQuery({
    queryKey: ['my-unlocks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_unlocks')
        .select('id, created_at, tradesman_id')
        .eq('resident_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      if (data && data.length > 0) {
        const ids = data.map((u) => u.tradesman_id);
        const { data: tradesmen } = await supabase
          .from('tradesmen')
          .select('id, full_name, trade_category, location, whatsapp_number, profile_image_url')
          .in('id', ids);
        const map = new Map(tradesmen?.map((t) => [t.id, t]) || []);
        return data.map((u) => ({ ...u, tradesman: map.get(u.tradesman_id) }));
      }
      return [];
    },
    enabled: !!user,
  });

  // My reviews
  const { data: myReviews } = useQuery({
    queryKey: ['my-given-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, tradesman_id')
        .eq('resident_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      if (data && data.length > 0) {
        const ids = data.map((r) => r.tradesman_id);
        const { data: tradesmen } = await supabase
          .from('tradesmen')
          .select('id, full_name, trade_category')
          .in('id', ids);
        const map = new Map(tradesmen?.map((t) => [t.id, t]) || []);
        return data.map((r) => ({ ...r, tradesman: map.get(r.tradesman_id) }));
      }
      return [];
    },
    enabled: !!user,
  });

  // Saved tradesmen
  const { data: saved } = useQuery({
    queryKey: ['my-saved', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_tradesmen')
        .select('id, created_at, tradesman_id')
        .eq('resident_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      if (data && data.length > 0) {
        const ids = data.map((s) => s.tradesman_id);
        const { data: tradesmen } = await supabase
          .from('tradesmen')
          .select('id, full_name, trade_category, location, profile_image_url, is_available')
          .in('id', ids);
        const map = new Map(tradesmen?.map((t) => [t.id, t]) || []);
        return data.map((s) => ({ ...s, tradesman: map.get(s.tradesman_id) }));
      }
      return [];
    },
    enabled: !!user,
  });

  const unsaveMutation = useMutation({
    mutationFn: async (savedId: string) => {
      const { error } = await supabase.from('saved_tradesmen').delete().eq('id', savedId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-saved'] });
      toast.success(t('dashboard.removed'));
    },
  });

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{t('dashboard.welcomeBack')}</h1>
        <p className="text-base text-muted-foreground">{user?.email}</p>
      </div>

      <WhatsAppVerificationBanner />

      {/* Unlocked Contacts */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Unlock className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">{t('dashboard.unlockedContacts')}</h2>
          <Badge variant="secondary" className="ml-auto">{unlocks?.length || 0}</Badge>
        </div>
        <Card>
          <CardContent className="pt-6">
            {unlocks && unlocks.length > 0 ? (
              <div className="space-y-3">
                {unlocks.map((u) => {
                  const tm = u.tradesman;
                  const whatsappLink = tm?.whatsapp_number
                    ? `https://wa.me/${tm.whatsapp_number.replace(/\D/g, '')}`
                    : null;
                  return (
                    <div key={u.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        {tm?.profile_image_url ? (
                          <img src={tm.profile_image_url} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/tradesman/${u.tradesman_id}`} className="font-medium text-base hover:text-primary">
                          {tm?.full_name || t('dashboard.unknown')}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{t(`categories.${tm?.trade_category || 'other'}`)}</span>
                          {tm?.location && (
                            <>
                              <span>·</span>
                              <MapPin className="h-3 w-3" />
                              <span>{tm.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {whatsappLink && (
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="gap-1.5 bg-success text-success-foreground hover:bg-success/90">
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-center">
                <Unlock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-base text-muted-foreground">{t('dashboard.noUnlocksYet')}</p>
                <Link to="/">
                  <Button variant="outline" className="mt-3">{t('dashboard.browseDirectory')}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Saved / Favorites */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-destructive" />
          <h2 className="font-display text-xl font-bold">{t('dashboard.savedTradesmen')}</h2>
          <Badge variant="secondary" className="ml-auto">{saved?.length || 0}</Badge>
        </div>
        <Card>
          <CardContent className="pt-6">
            {saved && saved.length > 0 ? (
              <div className="space-y-3">
                {saved.map((s) => {
                  const tm = s.tradesman;
                  return (
                    <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        {tm?.profile_image_url ? (
                          <img src={tm.profile_image_url} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/tradesman/${s.tradesman_id}`} className="font-medium text-base hover:text-primary">
                          {tm?.full_name || t('dashboard.unknown')}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{t(`categories.${tm?.trade_category || 'other'}`)}</span>
                          {tm?.is_available && (
                            <Badge variant="outline" className="text-xs text-secondary border-secondary">
                              {t('card.available')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unsaveMutation.mutate(s.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-center">
                <Heart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-base text-muted-foreground">{t('dashboard.noSavedYet')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* My Reviews */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-accent" />
          <h2 className="font-display text-xl font-bold">{t('dashboard.myReviews')}</h2>
          <Badge variant="secondary" className="ml-auto">{myReviews?.length || 0}</Badge>
        </div>
        <Card>
          <CardContent className="pt-6">
            {myReviews && myReviews.length > 0 ? (
              <div className="space-y-3">
                {myReviews.map((r) => (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Link to={`/tradesman/${r.tradesman_id}`} className="font-medium text-base hover:text-primary">
                        {r.tradesman?.full_name || t('dashboard.unknown')}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale })}
                      </span>
                    </div>
                    <StarRating rating={r.rating} />
                    {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-center">
                <Star className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-base text-muted-foreground">{t('dashboard.noReviewsGivenYet')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Account Settings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display text-xl font-bold">{t('dashboard.accountSettings')}</h2>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('auth.email')}</p>
              <p className="text-base font-medium">{user?.email}</p>
            </div>
            <WhatsAppSettingsSection />
            <div className="flex gap-3">
              <Link to="/claim">
                <Button variant="outline">{t('dashboard.claimProfile')}</Button>
              </Link>
              <Button variant="destructive" onClick={signOut}>{t('nav.signOut')}</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ResidentDashboard;
