import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProfileCompletenessProps {
  profile: {
    full_name: string;
    bio: string | null;
    whatsapp_number: string | null;
    location: string | null;
    services: string[] | null;
    languages: string[];
    profile_image_url: string | null;
  };
}

const ProfileCompleteness = ({ profile }: ProfileCompletenessProps) => {
  const { t } = useTranslation();

  const checks = [
    { key: 'name', done: !!profile.full_name, label: t('dashboard.completeness.name') },
    { key: 'bio', done: !!profile.bio, label: t('dashboard.completeness.bio') },
    { key: 'phone', done: !!profile.whatsapp_number, label: t('dashboard.completeness.phone') },
    { key: 'location', done: !!profile.location, label: t('dashboard.completeness.location') },
    { key: 'services', done: (profile.services?.length || 0) > 0, label: t('dashboard.completeness.services') },
    { key: 'languages', done: profile.languages.length > 0, label: t('dashboard.completeness.languages') },
  ];

  const completed = checks.filter((c) => c.done).length;
  const percentage = Math.round((completed / checks.length) * 100);

  if (percentage === 100) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{t('dashboard.completeness.title')}</h3>
          <span className="text-base font-semibold text-primary">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="grid gap-2 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check.key} className="flex items-center gap-2 text-sm">
              {check.done ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className={check.done ? 'text-muted-foreground line-through' : 'font-medium'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompleteness;
