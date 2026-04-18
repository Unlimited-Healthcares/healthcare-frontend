import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ReferralAnalytics as ReferralAnalyticsType } from '../../services/referralService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReferralAnalyticsProps {
  analytics: ReferralAnalyticsType;
  loading?: boolean;
}

const ReferralAnalytics: React.FC<ReferralAnalyticsProps> = ({ analytics, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const referralsByType = analytics?.referralsByType || [];
  const referralsByStatus = analytics?.referralsByStatus || [];

  // If no data available, show empty state
  if (referralsByType.length === 0 && referralsByStatus.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-80">
          <p className="text-gray-500">No referral analytics data available yet.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-80">
          <p className="text-gray-500">No status distribution data available yet.</p>
        </div>
      </div>
    );
  }

  // Prepare data for Referrals by Type bar chart
  const typeChartData = {
    labels: referralsByType.map(item =>
      item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Number of Referrals',
        data: referralsByType.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Yellow
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(6, 182, 212, 0.8)',    // Cyan
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(6, 182, 212, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Status Distribution doughnut chart
  const statusChartData = {
    labels: referralsByStatus.map(item =>
      item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        data: referralsByStatus.map(item => item.count),
        backgroundColor: [
          '#FCD34D', // Yellow for Pending
          '#10B981', // Green for Accepted
          '#EF4444', // Red for Rejected
          '#3B82F6', // Blue for Completed
          '#8B5CF6', // Purple for Canceled
          '#F59E0B', // Orange for Expired
        ],
        borderColor: [
          '#F59E0B',
          '#059669',
          '#DC2626',
          '#2563EB',
          '#7C3AED',
          '#D97706',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Referrals by Category',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Status Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Referrals by Type Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-80">
          <Bar data={typeChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Status Distribution Doughnut Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-80">
          <Doughnut data={statusChartData} options={doughnutChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ReferralAnalytics;
