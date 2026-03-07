import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Checks if the resident unlocked a tradesman's contact >=24h ago
 * and hasn't reviewed them yet. Returns the tradesman info if so.
 */
export const useReviewPrompt = () => {
  const { user } = useAuth();

  const { data: pendingReview } = useQuery({
    queryKey: ['review-prompt', user?.id],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Get leads older than 24h
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('tradesman_id, created_at')
        .eq('resident_id', user!.id)
        .lte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (leadsError || !leads || leads.length === 0) return null;

      // Check which ones have been reviewed already
      const tradesmanIds = leads.map((l) => l.tradesman_id);
      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('tradesman_id')
        .eq('resident_id', user!.id)
        .in('tradesman_id', tradesmanIds);

      const reviewedSet = new Set(existingReviews?.map((r) => r.tradesman_id) || []);
      const unreviewedLead = leads.find((l) => !reviewedSet.has(l.tradesman_id));

      if (!unreviewedLead) return null;

      // Get tradesman info
      const { data: tradesman } = await supabase
        .from('tradesmen')
        .select('id, full_name')
        .eq('id', unreviewedLead.tradesman_id)
        .single();

      return tradesman || null;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return pendingReview || null;
};
