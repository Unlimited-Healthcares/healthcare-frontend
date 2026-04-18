import React from 'react';
import {
    VideoConference,
    ConferenceType,
    ConferenceStatus
} from '@/types/videoConferences';
import {
    Calendar,
    Clock,
    Users,
    Video,
    MoreHorizontal,
    Play,
    Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface VideoConferenceGridProps {
    conferences: VideoConference[];
    loading?: boolean;
    onJoin: (id: string) => void;
    onStart: (id: string) => void;
    onEnd: (id: string) => void;
    onEdit: (conference: VideoConference) => void;
    onDelete: (id: string) => void;
}

export const VideoConferenceGrid: React.FC<VideoConferenceGridProps> = ({
    conferences,
    loading,
    onJoin,
    onStart,
    onEnd,
    onEdit,
    onDelete
}) => {
    const getStatusColor = (status: ConferenceStatus) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ended': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-500 border-gray-100';
        }
    };

    const getTypeIcon = (type: ConferenceType) => {
        switch (type) {
            case 'consultation': return '🩺';
            case 'emergency': return '🚨';
            case 'group_session': return '👥';
            case 'meeting': return '📅';
            case 'training': return '🎓';
            case 'presentation': return '📊';
            case 'webinar': return '🌐';
            default: return '💬';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-[2rem] h-64 animate-pulse" />
                ))}
            </div>
        );
    }

    if (conferences.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No conferences found</h3>
                <p className="text-gray-500 mb-6">Change your filters or create a new one</p>
                <Button
                    onClick={() => onEdit(null as any)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-8 h-12 font-black shadow-lg shadow-blue-100"
                >
                    <Video className="h-5 w-5 mr-2" />
                    CREATE CONFERENCE
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {conferences.map((conference) => (
                <div
                    key={conference.id}
                    className="group bg-white rounded-[2rem] border border-gray-100 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative overflow-hidden flex flex-col h-full"
                >
                    {/* Top Status & Menu */}
                    <div className="flex justify-between items-start mb-6">
                        <Badge className={`${getStatusColor(conference.status)} rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-widest`}>
                            {conference.status}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-gray-50">
                                    <MoreHorizontal className="h-6 w-6 text-gray-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-xl p-1 min-w-[160px]">
                                <DropdownMenuItem
                                    onClick={() => onEdit(conference)}
                                    className="rounded-xl px-4 py-2.5 font-bold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Edit Conference
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(conference.id)}
                                    className="rounded-xl px-4 py-2.5 font-bold text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Main Content */}
                    <div className="mb-6 flex-1">
                        <div className="text-4xl mb-4 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                            {getTypeIcon(conference.type)}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2 line-clamp-2">
                            {conference.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-[10px]">
                            {conference.type.replace('_', ' ')}
                        </p>
                    </div>

                    {/* Details Bar */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-blue-500">
                                <Calendar className="h-3 w-3" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Date</span>
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                                {conference.scheduledStartTime ? formatDate(conference.scheduledStartTime) : 'TBD'}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-purple-500">
                                <Clock className="h-3 w-3" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Time</span>
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                                {conference.scheduledStartTime ? formatTime(conference.scheduledStartTime) : 'TBD'}
                            </span>
                        </div>
                    </div>

                    {/* Participants & Actions */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-gray-400">+{conference.maxParticipants - 3} more</span>
                        </div>

                        <div className="flex gap-2">
                            {conference.status === 'active' ? (
                                <Button
                                    onClick={() => onJoin(conference.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-2 h-11 font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
                                >
                                    <Play className="h-4 w-4 mr-2 fill-current" />
                                    JOIN
                                </Button>
                            ) : conference.status === 'scheduled' ? (
                                <Button
                                    onClick={() => onStart(conference.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-2 h-11 font-black shadow-lg shadow-green-200 transition-all active:scale-95"
                                >
                                    START
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    {/* Premium Overlay Effect */}
                    {conference.status === 'active' && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
                    )}
                </div>
            ))}
        </div>
    );
};
