import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl">
            {t('unlock.title')}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {t('unlock.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <p className="text-sm font-medium">{t('unlock.protectPros')}</p>
              <p className="text-xs text-muted-foreground">{t('unlock.protectProsDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <p className="text-sm font-medium">{t('unlock.localCommunity')}</p>
              <p className="text-xs text-muted-foreground">{t('unlock.localCommunityDesc')}</p>
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
            {t('unlock.signUpResident')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              navigate('/auth');
            }}
          >
            {t('unlock.alreadyHaveAccount')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockContactModal;
