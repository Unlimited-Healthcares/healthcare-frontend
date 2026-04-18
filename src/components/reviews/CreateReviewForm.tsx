
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateReviewFormProps {
  centerId: string;
  appointmentId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateReviewForm: React.FC<CreateReviewFormProps> = ({
  centerId,
  appointmentId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    overallRating: 0,
    staffRating: 0,
    cleanlinessRating: 0,
    waitTimeRating: 0,
    treatmentRating: 0,
    title: '',
    content: '',
    isAnonymous: false,
    photos: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState<{ [key: string]: number }>({});

  const handleRatingChange = (category: string, rating: number) => {
    setFormData(prev => ({ ...prev, [`${category}Rating`]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setLoading(true);
    try {
      // Get current user's patient ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (!patient) throw new Error('Patient profile not found');

      const reviewData = {
        center_id: centerId,
        patient_id: patient.id,
        appointment_id: appointmentId || null,
        overall_rating: formData.overallRating,
        staff_rating: formData.staffRating || null,
        cleanliness_rating: formData.cleanlinessRating || null,
        wait_time_rating: formData.waitTimeRating || null,
        treatment_rating: formData.treatmentRating || null,
        title: formData.title || null,
        content: formData.content || null,
        is_anonymous: formData.isAnonymous,
        photos: formData.photos.length > 0 ? formData.photos : null,
        is_verified: !!appointmentId
      };

      const { error } = await supabase
        .from('reviews')
        .insert([reviewData]);

      if (error) throw error;

      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (category: string, value: number) => {
    const currentHover = hoverRating[category] || 0;
    const displayRating = currentHover || value;

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= displayRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
            }`}
            onMouseEnter={() => setHoverRating(prev => ({ ...prev, [category]: star }))}
            onMouseLeave={() => setHoverRating(prev => ({ ...prev, [category]: 0 }))}
            onClick={() => handleRatingChange(category, star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label className="text-base font-semibold">Overall Rating *</Label>
            <div className="mt-2">
              {renderStarRating('overall', formData.overallRating)}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Staff Friendliness</Label>
              <div className="mt-1">
                {renderStarRating('staff', formData.staffRating)}
              </div>
            </div>
            <div>
              <Label>Cleanliness</Label>
              <div className="mt-1">
                {renderStarRating('cleanliness', formData.cleanlinessRating)}
              </div>
            </div>
            <div>
              <Label>Wait Time</Label>
              <div className="mt-1">
                {renderStarRating('waitTime', formData.waitTimeRating)}
              </div>
            </div>
            <div>
              <Label>Treatment Quality</Label>
              <div className="mt-1">
                {renderStarRating('treatment', formData.treatmentRating)}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your review a title"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Review Details</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your experience..."
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked }))}
            />
            <Label htmlFor="anonymous">Post anonymously</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.overallRating === 0}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
