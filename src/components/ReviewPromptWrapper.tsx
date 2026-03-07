import { useState } from 'react';
import { useReviewPrompt } from '@/hooks/useReviewPrompt';
import ReviewModal from '@/components/ReviewModal';

const ReviewPromptWrapper = () => {
  const pendingReview = useReviewPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!pendingReview || dismissed) return null;

  return (
    <ReviewModal
      open={true}
      onOpenChange={(open) => {
        if (!open) setDismissed(true);
      }}
      tradesmanId={pendingReview.id}
      tradesmanName={pendingReview.full_name}
    />
  );
};

export default ReviewPromptWrapper;
