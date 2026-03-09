import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
