import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ShieldCheck, User, Lock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUnlockContact } from '@/hooks/useUnlockContact';
import UnlockContactModal from '@/components/UnlockContactModal';

interface TradesmanCardProps {
  tradesman: {
    id: string;
    full_name: string;
    trade_category: string;
    additional_categories?: string[];
    languages?: string[];
    location: string | null;
    bio: string | null;
    profile_image_url: string | null;
    vetted_by_community: boolean;
    is_available: boolean;
    whatsapp_number: string | null;
  };
}

const TradesmanCard = ({ tradesman }: TradesmanCardProps) => {
  const { t } = useTranslation();
  const { isUnlocked, isUnlocking, handleUnlock, showAuthModal, setShowAuthModal } =
    useUnlockContact(tradesman.id);

  const whatsappLink = tradesman.whatsapp_number
    ? `https://wa.me/${tradesman.whatsapp_number.replace(/\D/g, '')}`
    : null;

  return (
    <>
      <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <CardContent className="flex flex-col gap-4 p-5">
          <Link to={`/tradesman/${tradesman.id}`}>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                {tradesman.profile_image_url ? (
                  <img src={tradesman.profile_image_url} alt={tradesman.full_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-semibold text-foreground group-hover:text-primary">
                  {tradesman.full_name}
                </h3>
                <p className="text-sm font-medium text-secondary">
                  {t(`categories.${tradesman.trade_category}`)}
                  {tradesman.additional_categories?.length > 0 && (
                    <span className="text-muted-foreground font-normal">
                      {' · '}{tradesman.additional_categories.slice(0, 2).map((c: string) => t(`categories.${c}`)).join(', ')}
                      {tradesman.additional_categories.length > 2 && ` +${tradesman.additional_categories.length - 2}`}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {tradesman.location && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {tradesman.location}
              </div>
            )}

            {tradesman.bio && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{tradesman.bio}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {tradesman.vetted_by_community && (
                <Badge className="gap-1 bg-success text-success-foreground">
                  <ShieldCheck className="h-3 w-3" /> {t('card.verified')}
                </Badge>
              )}
              {tradesman.is_available && (
                <Badge variant="outline" className="text-secondary border-secondary">
                  {t('card.available')}
                </Badge>
              )}
            </div>
          </Link>

          {isUnlocked && whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90">
                <MessageCircle className="h-4 w-4" /> {t('card.contactWhatsApp')}
              </Button>
            </a>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleUnlock();
              }}
              disabled={isUnlocking}
            >
              <Lock className="h-4 w-4 shrink-0" />
              {isUnlocking ? t('card.unlocking') : t('card.unlockContact')}
            </Button>
          )}
        </CardContent>
      </Card>

      <UnlockContactModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default TradesmanCard;
