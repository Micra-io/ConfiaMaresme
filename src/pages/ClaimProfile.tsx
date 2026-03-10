import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Phone, CheckCircle2, XCircle } from 'lucide-react';

const ClaimProfile = () => {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const phoneFromUrl = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(phoneFromUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'check' | 'signup' | 'success' | 'not-found'>('check');
  const [loading, setLoading] = useState(false);
  const [claimedName, setClaimedName] = useState('');

  // If user is already logged in, try claiming directly
  useEffect(() => {
    if (user && phoneFromUrl && step === 'check') {
      handleClaim();
    }
  }, [user, phoneFromUrl]);

  const checkPhone = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tradesmen')
      .select('id, full_name, is_claimed')
      .eq('whatsapp_number', phone)
      .maybeSingle();

    if (!data || data.is_claimed) {
      setStep('not-found');
    } else {
      setClaimedName(data.full_name);
      if (user) {
        await handleClaim(user.id);
      } else {
        setStep('signup');
      }
    }
    setLoading(false);
  };

  const handleClaim = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('claim_tradesman_profile', {
      _phone: phone,
    } as any);

    if (error) {
      toast.error(error.message);
      setStep('not-found');
    } else if (data) {
      await refreshProfile();
      setStep('success');
      toast.success(t('claim.success'));
    } else {
      setStep('not-found');
    }
    setLoading(false);
  };

  const handleSignupAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;

      if (signUpData.user) {
        await handleClaim(signUpData.user.id);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-secondary" />
            <h2 className="font-display text-2xl font-bold">{t('claim.successTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('claim.successDesc')}</p>
            <Button className="mt-6" onClick={() => navigate('/dashboard')}>
              {t('claim.goToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'not-found') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h2 className="font-display text-2xl font-bold">{t('claim.notFoundTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('claim.notFoundDesc')}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setStep('check'); setPhone(''); }}>
                {t('claim.tryAgain')}
              </Button>
              <Button onClick={() => navigate('/auth')}>
                {t('auth.signIn')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'signup') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">{t('claim.claimTitle')}</CardTitle>
            <CardDescription>
              {t('claim.claimingAs', { name: claimedName })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignupAndClaim} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.loading') : t('claim.claimAndCreate')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step: check
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">{t('claim.title')}</CardTitle>
          <CardDescription>{t('claim.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('claim.phoneLabel')}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34600000000"
                required
              />
            </div>
            <Button className="w-full" onClick={checkPhone} disabled={loading || !phone.trim()}>
              {loading ? t('auth.loading') : t('claim.verify')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimProfile;
