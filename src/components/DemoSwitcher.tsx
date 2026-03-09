import { useAuth } from '@/hooks/useAuth';
import { useDemoMode, type DemoPersona } from '@/hooks/useDemoMode';
import { Eye, EyeOff, Home, Wrench, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const PERSONAS: { key: DemoPersona; label: string; icon: typeof Home }[] = [
  { key: 'resident', label: 'Resident', icon: Home },
  { key: 'tradesman', label: 'Tradesman', icon: Wrench },
  { key: 'admin', label: 'Admin', icon: ShieldCheck },
];

const DemoSwitcher = () => {
  const { isAdmin } = useAuth();
  const { activeDemoView, setDemoView, isDemoActive } = useDemoMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-1 rounded-full border bg-card/95 p-1 shadow-lg backdrop-blur-sm">
      {isDemoActive && (
        <div className="flex items-center gap-0.5">
          {PERSONAS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDemoView(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activeDemoView === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setDemoView(isDemoActive ? null : 'resident')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
          isDemoActive
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        )}
      >
        {isDemoActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {isDemoActive ? 'Exit' : 'Demo'}
      </button>
    </div>
  );
};

export default DemoSwitcher;
