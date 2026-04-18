import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Star,
  MessageSquare,
  CheckCircle,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Download,
  User,
  MoreHorizontal,
  ThumbsUp,
  EyeOff,
  Check,
  X,
  Camera,
  Trash2
} from 'lucide-react';
import {
  Review,
  CenterReviewSummary,
  ReviewStatus,
  ReviewModerationAction
} from '../types/review';
import { mockReviewData } from '../services/reviewApi';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { toast } from 'sonner';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement);

const ReviewDashboardPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<CenterReviewSummary | null>(null);
  const [loading, setLoading] = useState(false);
  // Filters for future API integration
  // const [filters] = useState<QueryReviewsDto>({
  //   sortBy: ReviewSortBy.CREATED_AT,
  //   sortOrder: SortOrder.DESC,
  //   page: 1,
  //   limit: 10
  // });
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [chartMode, setChartMode] = useState<'rating' | 'volume' | 'response'>('rating');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Live data integration
  useEffect(() => {
    loadDashboardData();
  }, [ratingFilter, statusFilter, searchTerm]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Reviews from Supabase
      let query = supabase
        .from('reviews')
        .select(`
          *,
          patients!inner(name, email),
          review_responses(*)
        `);

      if (ratingFilter !== 'all') {
        query = query.gte('overall_rating', parseInt(ratingFilter));
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (searchTerm) {
        query = query.or(`content.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
      }

      const { data: dbReviews, error: reviewsError } = await query.order('created_at', { ascending: false });
      if (reviewsError) throw reviewsError;

      // Map DB reviews to Review interface
      const mappedReviews: Review[] = ((dbReviews || []) as any[]).map(item => ({
        id: item.id,
        overallRating: item.overall_rating,
        title: item.title || '',
        content: item.content || '',
        isAnonymous: item.is_anonymous ?? false,
        isVerified: item.is_verified ?? false,
        status: (item.status || 'pending') as ReviewStatus,
        helpfulVotes: item.helpful_votes || 0,
        totalVotes: item.total_votes || 0,
        isEdited: item.is_edited ?? false,
        createdAt: new Date(item.created_at || Date.now()),
        updatedAt: new Date(item.updated_at || Date.now()),
        patient: item.patients ? {
          id: item.patient_id,
          name: item.patients.name || 'Anonymous',
          email: item.patients.email || ''
        } : undefined,
        response: item.review_responses && (Array.isArray(item.review_responses) ? item.review_responses.length > 0 : !!item.review_responses)
          ? {
            id: Array.isArray(item.review_responses) ? item.review_responses[0].id : item.review_responses.id,
            reviewId: item.id,
            content: Array.isArray(item.review_responses) ? item.review_responses[0].content : item.review_responses.content,
            responder: {
              id: Array.isArray(item.review_responses) ? item.review_responses[0].responder_id : item.review_responses.responder_id,
              name: 'Provider',
              email: ''
            },
            createdAt: new Date((Array.isArray(item.review_responses) ? item.review_responses[0].created_at : item.review_responses.created_at) || Date.now())
          } as any : undefined,
        votes: []
      }));

      setReviews(mappedReviews);

      // 2. Generate Summary Analytics
      if (mappedReviews.length > 0) {
        const total = mappedReviews.length;
        const avg = mappedReviews.reduce((s, r) => s + r.overallRating, 0) / total;
        const verified = mappedReviews.filter(r => r.isVerified).length;
        const reviewsWithResponse = mappedReviews.filter(r => r.response);
        const totalResponseTime = reviewsWithResponse.reduce((acc, r) => {
          const reviewDate = new Date(r.createdAt).getTime();
          const responseDate = new Date(r.response!.createdAt).getTime();
          return acc + (responseDate - reviewDate);
        }, 0);
        const avgResponseTimeHours = reviewsWithResponse.length > 0
          ? Math.round(totalResponseTime / (reviewsWithResponse.length * 1000 * 60 * 60))
          : 0;

        const summaryData: CenterReviewSummary = {
          totalReviews: total,
          averageRating: Math.round(avg * 10) / 10,
          verifiedReviewsCount: verified,
          responseRate: Math.round((reviewsWithResponse.length / total) * 100),
          averageResponseTime: avgResponseTimeHours || 24, // Use calculated or fallback
          ratingDistribution: {
            fiveStars: mappedReviews.filter(r => r.overallRating === 5).length,
            fourStars: mappedReviews.filter(r => r.overallRating === 4).length,
            threeStars: mappedReviews.filter(r => r.overallRating === 3).length,
            twoStars: mappedReviews.filter(r => r.overallRating === 2).length,
            oneStars: mappedReviews.filter(r => r.overallRating === 1).length,
          },
          recentReviews: mappedReviews.slice(0, 5)
        };
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting reviews...');
  };

  const handleModerateReview = async (reviewId: string, action: ReviewModerationAction) => {
    try {
      setLoading(true);
      const newStatus = action === ReviewModerationAction.APPROVE ? 'approved' :
        action === ReviewModerationAction.REJECT ? 'rejected' :
          action === ReviewModerationAction.FLAG ? 'flagged' :
            action === ReviewModerationAction.HIDE ? 'hidden' : 'pending';

      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus as any })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success(`Review ${action.toLowerCase()}ed successfully`);
      loadDashboardData();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Failed to update review status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review deleted permanently');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToReview = async (reviewId: string) => {
    const responseContent = prompt('Enter your professional response:');
    if (!responseContent) return;

    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          content: responseContent,
          responded_by: userData.user.id
        });

      if (error) throw error;

      toast.success('Response posted successfully');
      loadDashboardData();
    } catch (error) {
      console.error('Error responding to review:', error);
      toast.error('Failed to post response');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteOnReview = async (reviewId: string, isHelpful: boolean) => {
    try {
      const { data: review } = await supabase
        .from('reviews')
        .select('helpful_votes, total_votes')
        .eq('id', reviewId)
        .single();

      if (review) {
        const updates: any = {
          total_votes: (review.total_votes || 0) + 1
        };
        if (isHelpful) {
          updates.helpful_votes = (review.helpful_votes || 0) + 1;
        }

        await supabase
          .from('reviews')
          .update(updates)
          .eq('id', reviewId);

        loadDashboardData();
      }
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  // Chart data preparation
  const prepareRatingDistributionData = () => {
    if (!summary?.ratingDistribution) return null;

    return {
      labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
      datasets: [
        {
          data: [
            summary.ratingDistribution.fiveStars,
            summary.ratingDistribution.fourStars,
            summary.ratingDistribution.threeStars,
            summary.ratingDistribution.twoStars,
            summary.ratingDistribution.oneStars
          ],
          backgroundColor: [
            '#4CAF50',
            '#8BC34A',
            '#2196F3',
            '#FF9800',
            '#F44336'
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const prepareTrendsData = () => {
    // Group reviews by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Create map for all 30 days to ensure continuous line
    const dailyStats: Record<string, { total: number; count: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyStats[d.toLocaleDateString()] = { total: 0, count: 0 };
    }

    reviews.forEach(r => {
      const dateStr = new Date(r.createdAt).toLocaleDateString();
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].total += r.overallRating;
        dailyStats[dateStr].count += 1;
      }
    });

    const labels = Object.keys(dailyStats).map(d => d.split('/')[1] + '/' + d.split('/')[0]); // MM/DD
    const values = Object.values(dailyStats).map(s => s.count > 0 ? s.total / s.count : 0);
    const volumes = Object.values(dailyStats).map(s => s.count);

    if (chartMode === 'rating') {
      return {
        labels,
        datasets: [{
          label: 'Average Satisfaction',
          data: values,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2
        }]
      };
    } else if (chartMode === 'volume') {
      return {
        labels,
        datasets: [{
          label: 'Feedback Volume',
          data: volumes,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2
        }]
      };
    } else {
      // For Response Rate, we track responses
      const responseCounts = Object.keys(dailyStats).map(dateStr => {
        return reviews.filter(r => new Date(r.createdAt).toLocaleDateString() === dateStr && !!r.response).length;
      });
      return {
        labels,
        datasets: [{
          label: 'Staff Response Count',
          data: responseCounts,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2
        }]
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 0.5
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
    },
    cutout: '60%'
  };

  const filteredReviews = reviews.filter(review => {
    if (searchTerm && !review.content?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !review.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (ratingFilter !== 'all') {
      const minRating = parseInt(ratingFilter);
      if (review.overallRating < minRating) return false;
    }
    if (statusFilter !== 'all' && review.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading review dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 overflow-x-hidden pb-28 md:pb-0">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Patient Experience & Feedback</h1>
          <p className="text-sm sm:text-base text-gray-600">Analyze patient satisfaction scores and moderate clinical feedback transcripts.</p>
        </div>

        {/* Action Buttons & Source Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100/50">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <div className="text-[10px] sm:text-xs">
              <span className="font-black text-blue-700 uppercase">Reviewer Roles:</span>
              <span className="ml-2 text-blue-600 font-medium italic">"Submissions are exclusively by verified patients. As a practitioner, your role is to moderate and engage."</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh Sync</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Export</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Satisfaction Score</h3>
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{summary.averageRating.toFixed(1)}</span>
                <span className="sm:ml-2 text-xs sm:text-sm text-gray-500 hidden sm:inline">out of 5</span>
              </div>
              <div className="flex items-center mt-1 sm:mt-2 text-green-600 text-xs sm:text-sm">
                <span className="text-xs">↗</span>
                <span className="ml-1">2.3%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Feedback</h3>
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{summary.totalReviews}</span>
                <span className="sm:ml-2 text-xs sm:text-sm text-gray-500 hidden sm:inline">all time</span>
              </div>
              <div className="flex items-center mt-1 sm:mt-2 text-blue-600 text-xs sm:text-sm">
                <span className="text-xs">↗</span>
                <span className="ml-1">12.5%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Consultation Verified</h3>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600">{summary.verifiedReviewsCount}</span>
                <span className="sm:ml-2 text-xs sm:text-sm text-gray-500 hidden lg:inline">{((summary.verifiedReviewsCount / summary.totalReviews) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Response Engagement</h3>
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600">{summary.responseRate.toFixed(0)}%</span>
                <span className="sm:ml-2 text-xs sm:text-sm text-gray-500 hidden sm:inline">rate</span>
              </div>
              <div className="flex items-center mt-1 sm:mt-2 text-green-600 text-xs sm:text-sm">
                <span className="text-xs">↗</span>
                <span className="ml-1">5.2%</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Rating Distribution */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Rating Distribution</h3>
              <p className="text-xs sm:text-sm text-gray-600">How patients rate their experience</p>
            </div>
            <div className="h-48 sm:h-64">
              {prepareRatingDistributionData() && (
                <Doughnut data={prepareRatingDistributionData()!} options={doughnutOptions} />
              )}
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 text-[10px] sm:text-xs">
              <div className="text-center">
                <div className="font-black text-emerald-600">{summary?.ratingDistribution?.fiveStars || 0}</div>
                <div className="text-gray-400 uppercase font-bold">5 Stars</div>
              </div>
              <div className="text-center">
                <div className="font-black text-emerald-500">{summary?.ratingDistribution?.fourStars || 0}</div>
                <div className="text-gray-400 uppercase font-bold">4 Stars</div>
              </div>
              <div className="text-center">
                <div className="font-black text-blue-500">{summary?.ratingDistribution?.threeStars || 0}</div>
                <div className="text-gray-400 uppercase font-bold">3 Stars</div>
              </div>
              <div className="text-center">
                <div className="font-black text-orange-500">{summary?.ratingDistribution?.twoStars || 0}</div>
                <div className="text-gray-400 uppercase font-bold">2 Stars</div>
              </div>
              <div className="text-center">
                <div className="font-black text-rose-500">{summary?.ratingDistribution?.oneStars || 0}</div>
                <div className="text-gray-400 uppercase font-bold">1 Star</div>
              </div>
            </div>
          </div>

          {/* Rating Trends */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rating Trends</h3>
              <p className="text-sm text-gray-600">Average rating over the last 30 days</p>
            </div>
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
              {(['rating', 'volume', 'response'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  className={`px-3 py-1 text-sm rounded-md font-medium transition-all capitalize ${chartMode === mode
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <div className="h-64">
              {prepareTrendsData() && (
                <Line data={prepareTrendsData()!} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Reviews ({filteredReviews.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'cards'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="p-6">
            {viewMode === 'cards' ? (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {review.patient ? getInitials(review.patient.name) : '?'}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-none">
                              {review.isAnonymous ? 'Verified Patient (Protected ID)' : (review.patient?.name || 'Anonymous Patient')}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.overallRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">to Dr. Williams</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {review.response && <span>• Responded</span>}
                            {review.photos && review.photos.length > 0 && (
                              <span>• {review.photos.length} photo</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-900">{review.content}</p>
                    </div>

                    {review.response && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs font-semibold">
                              {review.response?.responder ? getInitials(review.response.responder.name) : '?'}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">{review.response?.responder?.name || 'Provider'}</span>
                          <span className="text-xs text-gray-500">provider</span>
                          <span className="text-xs text-gray-500">
                            {review.response?.createdAt ? new Date(review.response.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.response?.content}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => handleVoteOnReview(review.id, true)}
                          className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{review.helpfulVotes}</span>
                        </button>
                        {review.photos && review.photos.length > 0 && (
                          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
                            <Camera className="w-4 h-4" />
                            <span className="text-sm">Show Photos ({review.photos.length})</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {review.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleModerateReview(review.id, ReviewModerationAction.APPROVE)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerateReview(review.id, ReviewModerationAction.REJECT)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        ) : review.status === 'approved' && !review.response ? (
                          <button
                            onClick={() => handleRespondToReview(review.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Respond
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleModerateReview(review.id, ReviewModerationAction.HIDE)}
                              className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors"
                              title="Hide from public view"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              Hide
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-semibold">
                                {review.patient ? getInitials(review.patient.name) : '?'}
                              </span>
                            </div>
                            <span className="font-medium">{review.patient?.name || 'Anonymous Patient'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.overallRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">{review.overallRating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{review.title || 'No title'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                            {review.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVoteOnReview(review.id, true)}
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm">{review.helpfulVotes}</span>
                            </button>
                            {!review.response && (
                              <button
                                onClick={() => handleRespondToReview(review.id)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                Respond
                              </button>
                            )}
                            <button
                              onClick={() => handleModerateReview(review.id, ReviewModerationAction.APPROVE)}
                              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                            >
                              Moderate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewDashboardPage;
