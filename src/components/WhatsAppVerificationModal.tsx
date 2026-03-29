import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { CheckCircle, MessageCircle, Loader2 } from 'lucide-react';

type Step = 'phone' | 'code' | 'success';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNumber?: string | null;
}

const WhatsAppVerificationModal = ({ open, onOpenChange, currentNumber }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState(currentNumber || '+34');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('phone');
      setPhone(currentNumber || '+34');
      setCode('');
      setCountdown(0);
    }
  }, [open, currentNumber]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendCode = useCallback(async () => {
    // Basic phone validation
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^\+\d{7,15}$/.test(cleanPhone)) {
      toast.error(t('whatsapp.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-code', {
        body: { phone: cleanPhone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setStep('code');
      setCountdown(60);
      toast.success(t('whatsapp.codeSent'));
    } catch (err: any) {
      toast.error(err.message || t('whatsapp.sendError'));
    }
    setLoading(false);
  }, [phone, t]);

  const verifyCode = useCallback(async () => {
    if (code.length !== 6) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-whatsapp-code', {
        body: { code },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
      toast.success(t('whatsapp.verified'));
    } catch (err: any) {
      toast.error(err.message || t('whatsapp.verifyError'));
    }
    setLoading(false);
  }, [code, t, queryClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-accent" />
            {t('whatsapp.modalTitle')}
          </DialogTitle>
        </DialogHeader>

        {step === 'phone' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('whatsapp.phoneDesc')}</p>
            <div className="space-y-2">
              <Label htmlFor="wa-phone">{t('whatsapp.phoneLabel')}</Label>
              <Input
                id="wa-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 612 345 678"
                type="tel"
              />
            </div>
            <Button onClick={sendCode} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('whatsapp.sendCode')}
            </Button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('whatsapp.codeDesc', { phone: phone.replace(/(\+\d{2})\d+(\d{3})/, '$1•••••$2') })}
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={verifyCode} disabled={loading || code.length !== 6} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('whatsapp.verify')}
            </Button>
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t('whatsapp.resendIn', { seconds: countdown })}
                </p>
              ) : (
                <Button variant="ghost" size="sm" onClick={sendCode} disabled={loading}>
                  {t('whatsapp.resend')}
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle className="mx-auto h-12 w-12 text-secondary" />
            <p className="font-medium">{t('whatsapp.successTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('whatsapp.successDesc')}</p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              {t('whatsapp.continue')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppVerificationModal;
