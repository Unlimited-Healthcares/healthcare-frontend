import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Truck,
  Shield,
  Phone,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmergencyAlert, AmbulanceRequest, ViralReport } from '@/types/emergency';

interface EmergencySidebarProps {
  recentAlerts: EmergencyAlert[];
  recentAmbulanceRequests: AmbulanceRequest[];
  recentViralReports: ViralReport[];
  onQuickAction: (action: string) => void;
}

export const EmergencySidebar: React.FC<EmergencySidebarProps> = ({
  recentAlerts,
  recentAmbulanceRequests,
  recentViralReports,
  onQuickAction
}) => {
  const navigate = useNavigate();
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800';
      case 'responding':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-teal-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => onQuickAction('sos')}
            className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Send SOS Alert
          </Button>
          <Button
            onClick={() => onQuickAction('ambulance')}
            className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Truck className="h-4 w-4 mr-2" />
            Request Ambulance
          </Button>
          <Button
            onClick={() => onQuickAction('report')}
            className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            Submit Viral Report
          </Button>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Recent Alerts
            <Badge variant="secondary" className="ml-auto">
              {recentAlerts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent alerts</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {alert.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(alert.createdAt.toString())}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {alert.description || 'Emergency alert triggered'}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(alert.status)} text-xs`}>
                      {alert.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {alert.address || 'GPS Location'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Ambulance Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5 text-orange-600" />
            Recent Requests
            <Badge variant="secondary" className="ml-auto">
              {recentAmbulanceRequests.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAmbulanceRequests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent requests</p>
          ) : (
            <div className="space-y-3">
              {recentAmbulanceRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {request.requestNumber}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(request.createdAt.toString())}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {request.patientName} - {request.medicalCondition}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getPriorityColor(request.priority)} text-xs`}>
                      {request.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(request.status)} text-xs`}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Viral Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-purple-600" />
            Recent Reports
            <Badge variant="secondary" className="ml-auto">
              {recentViralReports.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentViralReports.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent reports</p>
          ) : (
            <div className="space-y-3">
              {recentViralReports.slice(0, 3).map((report) => (
                <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {report.diseaseType}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(report.createdAt.toString())}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {report.affectedCount} affected • {report.symptoms.length} symptoms
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(report.status)} text-xs`}>
                      {report.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {report.locationAddress || 'Location N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-green-600" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="flex items-center justify-between p-2 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors shadow-sm border border-red-100"
            onClick={() => navigate('/centers?type=ambulance')}
          >
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Ambulance</span>
            </div>
            <span className="text-xs font-bold text-red-600 uppercase">View Vendors</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Poison Control</span>
            </div>
            <span className="text-sm font-mono text-blue-600">1-800-222-1222</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Health Department</span>
            </div>
            <span className="text-sm font-mono text-green-600">1-800-HEALTH</span>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Status</span>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">GPS Tracking</span>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Notifications</span>
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Sync</span>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
