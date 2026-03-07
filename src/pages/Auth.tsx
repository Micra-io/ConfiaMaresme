import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, Users } from 'lucide-react';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isResidentFlow = searchParams.get('role') === 'resident';

  const [isLogin, setIsLogin] = useState(!isResidentFlow);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('¡Bienvenido!');
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Cuenta creada. Revisa tu email para confirmar.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            {isResidentFlow && !isLogin
              ? 'Registro de vecino'
              : isLogin
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
          </CardTitle>
          <CardDescription>
            {isResidentFlow && !isLogin
              ? 'Únete a la comunidad del Maresme para contactar profesionales de confianza.'
              : isLogin
                ? 'Accede a tu cuenta'
                : 'Regístrate para formar parte de la comunidad'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isResidentFlow && !isLogin && (
            <div className="mb-6 space-y-2">
              <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm text-muted-foreground">
                  Tu registro ayuda a proteger a los profesionales del spam
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm text-muted-foreground">
                  Accede a contacto directo con profesionales verificados
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrarse'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary underline-offset-4 hover:underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
