export type NotificationType = 
  | 'medical_record_request'  // For all record request related notifications
  | 'medical_record_access'   // For when records are accessed
  | 'record_share_expiring'   // For when record sharing is about to expire
  | 'appointment'             // For appointment related notifications 
  | 'message'                 // For message notifications
  | 'system'                  // For system notifications
  | 'referral'                // For referral notifications
  | 'test_result';            // For test result notifications

export interface Notification {
  id: string;
  user_id: string | null;
  center_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

// Helper to get notification icon based on type
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'medical_record_request':
      return 'file-text'; // Document icon
    case 'medical_record_access':
      return 'shield'; // Shield icon for security/access
    case 'record_share_expiring':
      return 'clock'; // Clock icon for expiration
    case 'appointment':
      return 'calendar';
    case 'message':
      return 'message-circle';
    case 'system':
      return 'info';
    case 'referral':
      return 'git-pull-request'; // Similar to a referral flow
    case 'test_result':
      return 'clipboard-check';
    default:
      return 'bell';
  }
};

// Helper to get notification color based on type
export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'medical_record_request':
      return 'text-blue-500';
    case 'medical_record_access':
      return 'text-teal-500';
    case 'record_share_expiring':
      return 'text-amber-500';
    case 'appointment':
      return 'text-purple-500';
    case 'message':
      return 'text-green-500';
    case 'system':
      return 'text-gray-500';
    case 'referral':
      return 'text-indigo-500';
    case 'test_result':
      return 'text-orange-500';
    default:
      return 'text-blue-500';
  }
}; 