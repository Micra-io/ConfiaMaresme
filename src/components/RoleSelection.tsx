import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Home, Wrench } from 'lucide-react';

const RoleSelection = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const selectRole = async (role: 'resident' | 'tradesman') => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ user_role: role as any })
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refreshProfile();

    if (role === 'tradesman') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
    toast.success(t('auth.welcome'));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">{t('auth.selectRole')}</CardTitle>
          <CardDescription>{t('auth.selectRoleDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => selectRole('resident')}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Home className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">{t('auth.roleResident')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('auth.roleResidentDesc')}</p>
            </div>
          </button>

          <button
            onClick={() => selectRole('tradesman')}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center transition-all hover:border-secondary hover:bg-secondary/5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
              <Wrench className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">{t('auth.roleTradesman')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('auth.roleTradesmanDesc')}</p>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;
