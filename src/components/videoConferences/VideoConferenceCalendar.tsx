import React from 'react';
import {
    VideoConference,
    ConferenceType,
    ConferenceStatus
} from '@/types/videoConferences';
import {
    Calendar as CalendarIcon,
    Clock,
    Video,
    Play,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VideoConferenceCalendarProps {
    conferences: VideoConference[];
    loading?: boolean;
    onJoin: (id: string) => void;
    onStart: (id: string) => void;
}

export const VideoConferenceCalendar: React.FC<VideoConferenceCalendarProps> = ({
    conferences,
    loading,
    onJoin,
    onStart
}) => {
    // Group conferences by date
    const groupedConferences = conferences.reduce((groups: { [key: string]: VideoConference[] }, conference) => {
        const date = conference.scheduledStartTime ? new Date(conference.scheduledStartTime).toDateString() : 'TBD';
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(conference);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedConferences).sort((a, b) => {
        if (a === 'TBD') return 1;
        if (b === 'TBD') return -1;
        return new Date(a).getTime() - new Date(b).getTime();
    });

    const getStatusColor = (status: ConferenceStatus) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 rounded-full mb-4" />
                        <div className="space-y-4">
                            <div className="h-24 bg-gray-100 rounded-[2rem]" />
                            <div className="h-24 bg-gray-100 rounded-[2rem]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conferences.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No scheduled conferences</h3>
                <p className="text-gray-500">Your agenda is clear for now</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {sortedDates.map((date) => (
                <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50/80 backdrop-blur-md py-2 z-10 -mx-4 px-4 rounded-full">
                        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[64px]">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                                {date !== 'TBD' ? new Date(date).toLocaleDateString(undefined, { weekday: 'short' }) : '---'}
                            </span>
                            <span className="text-lg font-black text-gray-900 leading-tight">
                                {date !== 'TBD' ? new Date(date).getDate() : '??'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {date === 'TBD' ? 'To Be Determined' : new Date(date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </h2>
                            <p className="text-xs font-bold text-gray-400 font-mono tracking-widest uppercase">
                                {groupedConferences[date].length} {groupedConferences[date].length === 1 ? 'Meeting' : 'Meetings'}
                            </p>
                        </div>
                    </div>

                    {/* Timeline & Meetings */}
                    <div className="space-y-4 ml-8 border-l-2 border-blue-50 pl-8 pb-4">
                        {groupedConferences[date].map((conference) => (
                            <div
                                key={conference.id}
                                className="group relative bg-white rounded-[2rem] border border-gray-100 p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                            >
                                {/* Connector Dot */}
                                <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-400 z-10 group-hover:scale-125 transition-transform duration-300" />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-50 h-14 w-14 rounded-[1.25rem] flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-700 transition-all duration-500">
                                            <Clock className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg font-black text-gray-900 tracking-tight leading-none">
                                                    {conference.scheduledStartTime ? new Date(conference.scheduledStartTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                                </span>
                                                <Badge className={`${getStatusColor(conference.status)} rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase border-0`}>
                                                    {conference.status}
                                                </Badge>
                                            </div>
                                            <h3 className="font-bold text-gray-700 truncate max-w-[200px] sm:max-w-md">
                                                {conference.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:flex flex-col items-end mr-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Host</span>
                                            <span className="text-sm font-bold text-gray-600">{conference.hostName}</span>
                                        </div>
                                        {conference.status === 'active' ? (
                                            <Button
                                                onClick={() => onJoin(conference.id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
                                            >
                                                <Play className="h-4 w-4 mr-2 fill-current" />
                                                JOIN
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                onClick={() => onStart(conference.id)}
                                                className="rounded-2xl h-11 w-11 p-0 hover:bg-blue-50 text-blue-600 transition-all active:scale-95"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
