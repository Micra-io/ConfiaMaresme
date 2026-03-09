import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, profileLoading } = useAuth();
  const { effectiveIsAdmin } = useDemoMode();

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Real admin check — demo mode is only available to actual admins anyway
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
