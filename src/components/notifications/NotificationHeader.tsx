import React from 'react';
import { Bell, Grid, List, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  onViewChange: (view: 'list' | 'calendar' | 'grid') => void;
  currentView: 'list' | 'calendar' | 'grid';
  unreadCount: number;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
  onOpenPreferences: () => void;
  isConnected?: boolean;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  onViewChange,
  currentView,
  unreadCount,
  onMarkAllRead,
  onDeleteAll,
  onOpenPreferences,
  isConnected = false
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4 sm:mb-6 md:mb-8">
      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">Notifications</h1>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs sm:text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Stay updated with your healthcare notifications</p>
        </div>

        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPreferences}
            className="flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Preferences</span>
            <span className="sm:hidden">Prefs</span>
          </Button>
          <Button
            size="sm"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Mark All Read</span>
            <span className="sm:hidden">Mark Read</span>
            <span>({unreadCount})</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteAll}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Clear All</span>
            <span className="xs:hidden">Clear</span>
          </Button>
        </div>
      </div>

      {/* View Toggle Row */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start overflow-x-auto">
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('list')}
          className={`h-8 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${currentView === 'list'
            ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600'
            : 'text-gray-700 hover:bg-gray-200'
            }`}
        >
          <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">List</span>
        </Button>
        <Button
          variant={currentView === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('grid')}
          className={`h-8 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${currentView === 'grid'
            ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600'
            : 'text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Grid className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Grid</span>
        </Button>
        <Button
          variant={currentView === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('calendar')}
          className={`h-8 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${currentView === 'calendar'
            ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600'
            : 'text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Calendar</span>
        </Button>
      </div>
    </div>
  );
};
