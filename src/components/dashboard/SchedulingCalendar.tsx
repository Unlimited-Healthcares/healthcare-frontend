import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    isToday
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Calendar as CalendarIcon,
    Clock,
    Video,
    MapPin,
    MoreVertical,
    Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'consultation' | 'follow-up' | 'lab' | 'reminder' | 'prescription' | 'surgery';
    priority: 'low' | 'medium' | 'high' | 'critical';
    location?: string;
    provider?: string;
}

export const SchedulingCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEventType, setNewEventType] = useState<'appointment' | 'reminder'>('appointment');

    // Mock events
    const [events] = useState<CalendarEvent[]>([]);

    const renderHeader = () => {
        return (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Health Schedule</h2>
                    <p className="text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-widest mt-1">Registry of clinical temporal slots</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl shadow-premium border border-slate-100 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="h-10 w-10 rounded-xl hover:bg-slate-50 flex-shrink-0"
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <span className="text-xs font-black text-slate-900 flex-1 text-center uppercase tracking-tighter min-w-[120px]">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="h-10 w-10 rounded-xl hover:bg-slate-50 flex-shrink-0"
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                    <div className="hidden sm:block w-[1px] h-6 bg-slate-100 mx-1 flex-shrink-0" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date())}
                        className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-4 h-10 rounded-xl flex-shrink-0 w-full sm:w-auto mt-1 sm:mt-0"
                    >
                        TODAY
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day, i) => (
                    <div key={i} className="text-center">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{day}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";

        const days = eachDayOfInterval({
            start: startDate,
            end: endDate
        });

        const formattedRows: React.ReactNode[] = [];
        let currentDays: React.ReactNode[] = [];

        days.forEach((day, i) => {
            const formattedDate = format(day, dateFormat);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const today = isToday(day);

            const dayEvents = events.filter(e => isSameDay(e.date, day));

            currentDays.push(
                <div
                    key={day.toString()}
                    className={`relative min-h-[100px] sm:min-h-[140px] p-2 border-t border-r border-slate-50 transition-all cursor-pointer group ${isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
                        } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                    onClick={() => setSelectedDate(day)}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold h-7 w-7 flex items-center justify-center rounded-lg ${today ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-900'
                            }`}>
                            {formattedDate}
                        </span>
                        {dayEvents.length > 0 && (
                            <Badge className="bg-slate-950 text-white border-none font-bold text-[8px] h-4 px-1.5 rounded-md scale-90">
                                {dayEvents.length}
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                            <TooltipProvider key={event.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={`p-1.5 rounded-md text-[10px] font-bold border truncate transition-transform hover:scale-[1.02] ${event.type === 'consultation' || event.type === 'follow-up'
                                            ? 'bg-blue-50 border-blue-100 text-blue-700'
                                            : event.type === 'reminder' || event.type === 'prescription'
                                                ? 'bg-amber-50 border-amber-100 text-amber-700'
                                                : event.type === 'surgery'
                                                    ? 'bg-rose-50 border-rose-100 text-rose-700'
                                                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                            }`}>
                                            {event.title}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="p-3 rounded-xl border-none shadow-xl bg-slate-950 text-white">
                                        <p className="font-bold text-xs mb-1">{event.title}</p>
                                        <p className="text-[10px] text-slate-400">{event.provider || event.location}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                        {dayEvents.length > 3 && (
                            <div className="text-[9px] font-bold text-slate-400 pl-1">
                                + {dayEvents.length - 3} more
                            </div>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-100 text-slate-400"
                    >
                        <Plus size={12} />
                    </Button>
                </div>
            );

            if ((i + 1) % 7 === 0) {
                formattedRows.push(
                    <div key={day.toString()} className="grid grid-cols-7 border-l border-slate-50 overflow-hidden">
                        {currentDays}
                    </div>
                );
                currentDays = [];
            }
        });

        return (
            <div className="bg-white border-b border-r border-slate-50 rounded-3xl overflow-hidden shadow-2xl shadow-slate-100 border border-slate-100">
                {formattedRows}
            </div>
        );
    };

    const renderSidePanel = () => {
        const selectedEvents = events.filter(e => isSameDay(e.date, selectedDate));

        return (
            <div className="space-y-6">
                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-950 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">{format(selectedDate, 'eeee')}</CardTitle>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{format(selectedDate, 'MMMM d, yyyy')}</p>
                            </div>
                            <Button size="icon" onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/40">
                                <Plus size={20} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                            {selectedEvents.length > 0 ? (
                                selectedEvents.map((event) => (
                                    <div key={event.id} className="group flex gap-4 p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 rounded-2xl transition-all">
                                        <div className={`p-3 rounded-xl flex items-center justify-center ${event.priority === 'high' ? 'bg-rose-100 text-rose-600 shadow-sm shadow-rose-200' : 'bg-blue-100 text-blue-600 shadow-sm shadow-blue-200'
                                            }`}>
                                            {event.location?.includes('Video') ? <Video size={20} /> : <CalendarIcon size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                                                    <p className="text-xs font-bold text-slate-400 mt-0.5">{event.provider || 'Medical Update'}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-slate-900">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                                    <Clock size={12} className="text-blue-500" />
                                                    10:00 AM
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                                        <MapPin size={12} className="text-blue-500" />
                                                        {event.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-4">
                                        <CalendarIcon size={32} className="text-slate-300" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900">No scheduled events</h4>
                                    <p className="text-xs text-slate-400 mt-1">Ready to book an appointment?</p>
                                    <Button variant="outline" className="mt-4 rounded-xl text-[11px] font-bold border-slate-200 hover:bg-slate-50">
                                        CREATE EVENT
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Bell className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-lg">Smart Reminders</h4>
                        </div>
                        <div className="space-y-3">
                            {([] as any[]).length > 0 ? (
                                ([] as any[]).map((rem, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <rem.icon size={16} className="text-blue-200" />
                                            <div>
                                                <div className="text-xs font-bold leading-tight">{rem.title}</div>
                                                <div className="text-[10px] text-blue-200 font-bold opacity-80 uppercase tracking-tighter mt-0.5">{rem.time}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/10 rounded-lg">
                                            <ChevronRight size={14} />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-blue-100 italic text-xs">
                                    No active health reminders.
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="w-full mt-6 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold h-10 shadow-lg shadow-blue-900/20 text-xs"
                        >
                            ADD REMINDER
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="w-full px-0 sm:px-4 py-8">
            {renderHeader()}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8">
                    {renderDays()}
                    {renderCells()}
                </div>
                <div className="xl:col-span-4">
                    {renderSidePanel()}
                </div>
            </div>

            {/* Quick Add Modal Overlay */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-950 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Quick Schedule</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="text-white hover:bg-white/10 rounded-full">
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                <Button
                                    className={`flex-1 rounded-xl h-10 font-bold transition-all ${newEventType === 'appointment' ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-500'}`}
                                    onClick={() => setNewEventType('appointment')}
                                >
                                    APPOINTMENT
                                </Button>
                                <Button
                                    className={`flex-1 rounded-xl h-10 font-bold transition-all ${newEventType === 'reminder' ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-500'}`}
                                    onClick={() => setNewEventType('reminder')}
                                >
                                    REMINDER
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder={newEventType === 'appointment' ? "Doctor Name / Reason" : "Medication / Habit"}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold opacity-60">
                                            {format(selectedDate, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-extrabold shadow-xl shadow-blue-100 tracking-tight">
                                CONFIRM AND SCHEDULE
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
