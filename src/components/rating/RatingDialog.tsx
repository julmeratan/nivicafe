import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RatingDialog: React.FC<RatingDialogProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    toast.success('Thank you for your feedback!');
    setRating(0);
    setFeedback('');
    onClose();
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            Rate Your Experience
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "text-gold fill-gold"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <p className="text-gold font-medium animate-fade-in">
                {ratingLabels[hoveredRating || rating]}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              How can we improve? (Optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about our food, service, or ambience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={4}
            />
          </div>

          {/* Quick Feedback Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Feedback</label>
            <div className="flex flex-wrap gap-2">
              {['Great Food', 'Fast Service', 'Nice Ambience', 'Value for Money', 'Friendly Staff'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setFeedback((prev) => (prev ? `${prev}, ${tag}` : tag))}
                    className="px-3 py-1.5 bg-secondary text-sm rounded-full hover:bg-gold/20 hover:text-gold transition-colors border border-border"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
          >
            <Send className="w-4 h-4" />
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
