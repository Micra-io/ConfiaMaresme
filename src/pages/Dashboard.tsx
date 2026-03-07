import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TRADE_CATEGORIES } from '@/lib/constants';
import { X, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ca } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { ru } from 'date-fns/locale';

const dateFnsLocales: Record<string, typeof es> = { es, ca, en: enUS, ru };

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [tradeCategory, setTradeCategory] = useState('general_handyman');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Maresme');
  const [isAvailable, setIsAvailable] = useState(true);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  // Auth is handled by ProtectedRoute wrapper

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tradesmen')
        .select('*')
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

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setTradeCategory(profile.trade_category);
      setWhatsappNumber(profile.whatsapp_number || '');
      setBio(profile.bio || '');
      setLocation(profile.location || 'Maresme');
      setIsAvailable(profile.is_available);
      setServices(profile.services || []);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        full_name: fullName,
        trade_category: tradeCategory as any,
        whatsapp_number: whatsappNumber || null,
        bio: bio || null,
        location: location || null,
        is_available: isAvailable,
        services,
        is_claimed: true,
      };

      if (profile) {
        const { error } = await supabase
          .from('tradesmen')
          .update(payload)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tradesmen').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t('dashboard.profileSaved'));
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addService = () => {
    const trimmed = newService.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices([...services, trimmed]);
      setNewService('');
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl font-bold">{t('dashboard.title')}</h1>
      <p className="mb-8 text-muted-foreground">
        {profile ? t('dashboard.updateDesc') : t('dashboard.createDesc')}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.profileInfo')}</CardTitle>
          <CardDescription>{t('dashboard.publicInfo')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('dashboard.fullName')} *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t('dashboard.trade')} *</Label>
              <Select value={tradeCategory} onValueChange={setTradeCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRADE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{t(`categories.${c.value}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">{t('dashboard.whatsapp')}</Label>
              <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder={t('dashboard.whatsappPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t('dashboard.location')}</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('dashboard.locationPlaceholder')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('dashboard.description')}</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('dashboard.descriptionPlaceholder')} rows={4} />
          </div>

          <div className="space-y-2">
            <Label>{t('dashboard.services')}</Label>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder={t('dashboard.servicePlaceholder')}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <Button type="button" variant="outline" onClick={addService}>{t('dashboard.addService')}</Button>
            </div>
            {services.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {s}
                    <button onClick={() => setServices(services.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{t('dashboard.availableForWork')}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.availableDesc')}</p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!fullName || saveMutation.isPending}
            className="w-full"
          >
            {saveMutation.isPending ? t('dashboard.saving') : profile ? t('dashboard.updateProfile') : t('dashboard.createProfile')}
          </Button>
        </CardContent>
      </Card>

      {profile && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t('dashboard.neighborInterest')}
            </CardTitle>
            <CardDescription>{t('dashboard.neighborInterestDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
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
      )}
    </div>
  );
};

export default Dashboard;
