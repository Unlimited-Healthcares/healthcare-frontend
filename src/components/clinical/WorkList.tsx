import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, User, Calendar, CheckCircle, Clock, Search, Filter, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { clinicalService } from '@/services/clinicalService';
import { useWorkList } from '@/hooks/useClinical';
import { toast } from 'sonner';

interface WorkListProps {
    onTaskAction?: (task: any) => void;
}

export const WorkList: React.FC<WorkListProps> = ({ onTaskAction }) => {
    const { data: workListResponse, isLoading: loading } = useWorkList();
    const tasks = workListResponse?.data || [];
    const [searchTerm, setSearchTerm] = useState('');

    const handleTaskAction = (task: any) => {
        toast.success(`Opening clinical workspace for ${task.patient?.profile?.displayName || 'Patient'}`);
        if (onTaskAction) onTaskAction(task);
    };

    const filteredTasks = tasks.filter((t: any) =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.patient?.profile?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading command center work list...</div>;

    return (
        <div className="space-y-8">
            {/* Search & Intelligence Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-xl group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Search clinical queue by patient or task identity..."
                        className="pl-14 h-14 rounded-2xl border-none bg-slate-100 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-14 rounded-2xl px-6 border-slate-200 font-bold flex items-center gap-2">
                        <Filter className="h-4 w-4" /> Filter Stack
                    </Button>
                    <Badge className="bg-blue-600 text-white border-none font-black px-4 py-1.5 h-14 rounded-2xl flex items-center justify-center">
                        {tasks.length} ACTIVE TASKS
                    </Badge>
                </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 gap-6">
                {(filteredTasks as any[]).map((task: any, idx: number) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="rounded-[2rem] md:rounded-[2.5rem] border border-slate-200/60 shadow-soft hover:shadow-premium hover:border-blue-300 transition-all bg-white group overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:bg-blue-600 transition-colors duration-500">
                                            {task.patient?.profile?.displayName?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 mb-1">{task.title || 'Clinical Task'}</h4>
                                            <p className="text-slate-500 font-medium flex items-center gap-2 text-sm italic">
                                                <User className="h-4 w-4" /> {task.patient?.profile?.displayName || 'Unknown Patient'}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <Badge className="bg-slate-50 text-slate-500 border-none font-bold text-[10px] uppercase tracking-widest px-3">
                                                    <Calendar className="h-3 w-3 mr-2 text-blue-500" />
                                                    Due: {new Date(task.dueAt).toLocaleDateString()}
                                                </Badge>
                                                <Badge className={cn(
                                                    "border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-md",
                                                    task.priority === 'urgent' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                                                )}>
                                                    {task.priority || 'Normal'} PRIORITY
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={() => handleTaskAction(task)}
                                            className="rounded-2xl h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black transition-all flex items-center gap-3 shadow-xl shadow-blue-200"
                                        >
                                            Process Order <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                {filteredTasks.length === 0 && (
                    <div className="py-20 md:py-32 text-center bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white,transparent)] -z-10" />
                        <ClipboardList className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-800">Clear Clinical Queue</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2 italic">All received tasks have been processed or redirected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
