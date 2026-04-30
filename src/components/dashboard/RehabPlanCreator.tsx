import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dumbbell, 
    Play, 
    Plus, 
    Trash2, 
    Video, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Save,
    Send,
    ArrowUpRight,
    Search,
    Youtube,
    Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
    videoUrl: string;
}

export function RehabPlanCreator() {
    const [exercises, setExercises] = useState<Exercise[]>([
        { id: 'ex1', name: 'Ankle Pumps', sets: '3', reps: '10', videoUrl: 'https://youtube.com/watch?v=example1' },
        { id: 'ex2', name: 'Quadriceps Sets', sets: '3', reps: '10', videoUrl: 'https://youtube.com/watch?v=example2' },
        { id: 'ex3', name: 'Straight Leg Raises', sets: '2', reps: '5', videoUrl: 'https://youtube.com/watch?v=example3' }
    ]);

    const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', videoUrl: '' });

    const handleAdd = () => {
        if (!newExercise.name) return;
        setExercises([...exercises, { ...newExercise, id: Date.now().toString() }]);
        setNewExercise({ name: '', sets: '', reps: '', videoUrl: '' });
        toast.success("Exercise Added to Plan");
    };

    const handleRemove = (id: string) => {
        setExercises(exercises.filter(e => e.id !== id));
    };

    const handleDispatch = () => {
        toast.success("Home Program Dispatched", {
            description: "Patient notified via app. Video demonstrations synchronized to patient portal."
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <Dumbbell className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rehab Plan Builder</h3>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-indigo-50 text-indigo-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-indigo-100 uppercase">3 Exercises Scheduled</Badge>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Exercise List */}
                <div className="space-y-4">
                    {exercises.map((ex) => (
                        <Card key={ex.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:ring-1 hover:ring-indigo-200 transition-all group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <Play className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{ex.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{ex.sets} Sets • {ex.reps} Reps</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                            <Video className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" onClick={() => handleRemove(ex.id)} className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                        <Calendar className="h-10 w-10 text-slate-300 mb-4" />
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Daily Schedule Mode</h4>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Exercises will be pushed to patient's daily task feed</p>
                    </Card>
                </div>

                {/* Add Exercise Form */}
                <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-900 text-white p-8">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Add New Exercise</CardTitle>
                            <Badge className="bg-white/10 text-white/60 border-white/10 font-black text-[9px]">VIDEO ENRICHED</Badge>
                        </div>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Construct daily rehabilitation steps</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Exercise Name</Label>
                                <Input 
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" 
                                    placeholder="e.g. Hip Abductions" 
                                    value={newExercise.name}
                                    onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sets</Label>
                                    <Input 
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" 
                                        placeholder="3" 
                                        value={newExercise.sets}
                                        onChange={e => setNewExercise({...newExercise, sets: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reps</Label>
                                    <Input 
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" 
                                        placeholder="10" 
                                        value={newExercise.reps}
                                        onChange={e => setNewExercise({...newExercise, reps: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Video Demonstration Link (Optional)</Label>
                                <div className="relative">
                                    <Input 
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold pl-12" 
                                        placeholder="https://..." 
                                        value={newExercise.videoUrl}
                                        onChange={e => setNewExercise({...newExercise, videoUrl: e.target.value})}
                                    />
                                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <Button 
                                onClick={handleAdd}
                                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3"
                            >
                                <Plus className="h-5 w-5" /> Append Exercise
                            </Button>
                            <Button 
                                onClick={handleDispatch}
                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 gap-3"
                            >
                                <Send className="h-5 w-5" /> Dispatch Full Program
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 justify-center pt-4">
                            <Smartphone className="h-4 w-4 text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimized for Patient Mobile App</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
