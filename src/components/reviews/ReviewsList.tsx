import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, Reply } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Review {
  id: string;
  center_id: string;
  patient_id: string;
  overall_rating: number;
  staff_rating?: number;
  cleanliness_rating?: number;
  wait_time_rating?: number;
  treatment_rating?: number;
  title?: string;
  content?: string;
  is_anonymous: boolean;
  is_verified: boolean;
  status: string;
  photos?: string[];
  helpful_votes: number;
  total_votes: number;
  created_at: string;
  patients?: { name: string };
  review_responses?: { content: string; created_at: string }[];
}

interface ReviewsListProps {
  centerId?: string;
  patientId?: string;
  showCreateButton?: boolean;
  onCreateReview?: () => void;
  userRole?: 'patient' | 'center_staff' | 'admin';
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  centerId,
  patientId,
  showCreateButton = false,
  onCreateReview,
  userRole = 'patient'
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchReviews = useCallback(async () => {
    if (!centerId && !patientId) return;

    setLoading(true);
    try {
      let query = supabase.from('reviews').select(`
        *,
        patients!inner(name),
        review_responses(content, created_at)
      `);

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      // Permission-based status filtering
      if (userRole === 'patient') {
        query = query.eq('status', 'approved');
      }

      // Apply UI filters
      if (filter === 'verified') {
        query = query.eq('is_verified', true);
      } else if (filter === 'pending' && (userRole === 'admin' || userRole === 'center_staff')) {
        query = query.eq('status', 'pending');
      } else if (filter === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('created_at', oneWeekAgo.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: Review[] = (data || []).map(item => ({
        ...item,
        title: item.title ?? undefined,
        content: item.content ?? undefined,
        is_anonymous: item.is_anonymous ?? false,
        is_verified: item.is_verified ?? false,
        status: item.status ?? 'approved',
        staff_rating: item.staff_rating ?? undefined,
        cleanliness_rating: item.cleanliness_rating ?? undefined,
        wait_time_rating: item.wait_time_rating ?? undefined,
        treatment_rating: item.treatment_rating ?? undefined,
        helpful_votes: item.helpful_votes ?? 0,
        total_votes: item.total_votes ?? 0,
        created_at: item.created_at ?? new Date().toISOString(),
        photos: Array.isArray(item.photos)
          ? (item.photos as string[]).filter(photo => typeof photo === 'string')
          : item.photos && typeof item.photos === 'string'
            ? [item.photos]
            : [],
        review_responses: Array.isArray(item.review_responses)
          ? item.review_responses.map(response => ({
            content: response.content ?? '',
            created_at: response.created_at ?? new Date().toISOString()
          }))
          : (item.review_responses ? [{
            content: item.review_responses.content ?? '',
            created_at: item.review_responses.created_at ?? new Date().toISOString()
          }] : [])
      }));

      setReviews(transformedData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [centerId, patientId, filter, userRole]);

  const handleUpdateStatus = async (reviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success(`Review status updated to ${newStatus}`);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review deleted permanently');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const renderCategoryRatings = (review: Review) => {
    const categories = [
      { label: 'Staff', rating: review.staff_rating },
      { label: 'Cleanliness', rating: review.cleanliness_rating },
      { label: 'Wait Time', rating: review.wait_time_rating },
      { label: 'Treatment', rating: review.treatment_rating },
    ];

    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {categories.map(({ label, rating }) =>
          rating && (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{label}:</span>
              {renderStars(rating)}
            </div>
          )
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'verified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('verified')}
            >
              Verified
            </Button>
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('recent')}
            >
              Recent
            </Button>
            {(userRole === 'admin' || userRole === 'center_staff') && (
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending Approval
              </Button>
            )}
          </div>
        </div>
        {showCreateButton && (
          <Button onClick={onCreateReview}>
            Write a Review
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No reviews found.</p>
            {showCreateButton && (
              <Button onClick={onCreateReview} className="mt-4">
                Be the first to write a review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <CardTitle className="text-lg">
                        {review.is_anonymous ? 'Anonymous Patient' : review.patients?.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.overall_rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        {review.is_verified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Status Badge for Staff/Admin */}
                    {(userRole === 'admin' || userRole === 'center_staff') && (
                      <Badge
                        className={`${review.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          review.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          } border-none font-black uppercase text-[10px] tracking-widest px-2`}
                      >
                        {review.status}
                      </Badge>
                    )}

                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.helpful_votes}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {review.title && (
                  <h3 className="font-semibold mb-2">{review.title}</h3>
                )}
                {review.content && (
                  <p className="text-gray-700 mb-4">{review.content}</p>
                )}

                {renderCategoryRatings(review)}

                {review.photos && review.photos.length > 0 && (
                  <div className="flex space-x-2 mt-4">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {review.review_responses && review.review_responses.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Reply className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-semibold text-blue-800">Response from Healthcare Center</span>
                    </div>
                    <p className="text-gray-700">{review.review_responses[0].content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.review_responses[0].created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Moderation Controls */}
                {(userRole === 'admin' || userRole === 'center_staff') && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                    {review.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-emerald-100"
                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                      >
                        Approve & Publish
                      </Button>
                    )}
                    {review.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold h-9 px-4 rounded-xl"
                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                      >
                        Reject Clinical Review
                      </Button>
                    )}
                    {review.status !== 'hidden' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 font-bold hover:text-slate-600 h-9 px-4 rounded-xl"
                        onClick={() => handleUpdateStatus(review.id, 'hidden')}
                      >
                        Archive / Hide
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-600 font-black uppercase text-[10px] tracking-widest ml-auto h-9 px-4 rounded-xl hover:bg-red-50"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
