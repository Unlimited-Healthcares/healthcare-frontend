import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Calendar,
    User,
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { careTaskService, CareTask } from '@/services/careTaskService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Task {
    id: string;
    title: string;
    patientName: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    isCompleted: boolean;
}

interface DashboardTasksProps {
    tasks?: Task[];
    className?: string;
}

export const DashboardTasks: React.FC<DashboardTasksProps> = ({ className }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTasks = async () => {
            if (!user?.id) return;
            try {
                const data = await careTaskService.getCareTasks({ assignedToId: user.id });
                // Map API CareTask to UI Task
                const mappedTasks: Task[] = data.map(t => ({
                    id: t.id,
                    title: t.title,
                    patientName: t.metadata?.patientName || 'N/A',
                    dueDate: t.dueAt ? new Date(t.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP',
                    priority: t.priority === 'urgent' ? 'high' : t.priority as any,
                    isCompleted: t.status === 'completed'
                }));
                setTasks(mappedTasks);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user?.id]);

    return (
        <Card className={cn("border-none shadow-sm rounded-[32px] overflow-hidden", className)}>
            <CardHeader className="p-4 sm:p-6 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/50 space-y-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                        <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-tight text-slate-900">Current Tasks</CardTitle>
                        <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Queue</p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-2 sm:px-3"
                    onClick={() => navigate('/clinical/workflow')}
                >
                    View All
                </Button>
            </CardHeader>

            <CardContent className="p-2 space-y-1">
                {loading ? (
                    <div className="py-8 flex justify-center">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ClipboardList className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active clinical tasks</p>
                        <p className="text-[10px] text-slate-300 mt-1">Your work list is currently empty.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                    <motion.div
                        key={task.id}
                        whileHover={{ x: 4 }}
                        onClick={() => navigate(`/clinical/workspace/${task.id}`)}
                        className={cn(
                            "group p-3 sm:p-4 rounded-2xl flex items-start sm:items-center gap-3 sm:gap-4 transition-all hover:bg-slate-50 cursor-pointer",
                            task.isCompleted ? "opacity-60" : ""
                        )}
                    >
                        <button className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 mt-1 sm:mt-0",
                            task.isCompleted ? "bg-emerald-500 text-white" : "border-2 border-slate-200 text-slate-200 group-hover:border-blue-500 group-hover:text-blue-500"
                        )}>
                            {task.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                <h4 className={cn(
                                    "text-sm font-bold text-slate-900 leading-tight",
                                    task.isCompleted ? "line-through text-slate-400" : ""
                                )}>
                                    {task.title}
                                </h4>
                                <div className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border w-fit",
                                    task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" :
                                        task.priority === 'medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-blue-50 text-blue-600 border-blue-100"
                                )}>
                                    {task.priority}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-1">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{task.patientName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{task.dueDate}</span>
                                </div>
                            </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                    </motion.div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
