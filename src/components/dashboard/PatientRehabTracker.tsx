import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Dumbbell, 
    CheckCircle2, 
    Clock, 
    Video, 
    ChevronRight, 
    ArrowRight,
    Play,
    Info,
    TrendingUp,
    Activity,
    Award
} from 'lucide-react';
import { rehabService, RehabPlan, RehabExercise } from '@/services/rehabService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function PatientRehabTracker({ patientId }: { patientId: string }) {
    const [plans, setPlans] = useState<RehabPlan[]>([]);
    const [activePlan, setActivePlan] = useState<RehabPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [completedToday, setCompletedToday] = useState<string[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await rehabService.getPatientPlans(patientId);
                setPlans(data);
                if (data.length > 0) {
                    setActivePlan(data[0]);
                    // Extract completed today from logs if any
                    const today = new Date().toISOString().split('T')[0];
                    const done = data[0].completionLogs?.filter((l: any) => l.date.startsWith(today) && l.completed).map((l: any) => l.exerciseName) || [];
                    setCompletedToday(done);
                }
            } catch (error) {
                console.error("Failed to fetch rehab plans:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, [patientId]);

    const handleLogProgress = async (exercise: RehabExercise) => {
        if (!activePlan) return;
        
        try {
            await rehabService.logProgress(activePlan.id, {
                exerciseName: exercise.name,
                completed: true
            });
            setCompletedToday(prev => [...prev, exercise.name]);
            toast.success("Progress Recorded", {
                description: `You've completed ${exercise.name}. Great job!`
            });
        } catch (error) {
            toast.error("Sync Failed", {
                description: "Could not save your progress to the clinical record."
            });
        }
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold uppercase animate-pulse">Synchronizing Care Plan...</div>;

    if (!activePlan) return (
        <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] p-12 bg-slate-50/50 flex flex-col items-center justify-center text-center">
            <Dumbbell className="h-12 w-12 text-slate-300 mb-4" />
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Rehab Program</h4>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Your physiotherapist hasn't assigned a daily program yet.</p>
        </Card>
    );

    const progress = Math.round((completedToday.length / activePlan.exercises.length) * 100);

    return (
        <div className="space-y-6">
            {/* Header / Summary */}
            <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Badge className="bg-white/10 text-white border-none font-black text-[10px] tracking-widest px-4 py-1.5 uppercase">Daily Recovery Hub</Badge>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Plan: {activePlan.title}</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">Today's Progress</h2>
                            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">{completedToday.length} of {activePlan.exercises.length} exercises completed</p>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-black">{progress}%</p>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Completion Index</p>
                        </div>
                    </div>
                    <div className="mt-8 h-3 w-full bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="grid gap-4">
                {activePlan.exercises.map((ex, i) => {
                    const isDone = completedToday.includes(ex.name);
                    return (
                        <Card 
                            key={i} 
                            className={cn(
                                "border-none shadow-sm rounded-[2.5rem] overflow-hidden transition-all group",
                                isDone ? "bg-emerald-50/50 opacity-60" : "bg-white hover:shadow-xl hover:-translate-y-1"
                            )}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-colors",
                                            isDone ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                                        )}>
                                            {isDone ? <CheckCircle2 className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{ex.name}</h3>
                                                {ex.videoUrl && (
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase h-4 py-0 flex items-center gap-1 border-indigo-100 text-indigo-500">
                                                        <Video className="h-2.5 w-2.5" /> Video Demo
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Award className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ex.sets} Sets × {ex.reps} Reps</span>
                                                </div>
                                                {ex.instructions && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Info className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{ex.instructions}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {ex.videoUrl && (
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                <Video className="h-6 w-6" />
                                            </Button>
                                        )}
                                        {!isDone ? (
                                            <Button 
                                                onClick={() => handleLogProgress(ex)}
                                                className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-slate-100"
                                            >
                                                Mark Complete
                                            </Button>
                                        ) : (
                                            <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] px-6 py-2 rounded-2xl">FINISHED</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Achievement / Stats Section */}
            <div className="grid grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-[32px] p-8 bg-white overflow-hidden relative">
                    <div className="absolute top-4 right-4 text-indigo-500/10">
                        <TrendingUp className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Consistency Streak</p>
                    <p className="text-3xl font-black text-slate-900">12 Days</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Top 5% of Patients</span>
                    </div>
                </Card>
                <Card className="border-none shadow-sm rounded-[32px] p-8 bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-4 right-4 text-white/5">
                        <Activity className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Total Effort Index</p>
                    <p className="text-3xl font-black text-white">8.4/10</p>
                    <div className="mt-4 flex items-center gap-2 text-indigo-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Improving Weekly</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
