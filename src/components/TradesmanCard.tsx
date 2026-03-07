import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ShieldCheck, User } from 'lucide-react';
import { getCategoryLabel } from '@/lib/constants';
import type { Tables } from '@/lib/database.types';

interface TradesmanCardProps {
  tradesman: Tables<'tradesmen'>;
}

const TradesmanCard = ({ tradesman }: TradesmanCardProps) => {
  return (
    <Link to={`/tradesman/${tradesman.id}`}>
      <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <CardContent className="flex flex-col gap-4 p-5">
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
                {getCategoryLabel(tradesman.trade_category)}
              </p>
            </div>
          </div>

          {tradesman.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
                <ShieldCheck className="h-3 w-3" /> Verificado
              </Badge>
            )}
            {tradesman.is_available && (
              <Badge variant="outline" className="text-secondary border-secondary">
                Disponible
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TradesmanCard;
