import React from 'react';
import {
  Video,
  Clock,
  Users,
  Calendar,
  Play,
  Square,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { VideoConference } from '@/types/videoConferences';

interface VideoConferenceListProps {
  conferences: VideoConference[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userRole: string;
  onJoin: (conferenceId: string) => void;
  onStart: (conferenceId: string) => void;
  onEnd: (conferenceId: string) => void;
  onEdit: (conference: VideoConference) => void;
  onDelete: (conferenceId: string) => void;
  onPageChange: (page: number) => void;
}

export const VideoConferenceList: React.FC<VideoConferenceListProps> = ({
  conferences,
  loading,
  error,
  pagination,
  userRole,
  onJoin,
  onStart,
  onEnd,
  onEdit,
  onDelete,
  onPageChange
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return '🩺';
      case 'meeting':
        return '👥';
      case 'emergency':
        return '🚨';
      case 'group_session':
        return '👨‍👩‍👧‍👦';
      case 'training':
        return '🎓';
      case 'presentation':
        return '📊';
      case 'webinar':
        return '🎤';
      default:
        return '📹';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'text-blue-600';
      case 'meeting':
        return 'text-green-600';
      case 'emergency':
        return 'text-red-600';
      case 'group_session':
        return 'text-purple-600';
      case 'training':
        return 'text-orange-600';
      case 'presentation':
        return 'text-indigo-600';
      case 'webinar':
        return 'text-teal-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const conferenceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (conferenceDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (conferenceDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return diffMins;
  };

  const getAvailableActions = (conference: VideoConference) => {
    const actions = [];

    if (userRole === 'patient') {
      if (conference.status === 'scheduled') {
        actions.push({ label: 'Join', action: () => onJoin(conference.id) });
      }
      if (conference.status === 'active') {
        actions.push({ label: 'Join Now', action: () => onJoin(conference.id) });
      }
      actions.push({ label: 'Edit', action: () => onEdit(conference) });
      actions.push({ label: 'Delete', action: () => onDelete(conference.id) });
    } else if (['admin', 'staff', 'doctor', 'center'].includes(userRole)) {
      if (conference.status === 'scheduled') {
        actions.push({ label: 'Start', action: () => onStart(conference.id) });
      }
      if (conference.status === 'active') {
        actions.push({ label: 'Join', action: () => onJoin(conference.id) });
        actions.push({ label: 'End', action: () => onEnd(conference.id) });
      }
      actions.push({ label: 'Edit', action: () => onEdit(conference) });
      actions.push({ label: 'Delete', action: () => onDelete(conference.id) });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Video Conferences</h3>
          <p className="text-sm text-gray-600">Loading conferences...</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-32 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Video Conferences</h3>
        </div>
        <div className="text-center py-8">
          <Video className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (conferences.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Video Conferences</h3>
        </div>
        <div className="text-center py-12">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conferences Found</h3>
          <p className="text-gray-500 mb-4">Create your first video conference to get started</p>
          <Button
            onClick={() => onEdit(null as any)} // Page handles create when onEdit receives null or no id
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Video className="h-4 w-4 mr-2" />
            Create Conference
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Video Conferences</h3>
        <p className="text-xs sm:text-sm text-gray-600">
          Showing {conferences.length} conferences
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {conferences.map((conference) => {
          const actions = getAvailableActions(conference);

          return (
            <div
              key={conference.id}
              className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Visual Status Strip */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${conference.status === 'active' ? 'bg-green-500' :
                conference.status === 'scheduled' ? 'bg-blue-500' :
                  'bg-gray-300'
                } opacity-60`} />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                      {getTypeIcon(conference.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-gray-900 text-lg sm:text-xl truncate tracking-tight">{conference.title}</h3>
                        <Badge className={`${getStatusColor(conference.status)} text-[10px] sm:text-xs font-bold rounded-full px-3`}>
                          {conference.status.charAt(0).toUpperCase() + conference.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <span className="text-blue-600 font-bold">Host: {conference.hostName}</span>
                        <span className="text-gray-300 font-bold tracking-widest">•</span>
                        <span className={`font-black ${getTypeColor(conference.type)} uppercase text-[10px] tracking-widest`}>
                          {conference.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-2 bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100/50">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-black text-gray-700">
                        {conference.scheduledStartTime ? formatDate(conference.scheduledStartTime) : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100/50">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="font-black text-gray-700">
                        {conference.scheduledStartTime ? formatTime(conference.scheduledStartTime) : 'TBD'}
                        {conference.scheduledEndTime && conference.scheduledStartTime && (
                          <span className="text-gray-400 ml-1 font-medium italic">
                            ({getDuration(conference.scheduledStartTime, conference.scheduledEndTime)}m)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100/50">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-700 font-black">
                        {conference.currentParticipants}/{conference.maxParticipants}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-end md:self-center">
                  {actions.length > 0 && (
                    <div className="flex items-center gap-2">
                      {actions.slice(0, 2).map((action, index) => (
                        <Button
                          key={index}
                          variant={action.label.includes('Join') || action.label === 'Start' ? 'default' : 'outline'}
                          size="sm"
                          onClick={action.action}
                          className={`rounded-2xl h-10 px-5 font-bold shadow-sm transition-all active:scale-95 ${action.label.includes('Join') || action.label === 'Start'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-0'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                            }`}
                        >
                          {(action.label.includes('Join') || action.label === 'Start') && <Play className="h-4 w-4 mr-2 fill-current" />}
                          {action.label === 'End' && <Square className="h-4 w-4 mr-2" />}
                          {action.label}
                        </Button>
                      ))}

                      {actions.length > 2 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-2xl border-gray-200 hover:bg-gray-50">
                              <MoreHorizontal className="h-5 w-5 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-xl p-1 min-w-[160px]">
                            {actions.slice(2).map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={action.action}
                                className={`rounded-xl px-4 py-2.5 font-semibold text-sm ${action.label === 'Delete' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}
                </div>

                {/* Overlays */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none">
                  {conference.status === 'active' && (
                    <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-green-700 uppercase italic tracking-tighter">Live</span>
                    </div>
                  )}
                  {conference.isRecording && (
                    <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-red-700 uppercase italic tracking-tighter">REC.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none"
            >
              Next
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
