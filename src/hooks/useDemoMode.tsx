import { createContext, useContext, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type DemoPersona = 'resident' | 'tradesman' | 'admin' | null;

interface DemoModeContextType {
  /** null = no override, use real auth state */
  activeDemoView: DemoPersona;
  setDemoView: (persona: DemoPersona) => void;
  /** Effective role considering demo override */
  effectiveRole: 'resident' | 'tradesman' | null;
  /** Effective admin flag considering demo override */
  effectiveIsAdmin: boolean;
  isDemoActive: boolean;
}

const DemoModeContext = createContext<DemoModeContextType>({
  activeDemoView: null,
  setDemoView: () => {},
  effectiveRole: null,
  effectiveIsAdmin: false,
  isDemoActive: false,
});

export const DemoModeProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, userRole } = useAuth();
  const [activeDemoView, setActiveDemoView] = useState<DemoPersona>(null);

  // Only admins can use demo mode
  const canDemo = isAdmin;
  const isDemoActive = canDemo && activeDemoView !== null;

  const effectiveRole: 'resident' | 'tradesman' | null = isDemoActive
    ? (activeDemoView === 'admin' ? 'resident' : activeDemoView)
    : userRole;

  const effectiveIsAdmin = isDemoActive
    ? activeDemoView === 'admin'
    : isAdmin;

  const setDemoView = (persona: DemoPersona) => {
    if (canDemo) setActiveDemoView(persona);
  };

  return (
    <DemoModeContext.Provider value={{
      activeDemoView,
      setDemoView,
      effectiveRole,
      effectiveIsAdmin,
      isDemoActive,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoModeContext);
