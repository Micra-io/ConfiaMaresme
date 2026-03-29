import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import heroImage from '@/assets/hero-maresme.jpg';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Costa del Maresme" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center md:py-32">
        <h1 className="animate-fade-in font-display text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80" style={{ animationDelay: '0.1s' }}>
          {t('hero.subtitle')}
        </p>
        <div className="mx-auto mt-8 max-w-xl" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('hero.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-14 rounded-full border-0 bg-card pl-12 text-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
