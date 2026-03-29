import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import WhatsAppVerificationModal from './WhatsAppVerificationModal';
import { toast } from 'sonner';

const maskPhone = (phone: string) => {
  if (phone.length < 6) return phone;
  const prefix = phone.slice(0, 3);
  const suffix = phone.slice(-3);
  return `${prefix} ${'•'.repeat(phone.length - 6)} ${suffix}`;
};

const WhatsAppSettingsSection = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: waStatus } = useQuery({
    queryKey: ['whatsapp-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_my_whatsapp_status');
      if (error) throw error;
      return data as { whatsapp_number: string | null; whatsapp_verified: boolean };
    },
    enabled: !!user,
  });

  const removeNumber = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        whatsapp_number: null,
        whatsapp_verified: false,
      } as any)
      .eq('id', user!.id);

    if (error) {
      toast.error(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
      toast.success(t('whatsapp.removed'));
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{t('whatsapp.settingsTitle')}</p>
              {waStatus?.whatsapp_number ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {maskPhone(waStatus.whatsapp_number)}
                  </span>
                  {waStatus.whatsapp_verified && (
                    <Badge variant="outline" className="text-xs border-secondary text-secondary gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {t('whatsapp.verifiedBadge')}
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('whatsapp.notAdded')}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalOpen(true)}
              >
                {waStatus?.whatsapp_number ? (
                  <><Pencil className="h-3.5 w-3.5 mr-1" /> {t('whatsapp.change')}</>
                ) : (
                  t('whatsapp.addWhatsApp')
                )}
              </Button>
              {waStatus?.whatsapp_number && (
                <Button size="sm" variant="ghost" onClick={removeNumber} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <WhatsAppVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentNumber={waStatus?.whatsapp_number}
      />
    </>
  );
};

export default WhatsAppSettingsSection;
