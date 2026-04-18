import React from 'react';
import {
  Bell,
  CheckCircle,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  FileText,
  CreditCard,
  TestTube,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Notification } from '@/types/notifications';
import { notificationService } from '@/services/notificationService';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  onPageChange: (page: number) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  pagination,
  onMarkAsRead,
  onDelete,
  onPageChange
}) => {
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

  const getPriorityColor = (isUrgent: boolean, type: string) => {
    if (isUrgent || type === 'emergency') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    return notificationService.formatTimeAgo(date);
  };

  const getAvailableActions = (notification: Notification) => {
    const actions = [];

    if (!notification.isRead) {
      actions.push({
        label: 'Mark as Read',
        action: () => onMarkAsRead(notification.id),
        icon: CheckCircle
      });
    }

    actions.push({
      label: 'Delete',
      action: () => onDelete(notification.id),
      icon: Trash2
    });

    return actions;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 overflow-hidden">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-600">Loading notifications...</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 overflow-hidden">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 overflow-hidden">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <p className="text-sm text-gray-600">
          Showing {notifications.length} notifications
        </p>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const actions = getAvailableActions(notification);
          const borderColor = notification.isUrgent || notification.type === 'emergency' ? 'border-l-red-500' :
            !notification.isRead ? 'border-l-blue-500' : 'border-l-gray-300';

          return (
            <div
              key={notification.id}
              className={`bg-gray-50 rounded-lg border-l-4 ${borderColor} p-4 hover:shadow-md transition-all duration-200 ${!notification.isRead ? 'bg-blue-50' : ''
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Notification Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>

                  {/* Notification Details */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.isUrgent, notification.type)}`}>
                        {notification.isUrgent ? 'URGENT' : notification.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(notification.deliveryStatus)}`}>
                        {notification.deliveryStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>

                  {/* Additional Data */}
                  {notification.data && Object.keys(notification.data).length > 0 && (
                    <div className="bg-gray-100 rounded p-2 mb-3 max-w-full overflow-hidden">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all overflow-x-hidden">
                        {JSON.stringify(notification.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      {actions.slice(0, 2).map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={action.action}
                            className="text-xs h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {action.label}
                          </Button>
                        );
                      })}

                      {actions.length > 2 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.slice(2).map((action, index) => {
                              const Icon = action.icon;
                              return (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={action.action}
                                  className="flex items-center gap-2"
                                >
                                  <Icon className="h-4 w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
