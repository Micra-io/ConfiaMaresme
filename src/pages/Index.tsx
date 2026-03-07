import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import CategoryFilter from '@/components/CategoryFilter';
import TradesmanCard from '@/components/TradesmanCard';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: tradesmen, isLoading } = useQuery({
    queryKey: ['tradesmen', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase.from('tradesmen').select('*').order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('trade_category', selectedCategory as any);
      }

      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="mb-4 font-display text-2xl font-bold">Buscar por oficio</h2>
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-lg" />
            ))}
          </div>
        ) : tradesmen && tradesmen.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tradesmen.map((t) => (
              <TradesmanCard key={t.id} tradesman={t} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No se encontraron profesionales.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Intenta cambiar los filtros o la búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
