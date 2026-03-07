import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradesmanId: string;
  tradesmanName: string;
}

const ReviewModal = ({ open, onOpenChange, tradesmanId, tradesmanName }: ReviewModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('reviews').insert({
        tradesman_id: tradesmanId,
        resident_id: user!.id,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('reviews.submitted'));
      queryClient.invalidateQueries({ queryKey: ['reviews', tradesmanId] });
      queryClient.invalidateQueries({ queryKey: ['review-prompt'] });
      onOpenChange(false);
      setRating(0);
      setComment('');
    },
    onError: (err: any) => {
      if (err.message?.includes('row-level security')) {
        toast.error(t('reviews.tooEarly'));
      } else if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        toast.error(t('reviews.alreadyReviewed'));
      } else {
        toast.error(err.message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('reviews.leaveReview')}</DialogTitle>
          <DialogDescription>
            {t('reviews.reviewFor', { name: tradesmanName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-accent text-accent'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviews.commentPlaceholder')}
            rows={3}
          />

          <Button
            onClick={() => submitMutation.mutate()}
            disabled={rating === 0 || submitMutation.isPending}
            className="w-full"
          >
            {submitMutation.isPending ? t('dashboard.saving') : t('reviews.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
