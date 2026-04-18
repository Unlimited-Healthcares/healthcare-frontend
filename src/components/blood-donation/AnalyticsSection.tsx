import React from 'react';
import { Users, Activity, Clock, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { BloodDonationAnalytics } from '../../types/blood-donation';

interface AnalyticsSectionProps {
  analytics: BloodDonationAnalytics;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ analytics }) => {
  const summaryCards = [
    {
      title: 'Total Donors',
      value: analytics.totalDonors,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Eligible Donors',
      value: analytics.eligibleDonors,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Requests',
      value: analytics.pendingRequests,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Low Stock Alerts',
      value: analytics.lowStockAlerts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-6 h-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation Trends Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Donation Trends</h3>
              <p className="text-sm text-gray-500">Monthly donations vs requests</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.donationTrends.map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                {/* Donations Bar */}
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{
                      height: `${(trend.donations / Math.max(...analytics.donationTrends.map(t => t.donations))) * 200}px`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-gray-600 mt-1">{trend.donations}</span>
                </div>
                
                {/* Requests Bar */}
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-red-500 rounded-t"
                    style={{
                      height: `${(trend.requests / Math.max(...analytics.donationTrends.map(t => t.requests))) * 200}px`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-gray-600 mt-1">{trend.requests}</span>
                </div>
                
                {/* Month Label */}
                <span className="text-xs text-gray-500 font-medium">{trend.month}</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Donations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Requests</span>
            </div>
          </div>
        </div>

        {/* Inventory Distribution Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inventory Distribution</h3>
              <p className="text-sm text-gray-500">Available units by blood type</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {analytics.inventoryDistribution.map((item, index) => {
              const maxUnits = Math.max(...analytics.inventoryDistribution.map(i => i.availableUnits));
              const percentage = (item.availableUnits / maxUnits) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.bloodType}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.availableUnits}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Donation Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.totalDonors > 0 ? Math.round((analytics.eligibleDonors / analytics.totalDonors) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Fulfillment Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.pendingRequests > 0 ? Math.round(((analytics.totalDonors - analytics.pendingRequests) / analytics.totalDonors) * 100) : 100}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900">Alert Level</p>
              <p className="text-2xl font-bold text-yellow-600">
                {analytics.lowStockAlerts > 0 ? 'High' : 'Low'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
