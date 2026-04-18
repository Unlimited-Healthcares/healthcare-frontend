import React from 'react';
import {
  Bell,
  Settings,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Zap,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types/notifications';
import { notificationService } from '@/services/notificationService';

interface NotificationSidebarProps {
  userRole: string;
  onOpenPreferences: () => void;
  onSendTestNotification: (type: string) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
  recentNotifications: Notification[];
  typeCounts?: Record<string, number>;
}

export const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  userRole,
  onOpenPreferences,
  onSendTestNotification,
  onMarkAllRead,
  unreadCount,
  recentNotifications,
  typeCounts = {}
}) => {
  const formatTimeAgo = (date: Date | string) => {
    return notificationService.formatTimeAgo(date);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
      case 'appointment_scheduled':
      case 'request_received':
      case 'request_confirmed':
      case 'request_responded':
      case 'request_approved':
      case 'response_declined':
        return <Calendar className="h-4 w-4" />;
      case 'medical_record':
      case 'medical_record_request':
        return <FileText className="h-4 w-4" />;
      case 'system':
      case 'staff_added':
      case 'profile_update':
      case 'security_alert':
        return <Bell className="h-4 w-4" />;
      case 'referral': return <Bell className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'test_result': return <TestTube className="h-4 w-4" />;
      case 'message':
      case 'chat_message':
        return <MessageSquare className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
      case 'appointment_scheduled':
      case 'request_received':
      case 'request_confirmed':
      case 'request_responded':
      case 'request_approved':
      case 'response_declined':
        return 'text-green-600';
      case 'medical_record':
      case 'medical_record_request':
        return 'text-blue-600';
      case 'system':
      case 'staff_added':
      case 'profile_update':
      case 'security_alert':
        return 'text-purple-600';
      case 'referral': return 'text-orange-600';
      case 'payment': return 'text-gray-600';
      case 'test_result': return 'text-cyan-600';
      case 'message':
      case 'chat_message':
        return 'text-gray-600';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Group related backend types for display
  const aggregatedTypeCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};

    Object.entries(typeCounts).forEach(([type, count]) => {
      let displayType = 'system';

      if (type.startsWith('appointment') || type.startsWith('request')) {
        displayType = 'appointment';
      } else if (type.startsWith('medical_record')) {
        displayType = 'medical_record';
      } else if (type === 'referral') {
        displayType = 'referral';
      } else if (type === 'payment') {
        displayType = 'payment';
      } else if (type === 'test_result') {
        displayType = 'test_result';
      } else if (type === 'message' || type === 'chat_message') {
        displayType = 'message';
      } else if (type === 'emergency') {
        displayType = 'emergency';
      } else {
        displayType = 'system';
      }

      counts[displayType] = (counts[displayType] || 0) + count;
    });

    return counts;
  }, [typeCounts]);

  // Mock notification types for testing
  const notificationTypes = [
    { type: 'appointment', label: 'Appointments/Requests', icon: Calendar },
    { type: 'medical_record', label: 'Medical Records', icon: FileText },
    { type: 'referral', label: 'Referrals', icon: Bell },
    { type: 'test_result', label: 'Test Results', icon: TestTube },
    { type: 'payment', label: 'Payments', icon: CreditCard },
    { type: 'message', label: 'Messages', icon: MessageSquare },
    { type: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { type: 'system', label: 'System Alerts', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Actions
        </h3>
        <div className="space-y-3">
          <Button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read ({unreadCount})
          </Button>
          <Button
            onClick={onOpenPreferences}
            variant="outline"
            className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Notification Preferences
          </Button>
        </div>
      </div>

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent</h3>
          <div className="space-y-4">
            {recentNotifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 group">
                <div className={`p-2 rounded-lg bg-gray-50 ${getTypeColor(notification.type)} group-hover:bg-white transition-colors`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                  {notification.isUrgent && (
                    <Badge variant="destructive" className="text-[10px] h-4 mt-1 px-1.5 uppercase font-bold tracking-wider">
                      URGENT
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
        <div className="space-y-3">
          {notificationTypes.map((notificationType) => {
            const Icon = notificationType.icon;
            const count = aggregatedTypeCounts[notificationType.type] || 0;
            return (
              <div key={notificationType.type} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${count > 0 ? 'bg-gray-50' : 'bg-transparent'} ${getTypeColor(notificationType.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-sm ${count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {notificationType.label}
                  </span>
                </div>
                {count > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 border-none px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                    {count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional widgets based on user role */}
      {['admin', 'staff', 'doctor', 'center'].includes(userRole) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Bulk Notifications
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Notification Templates
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
              size="sm"
              onClick={() => onSendTestNotification('system')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
