import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, CheckCircle2, Clock, AlertCircle, ChevronRight, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { clinicalService } from '@/services/clinicalService';
import { useAdherence, useMarkAdherence } from '@/hooks/useClinical';
import { toast } from 'sonner';

export const AdherenceTracker: React.FC = () => {
    const { data: adherenceResponse, isLoading: loading } = useAdherence();
    const markAdherenceMutation = useMarkAdherence();
    const adherenceData = adherenceResponse?.data || [];

    const handleMarkTaken = async (adherenceId: string) => {
        try {
            await markAdherenceMutation.mutateAsync(adherenceId);
            toast.success('Medication marked as taken');
        } catch (error) {
            toast.error('Failed to update adherence');
        }
    };

    const calculateScore = () => {
        if (adherenceData.length === 0) return 0;
        const taken = (adherenceData as any[]).filter((a: any) => a.status === 'taken').length;
        return Math.round((taken / adherenceData.length) * 100);
    };

    if (loading) return <div>Loading adherence matrix...</div>;

    return (
        <div className="space-y-8">
            {/* Adherence Score Card */}
            <Card className="rounded-[2.5rem] border-none shadow-premium bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <CardContent className="p-8 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Medication Adherence Score</p>
                            <h2 className="text-5xl font-black">{calculateScore()}%</h2>
                        </div>
                        <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Activity className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <Progress value={calculateScore()} className="h-3 bg-white/20" indicatorClassName="bg-emerald-400" />
                    <p className="mt-4 text-sm font-medium opacity-80 italic">You're doing great! Keep up the consistency to optimize your recovery.</p>
                </CardContent>
            </Card>

            {/* Today's Schedule */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Clock className="h-6 w-6 text-indigo-500" />
                        Today's Schedule
                    </h3>
                    <Badge className="bg-slate-100 text-slate-900 border-none font-black px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">
                        {adherenceData.length} Doses
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {(adherenceData as any[]).map((task: any, idx: number) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={`rounded-[2rem] border-none shadow-soft transition-all hover:shadow-premium group ${task.status === 'taken' ? 'bg-emerald-50/50' : 'bg-white'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${task.status === 'taken' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                                <Pill className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 truncate">{task.medicationName}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(task.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {task.status === 'taken' ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] px-2 py-0.5 rounded-md">TAKEN</Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] px-2 py-0.5 rounded-md">PENDING</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {task.status !== 'taken' && (
                                            <Button
                                                onClick={() => handleMarkTaken(task.id)}
                                                className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-emerald-600 text-white font-black transition-all flex items-center gap-2 group/btn"
                                            >
                                                <span className="text-xs uppercase tracking-widest">Mark Taken</span>
                                                <CheckCircle2 className="h-4 w-4 group-hover/btn:scale-125 transition-transform" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    {adherenceData.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold italic">No active prescriptions tracked for today.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Activity = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);
