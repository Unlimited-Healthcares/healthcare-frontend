import React from 'react';
import {
    Bell,
    X,
    CheckCircle2,
    Calendar as CalendarIcon,
    AlertCircle,
    MessageSquare,
    Clock,
    ArrowRight,
    ShieldAlert,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationsContext();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment': return <CalendarIcon className="h-4 w-4 text-blue-500" />;
            case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'warning': return <ShieldAlert className="h-4 w-4 text-amber-500" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-rose-500" />;
            case 'message': return <MessageSquare className="h-4 w-4 text-violet-500" />;
            default: return <Bell className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-out border-l border-slate-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header with improved Safe Area support */}
                    <div className="pt-10 sm:pt-0 border-b border-slate-100 bg-slate-50/50">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                                    <Bell className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Activity Center</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className="bg-blue-100 text-blue-600 border-none font-bold text-[10px] px-2 h-5">
                                            {unreadCount}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Healthcare Notifications</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 text-slate-400">
                                <X size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-50 bg-white">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 p-0 h-auto"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 p-0 h-auto flex items-center gap-1"
                            onClick={() => {
                                navigate('/settings');
                                onClose();
                            }}
                        >
                            <Settings size={12} />
                            Preferences
                        </Button>
                    </div>

                    {/* Notifications List */}
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`group relative p-4 rounded-2xl transition-all duration-300 border ${n.isRead
                                            ? 'bg-white border-slate-100 hover:border-blue-100'
                                            : 'bg-blue-50/40 border-blue-100 shadow-sm shadow-blue-100/50'
                                            }`}
                                        onClick={() => !n.isRead && markAsRead(n.id)}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`mt-1 h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center border ${n.isRead ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-100 shadow-sm'
                                                }`}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className={`text-sm font-bold truncate leading-tight ${n.isRead ? 'text-slate-700' : 'text-slate-900 font-extrabold'}`}>
                                                        {n.title}
                                                    </h3>
                                                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-blue-600 shadow-lg shadow-blue-400 mt-1.5 flex-shrink-0" />}
                                                </div>
                                                <p className={`text-xs leading-relaxed mb-3 ${n.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        <Clock size={10} />
                                                        {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                                                    </div>
                                                    {n.link && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-[10px] font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg group"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(n.link!);
                                                            }}
                                                        >
                                                            OPEN <ArrowRight size={10} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                    <div className="p-6 bg-slate-100 rounded-full mb-4">
                                        <Bell size={40} className="text-slate-400" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900">All caught up!</h4>
                                    <p className="text-sm text-slate-500 mt-1 max-w-[200px]">You don't have any notifications at the moment.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer with Safe Area support */}
                    <div className="p-6 pb-safe sm:pb-8 border-t border-slate-100 bg-slate-50/30">
                        <Button
                            className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-12 font-bold shadow-xl shadow-slate-200 group"
                            onClick={() => {
                                navigate('/notifications');
                                onClose();
                            }}
                        >
                            View Full History
                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
