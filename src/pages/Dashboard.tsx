import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { X } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [tradeCategory, setTradeCategory] = useState('general_handyman');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Maresme');
  const [isAvailable, setIsAvailable] = useState(true);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

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
      toast.success('Perfil guardado correctamente');
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
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl font-bold">Mi Perfil de Profesional</h1>
      <p className="mb-8 text-muted-foreground">
        {profile ? 'Actualiza tu información para que los clientes te encuentren.' : 'Crea tu perfil para aparecer en el directorio.'}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Información del perfil</CardTitle>
          <CardDescription>Esta información será visible para el público.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Oficio *</Label>
              <Select value={tradeCategory} onValueChange={setTradeCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRADE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (con código de país)</Label>
              <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+34 612 345 678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Mataró, Maresme" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Descripción</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntale a la comunidad sobre ti y tu experiencia..." rows={4} />
          </div>

          <div className="space-y-2">
            <Label>Servicios</Label>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Ej: Instalación eléctrica"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <Button type="button" variant="outline" onClick={addService}>Añadir</Button>
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
              <p className="font-medium">Disponible para trabajos</p>
              <p className="text-sm text-muted-foreground">Muestra que estás aceptando nuevos clientes</p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!fullName || saveMutation.isPending}
            className="w-full"
          >
            {saveMutation.isPending ? 'Guardando...' : profile ? 'Actualizar perfil' : 'Crear perfil'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
