import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Users, Lock } from 'lucide-react';

interface UnlockContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UnlockContactModal = ({ open, onOpenChange }: UnlockContactModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl">
            Comunidad protegida
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Para proteger a nuestros profesionales del spam y mantener la comunidad local,
            necesitas registrarte como vecino del Maresme.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <p className="text-sm font-medium">Protegemos a los profesionales</p>
              <p className="text-xs text-muted-foreground">Sin spam ni llamadas no deseadas</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <p className="text-sm font-medium">Comunidad local verificada</p>
              <p className="text-xs text-muted-foreground">Solo vecinos reales del Maresme</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              navigate('/auth?role=resident');
            }}
          >
            Registrarme como vecino
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              navigate('/auth');
            }}
          >
            Ya tengo cuenta — Iniciar sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockContactModal;
