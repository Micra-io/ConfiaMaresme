import { TRADE_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
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
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(null)}
      >
        Todos
      </Button>
      {TRADE_CATEGORIES.map(cat => {
        const Icon = iconMap[cat.icon];
        return (
          <Button
            key={cat.value}
            variant={selected === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(cat.value === selected ? null : cat.value)}
            className="gap-1.5"
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {cat.label}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
