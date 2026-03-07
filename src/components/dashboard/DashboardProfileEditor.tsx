import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { TRADE_CATEGORIES, LANGUAGES } from '@/lib/constants';
import { X } from 'lucide-react';

const DashboardProfileEditor = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [tradeCategory, setTradeCategory] = useState('general_handyman');
  const [additionalCategories, setAdditionalCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Maresme');
  const [isAvailable, setIsAvailable] = useState(true);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  const { data: profile, isLoading } = useQuery({
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

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setTradeCategory(profile.trade_category);
      setAdditionalCategories((profile as any).additional_categories || []);
      setLanguages((profile as any).languages || []);
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
        additional_categories: additionalCategories,
        languages,
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

  const toggleAdditionalCategory = (value: string) => {
    if (value === tradeCategory) return;
    setAdditionalCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const toggleLanguage = (value: string) => {
    setLanguages(prev =>
      prev.includes(value) ? prev.filter(l => l !== value) : [...prev, value]
    );
  };

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center">{t('dashboard.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('dashboard.profileInfo')}</h2>
        <p className="text-sm text-muted-foreground">{t('dashboard.publicInfo')}</p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
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

          {/* Additional trades */}
          <div className="space-y-2">
            <Label>{t('dashboard.additionalTrades')}</Label>
            <p className="text-xs text-muted-foreground">{t('dashboard.additionalTradesDesc')}</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {TRADE_CATEGORIES.filter(c => c.value !== tradeCategory).map(c => (
                <label key={c.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox
                    checked={additionalCategories.includes(c.value)}
                    onCheckedChange={() => toggleAdditionalCategory(c.value)}
                  />
                  {t(`categories.${c.value}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>{t('dashboard.languages')}</Label>
            <p className="text-xs text-muted-foreground">{t('dashboard.languagesDesc')}</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {LANGUAGES.map(l => (
                <label key={l.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox
                    checked={languages.includes(l.value)}
                    onCheckedChange={() => toggleLanguage(l.value)}
                  />
                  {t(`languages.${l.value}`, l.label)}
                </label>
              ))}
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
    </div>
  );
};

export default DashboardProfileEditor;
