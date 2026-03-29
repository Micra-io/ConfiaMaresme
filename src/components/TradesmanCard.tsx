import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ShieldCheck, User, Lock, MessageCircle, Phone, MessageSquare, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUnlockContact } from '@/hooks/useUnlockContact';
import UnlockContactModal from '@/components/UnlockContactModal';
import { getPrimaryContact, isContactUnavailable } from '@/lib/contactMethod';

const ContactIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ElementType> = { MessageCircle, Phone, MessageSquare, Mail };
  const Icon = icons[name];
  return Icon ? <Icon className={className} /> : null;
};

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
    whatsapp_reachable?: string;
    contact_method?: string;
    alternate_contact?: string | null;
  };
}

const TradesmanCard = ({ tradesman }: TradesmanCardProps) => {
  const { t } = useTranslation();
  const { isUnlocked, isUnlocking, handleUnlock, showAuthModal, setShowAuthModal } =
    useUnlockContact(tradesman.id);

  const contact = getPrimaryContact({
    whatsapp_reachable: tradesman.whatsapp_reachable || 'unknown',
    contact_method: tradesman.contact_method || 'whatsapp',
    whatsapp_number: tradesman.whatsapp_number,
    alternate_contact: tradesman.alternate_contact,
  });

  const unavailable = contact.type === 'unavailable';

  return (
    <>
      <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <CardContent className="relative flex flex-col gap-4 p-5">
          {/* Contact method badge in corner */}
          {!unavailable && (
            <div className="absolute right-4 top-4">
              <ContactIcon name={contact.iconName} className={`h-4 w-4 ${contact.badgeColorClass}`} />
            </div>
          )}

          <Link to={`/tradesman/${tradesman.id}`}>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                {tradesman.profile_image_url ? (
                  <img src={tradesman.profile_image_url} alt={tradesman.full_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <h3 className="truncate font-display text-xl font-semibold text-foreground group-hover:text-primary">
                  {tradesman.full_name}
                </h3>
                <p className="text-base font-medium text-secondary">
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
              <div className="mt-3 flex items-center gap-1.5 text-base text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {tradesman.location}
              </div>
            )}

            {tradesman.bio && (
              <p className="line-clamp-2 text-base text-muted-foreground">{tradesman.bio}</p>
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

          {unavailable ? (
            <p className="text-center text-sm text-muted-foreground">{t('contact.unavailable')}</p>
          ) : isUnlocked && contact.href ? (
            <a href={contact.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" className={`w-full gap-2 ${contact.colorClass}`}>
                <ContactIcon name={contact.iconName} className="h-4 w-4" /> {t(contact.labelKey)}
              </Button>
            </a>
          ) : !isUnlocked ? (
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
          ) : (
            <p className="text-center text-sm text-muted-foreground">{t('contact.unavailable')}</p>
          )}
        </CardContent>
      </Card>

      <UnlockContactModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default TradesmanCard;
