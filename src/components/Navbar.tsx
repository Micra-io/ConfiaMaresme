import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-primary">Confia</span>
          <span className="font-display text-xl font-bold text-secondary">Maresme</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Directorio
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" /> Mi Perfil
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" /> Salir
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">Acceder</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Directorio</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Mi Perfil</Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-left text-sm font-medium text-destructive">Salir</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-primary">Acceder</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
