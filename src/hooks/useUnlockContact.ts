import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useUnlockContact = (tradesmanId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if already unlocked
  const { data: isUnlocked } = useQuery({
    queryKey: ['lead-unlock', tradesmanId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('contact_unlocks')
        .select('id')
        .eq('tradesman_id', tradesmanId)
        .eq('resident_id', user!.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!tradesmanId,
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('contact_unlocks').insert({
        tradesman_id: tradesmanId,
        resident_id: user!.id,
      });
      if (error && error.code !== '23505') throw error; // ignore duplicate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-unlock', tradesmanId] });
      toast.success('¡Contacto desbloqueado!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleUnlock = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    unlockMutation.mutate();
  };

  return {
    isUnlocked: !!isUnlocked,
    isUnlocking: unlockMutation.isPending,
    handleUnlock,
    showAuthModal,
    setShowAuthModal,
  };
};
