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

export const DashboardTasks: React.FC<DashboardTasksProps> = ({ tasks = [], className }) => {
    // Demo tasks if none provided
    const displayTasks = tasks.length > 0 ? tasks : [
        { id: '1', title: 'Review Radiology Report', patientName: 'John Doe', dueDate: '10:30 AM', priority: 'high', isCompleted: false },
        { id: '2', title: 'Sign Death Certificate', patientName: 'N/A', dueDate: '12:00 PM', priority: 'medium', isCompleted: false },
        { id: '3', title: 'Follow-up Consultation', patientName: 'Alice Smith', dueDate: '02:00 PM', priority: 'low', isCompleted: false },
        { id: '4', title: 'Approve Lab Results', patientName: 'Bob Brown', dueDate: 'Tomorrow', priority: 'high', isCompleted: true },
    ] as Task[];

    return (
        <div className={cn("bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden", className)}>
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Current Tasks</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Clinical Queue</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">
                    View All
                </Button>
            </div>
            
            <div className="p-2 space-y-1">
                {displayTasks.map((task) => (
                    <motion.div
                        key={task.id}
                        whileHover={{ x: 4 }}
                        className={cn(
                            "group p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-slate-50",
                            task.isCompleted ? "opacity-60" : ""
                        )}
                    >
                        <button className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                            task.isCompleted ? "bg-emerald-500 text-white" : "border-2 border-slate-200 text-slate-200 group-hover:border-blue-500 group-hover:text-blue-500"
                        )}>
                            {task.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className={cn(
                                "text-sm font-bold text-slate-900 leading-tight",
                                task.isCompleted ? "line-through text-slate-400" : ""
                            )}>
                                {task.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[100px]">{task.patientName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{task.dueDate}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                            task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" :
                            task.priority === 'medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                            {task.priority}
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
