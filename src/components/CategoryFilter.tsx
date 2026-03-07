import { TRADE_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Zap, Droplets, Hammer, Paintbrush, Wrench, KeyRound, 
  TreePine, Sparkles, BrickWall, Home, Wind, MoreHorizontal 
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Droplets, Hammer, Paintbrush, Wrench, KeyRound,
  TreePine, Sparkles, BrickWall, Home, Wind, MoreHorizontal,
};

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (value: string | null) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { t } = useTranslation();

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selected === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(null)}
          className="shrink-0"
        >
          {t('categories.all')}
        </Button>
        {TRADE_CATEGORIES.map(cat => {
          const Icon = iconMap[cat.icon];
          return (
            <Button
              key={cat.value}
              variant={selected === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelect(cat.value === selected ? null : cat.value)}
              className="gap-1.5 shrink-0"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {t(`categories.${cat.value}`)}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;
