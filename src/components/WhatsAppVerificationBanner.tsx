import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WhatsAppVerificationModal from './WhatsAppVerificationModal';

const DISMISS_KEY = 'whatsapp-banner-dismissed';

const WhatsAppVerificationBanner = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored) {
      const ts = parseInt(stored, 10);
      // Show again after 24 hours
      if (Date.now() - ts < 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
  }, []);

  const { data: waStatus, isLoading } = useQuery({
    queryKey: ['whatsapp-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_my_whatsapp_status');
      if (error) throw error;
      return data as { whatsapp_number: string | null; whatsapp_verified: boolean };
    },
    enabled: !!user,
  });

  if (isLoading || dismissed || !user) return null;
  if (waStatus?.whatsapp_verified) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  return (
    <>
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
          <MessageCircle className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{t('whatsapp.bannerTitle')}</p>
          <p className="text-xs text-muted-foreground">{t('whatsapp.bannerDesc')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => setModalOpen(true)}>
            {t('whatsapp.addWhatsApp')}
          </Button>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <WhatsAppVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentNumber={waStatus?.whatsapp_number}
      />
    </>
  );
};

export default WhatsAppVerificationBanner;
