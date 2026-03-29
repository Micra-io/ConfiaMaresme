import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles } from 'lucide-react';
import WhatsAppSettingsSection from '@/components/WhatsAppSettingsSection';

const DashboardSettings = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{t('dashboard.settings')}</h2>
        <p className="text-sm text-muted-foreground">{t('dashboard.settingsDesc')}</p>
      </div>

      {/* Upgrade to Pro banner */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20">
            <Crown className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{t('dashboard.upgradePro')}</p>
              <Badge variant="outline" className="border-accent text-accent text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                PRO
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{t('dashboard.upgradeProDesc')}</p>
          </div>
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" disabled>
            {t('dashboard.comingSoon')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('auth.email')}</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <Button variant="destructive" onClick={signOut}>
            {t('nav.signOut')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
