import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  averageStaffRating: number;
  averageCleanlinessRating: number;
  averageWaitTimeRating: number;
  averageTreatmentRating: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
  responseRate: number;
  responsesCount: number;
  categoryRatings: {
    staff: number;
    cleanliness: number;
    waitTime: number;
    treatment: number;
  };
}

interface ReviewsSummaryProps {
  centerId: string;
}

export const ReviewsSummary: React.FC<ReviewsSummaryProps> = ({ centerId }) => {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!centerId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('overall_rating, staff_rating, cleanliness_rating, wait_time_rating, treatment_rating')
        .eq('center_id', centerId)
        .eq('status', 'approved');

      if (error) throw error;

      if (data && data.length > 0) {
        const totalReviews = data.length;

        // Calculate Rating Distribution
        const distribution = {
          fiveStar: data.filter(r => r.overall_rating === 5).length,
          fourStar: data.filter(r => r.overall_rating === 4).length,
          threeStar: data.filter(r => r.overall_rating === 3).length,
          twoStar: data.filter(r => r.overall_rating === 2).length,
          oneStar: data.filter(r => r.overall_rating === 1).length,
        };

        // Fetch responses count for rate calculation
        const { data: responsesData } = await supabase
          .from('review_responses')
          .select('review_id');

        const responsesCount = responsesData ? responsesData.length : 0;
        const responseRate = totalReviews > 0 ? Math.round((responsesCount / totalReviews) * 100) : 0;

        const avgOverall = data.reduce((sum, review) => sum + review.overall_rating, 0) / totalReviews;
        const avgStaff = data.reduce((sum, review) => sum + (review.staff_rating || 0), 0) / totalReviews;
        const avgCleanliness = data.reduce((sum, review) => sum + (review.cleanliness_rating || 0), 0) / totalReviews;
        const avgWaitTime = data.reduce((sum, review) => sum + (review.wait_time_rating || 0), 0) / totalReviews;
        const avgTreatment = data.reduce((sum, review) => sum + (review.treatment_rating || 0), 0) / totalReviews;

        setSummary({
          totalReviews,
          averageRating: Math.round(avgOverall * 10) / 10,
          averageStaffRating: Math.round(avgStaff * 10) / 10,
          averageCleanlinessRating: Math.round(avgCleanliness * 10) / 10,
          averageWaitTimeRating: Math.round(avgWaitTime * 10) / 10,
          averageTreatmentRating: Math.round(avgTreatment * 10) / 10,
          ratingDistribution: distribution,
          responseRate,
          responsesCount,
          categoryRatings: {
            staff: Math.round(avgStaff * 10) / 10,
            cleanliness: Math.round(avgCleanliness * 10) / 10,
            waitTime: Math.round(avgWaitTime * 10) / 10,
            treatment: Math.round(avgTreatment * 10) / 10,
          }
        });
      }
    } catch (error) {
      console.error('Error fetching review summary:', error);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Overall Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold">{summary.averageRating}</div>
            {renderStars(summary.averageRating)}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { stars: 5, count: summary.ratingDistribution.fiveStar },
            { stars: 4, count: summary.ratingDistribution.fourStar },
            { stars: 3, count: summary.ratingDistribution.threeStar },
            { stars: 2, count: summary.ratingDistribution.twoStar },
            { stars: 1, count: summary.ratingDistribution.oneStar },
          ].map(({ stars, count }) => (
            <div key={stars} className="flex items-center space-x-2">
              <span className="text-sm w-6">{stars}</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Progress
                value={summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-8">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Category Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Category Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Staff', rating: summary.categoryRatings.staff },
            { label: 'Cleanliness', rating: summary.categoryRatings.cleanliness },
            { label: 'Wait Time', rating: summary.categoryRatings.waitTime },
            { label: 'Treatment', rating: summary.categoryRatings.treatment },
          ].map(({ label, rating }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                {rating > 0 && renderStars(rating)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Response Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Response Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.responseRate}%</div>
          <p className="text-sm text-gray-500 mt-2">
            {summary.responsesCount} of {summary.totalReviews} reviews have responses
          </p>
          <Progress value={summary.responseRate} className="mt-3" />
        </CardContent>
      </Card>
    </div>
  );
};
