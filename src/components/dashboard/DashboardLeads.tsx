import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es, ca, enUS, ru } from 'date-fns/locale';

const dateFnsLocales: Record<string, typeof es> = { es, ca, en: enUS, ru };

const DashboardLeads = () => {
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

  const { data: leads } = useQuery({
    queryKey: ['my-leads', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, created_at, resident_id')
        .eq('tradesman_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      if (data && data.length > 0) {
        const residentIds = data.map((l) => l.resident_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', residentIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name]) || []);
        return data.map((l) => ({
          ...l,
          resident_name: profileMap.get(l.resident_id) || t('dashboard.anonymousNeighbor'),
        }));
      }
      return [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          {t('dashboard.neighborInterest')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('dashboard.neighborInterestDesc')}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {leads && leads.length > 0 ? (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg border p-3">
                  <p className="text-sm font-medium">{lead.resident_name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(lead.created_at), {
                      addSuffix: true,
                      locale: dateFnsLocales[i18n.language] || dateFnsLocales.es,
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t('dashboard.noInterestYet')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLeads;
