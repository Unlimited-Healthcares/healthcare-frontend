import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle2, Award, Clock, ThumbsUp } from 'lucide-react';
import { reviewApi } from '@/services/reviewApi';
import { toast } from 'sonner';
import { Request } from '@/types/discovery';
import { cn } from '@/lib/utils';

interface PerformanceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request;
  onSuccess?: () => void;
}

export const PerformanceReviewModal: React.FC<PerformanceReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Determine who is being reviewed
  const revieweeId = request.recipientId;
  const revieweeName = request.recipientName;

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      await reviewApi.createReview({
        revieweeUserId: revieweeId,
        requestId: request.id,
        overallRating,
        title: title || `Performance Review for ${request.requestType.replace(/_/g, ' ')}`,
        content,
        isAnonymous
      });

      toast.success('Performance review submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Review submission error:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-white rounded-3xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white relative">
          <Award className="absolute top-4 right-4 h-12 w-12 text-white/20" />
          <DialogTitle className="text-2xl font-bold mb-2">Service Performance Review</DialogTitle>
          <DialogDescription className="text-teal-50">
            Share your experience with <strong>{revieweeName}</strong> for the completed {request.requestType.replace(/_/g, ' ')}.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Performance</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-200 transform hover:scale-125"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setOverallRating(star)}
                >
                  <Star
                    className={cn(
                      "h-10 w-10",
                      star <= (hoverRating || overallRating)
                        ? "fill-yellow-400 text-yellow-500 drop-shadow-sm"
                        : "text-slate-300 fill-none"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">
              {overallRating === 5 ? 'Excellent!' :
                overallRating === 4 ? 'Very Good' :
                  overallRating === 3 ? 'Good' :
                    overallRating === 2 ? 'Fair' :
                      overallRating === 1 ? 'Poor' : 'Select a rating'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="review-title" className="text-sm font-semibold text-slate-700">Review Title (Optional)</Label>
              <input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Professional and highly efficient"
                className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none"
              />
            </div>

            <div>
              <Label htmlFor="review-content" className="text-sm font-semibold text-slate-700">Detailed Feedback</Label>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the quality of service, communication, and professionalism..."
                className="mt-1.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-teal-500 min-h-[120px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            <p className="text-xs text-teal-800 font-medium">
              Your review will appear on the provider's public profile to help other receivers make informed decisions.
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl flex-1 h-12 font-bold text-slate-500 hover:bg-slate-50">
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || overallRating === 0}
            className="flex-[2] rounded-xl h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-teal-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Performance Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
