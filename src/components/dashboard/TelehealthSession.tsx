import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    PhoneOff, 
    Users, 
    MessageSquare, 
    Monitor, 
    Settings, 
    MoreVertical,
    Activity,
    Shield,
    Lock,
    LayoutGrid,
    Maximize,
    Stethoscope,
    FileText,
    Share2,
    Hand,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Participant {
    id: string;
    name: string;
    role: string;
    isLocal?: boolean;
    isMuted?: boolean;
    isVideoOff?: boolean;
    isSharing?: boolean;
    avatar?: string;
}

export function TelehealthSession({ conferenceId, onClose }: { conferenceId: string, onClose: () => void }) {
    const [participants, setParticipants] = useState<Participant[]>([
        { id: '1', name: 'You (Dr. Sarah Chen)', role: 'Doctor', isLocal: true, avatar: '/avatars/doctor.jpg' },
        { id: '2', name: 'John Doe', role: 'Patient', avatar: '/avatars/patient.jpg' },
        { id: '3', name: 'Sarah Doe', role: 'Family (Wife)', avatar: '/avatars/family.jpg' },
        { id: '4', name: 'Elena Rodriguez', role: 'Physiotherapist', avatar: '/avatars/physio.jpg' },
        { id: '5', name: 'Marcus Thorne', role: 'Cardiologist', avatar: '/avatars/specialist.jpg' },
    ]);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [activeSpeaker, setActiveSpeaker] = useState('2'); // Patient is speaking
    const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants' | 'notes'>('chat');

    const handleEndCall = () => {
        toast.info("Session Ended", {
            description: "Clinical session summary has been saved to the patient record."
        });
        onClose();
    };

    const toggleMute = () => setIsMuted(!isMuted);
    const toggleVideo = () => setIsVideoOff(!isVideoOff);
    const toggleSharing = () => {
        setIsSharing(!isSharing);
        if (!isSharing) {
            toast.success("Screen Sharing Active", {
                description: "Broadcasting DICOM viewer and clinical data to all participants."
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#050510] text-slate-100 flex flex-col font-sans">
            {/* Header / Top HUD */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                            MDT Telehealth Node <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] h-4">SECURE AES-256</Badge>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Session: {conferenceId} • MDT Recovery Board</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Link</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-white">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Video Grid */}
                <main className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
                    <div className={cn(
                        "flex-1 grid gap-4 transition-all duration-500",
                        participants.length <= 2 ? "grid-cols-2" : 
                        participants.length <= 4 ? "grid-cols-2 grid-rows-2" : 
                        "grid-cols-3 grid-rows-2"
                    )}>
                        {participants.map((p) => (
                            <div 
                                key={p.id} 
                                className={cn(
                                    "relative rounded-[2.5rem] bg-[#0A0A1F] border border-white/5 overflow-hidden group transition-all duration-300",
                                    activeSpeaker === p.id && "ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-500/10"
                                )}
                            >
                                {/* Video Placeholder / Avatar */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {(p.isLocal ? isVideoOff : p.isVideoOff) ? (
                                        <div className="text-center">
                                            <Avatar className="h-24 w-24 border-4 border-white/5 mx-auto mb-4">
                                                <AvatarImage src={p.avatar} />
                                                <AvatarFallback className="bg-slate-800 text-slate-400 font-black text-xl">{p.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Video Off</p>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black relative">
                                            <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                                            {/* Simulated Video Feed Label */}
                                            <div className="absolute top-6 left-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">Stream Active</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Participant Info Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight">{p.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.role}</p>
                                        </div>
                                        {(p.isLocal ? isMuted : p.isMuted) && (
                                            <MicOff className="h-3.5 w-3.5 text-rose-500" />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-black/40 backdrop-blur-md text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Screen Share Tile (if sharing) */}
                        {isSharing && (
                            <div className="relative rounded-[2.5rem] bg-indigo-900/20 border-2 border-indigo-500/30 overflow-hidden col-span-1 row-span-1 shadow-2xl">
                                <div className="absolute inset-0 bg-[url('/placeholder-dicom.jpg')] bg-cover bg-center opacity-40" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <Monitor className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                                        <p className="text-xs font-black uppercase text-indigo-300 tracking-widest">DICOM View Stream</p>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6">
                                    <Badge className="bg-indigo-500 text-white border-none font-black text-[10px]">LIVE SYNC</Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Control Bar */}
                    <div className="h-24 flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 bg-[#0A0A1F] p-2 rounded-[2rem] border border-white/5 shadow-2xl">
                            <Button 
                                onClick={toggleMute}
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                    "h-14 w-14 rounded-2xl transition-all",
                                    isMuted ? "bg-rose-500 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                            </Button>
                            <Button 
                                onClick={toggleVideo}
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                    "h-14 w-14 rounded-2xl transition-all",
                                    isVideoOff ? "bg-rose-500 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                            </Button>
                            <Button 
                                onClick={toggleSharing}
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                    "h-14 w-14 rounded-2xl transition-all",
                                    isSharing ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Monitor className="h-6 w-6" />
                            </Button>
                            <div className="w-px h-8 bg-white/5 mx-2" />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-14 w-14 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5"
                            >
                                <Hand className="h-6 w-6" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-14 w-14 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5"
                            >
                                <Sparkles className="h-6 w-6" />
                            </Button>
                        </div>

                        <Button 
                            onClick={handleEndCall}
                            className="h-16 px-10 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-rose-900/20 gap-3"
                        >
                            <PhoneOff className="h-5 w-5" /> End Session
                        </Button>
                    </div>
                </main>

                {/* Sidebar - Interactions / Data */}
                <aside className="w-96 border-l border-white/5 bg-[#080816]/80 backdrop-blur-3xl flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/[0.05]">
                            <button 
                                onClick={() => setSidebarTab('chat')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    sidebarTab === 'chat' ? "bg-white/5 text-white shadow-xl" : "text-slate-500"
                                )}
                            >
                                Chat
                            </button>
                            <button 
                                onClick={() => setSidebarTab('participants')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    sidebarTab === 'participants' ? "bg-white/5 text-white shadow-xl" : "text-slate-500"
                                )}
                            >
                                MDT ({participants.length})
                            </button>
                            <button 
                                onClick={() => setSidebarTab('notes')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    sidebarTab === 'notes' ? "bg-white/5 text-white shadow-xl" : "text-slate-500"
                                )}
                            >
                                Notes
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {sidebarTab === 'chat' && (
                            <div className="h-full flex flex-col p-6">
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black uppercase text-indigo-400">Dr. Sarah Chen</p>
                                            <span className="text-[8px] text-slate-600 font-bold">10:42 AM</span>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                                            <p className="text-xs font-bold leading-relaxed">I've shared the recent MRI frames. Marcus, can you review the left ventricle ejection fraction?</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black uppercase text-emerald-400">Elena Rodriguez</p>
                                            <span className="text-[8px] text-slate-600 font-bold">10:44 AM</span>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                                            <p className="text-xs font-bold leading-relaxed">ROM is improving. Patient completed today's ankle pumps with 8/10 effort.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <div className="relative">
                                        <input 
                                            placeholder="Type a clinical message..." 
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 pr-14 text-xs font-bold focus:outline-none focus:border-indigo-500/50"
                                        />
                                        <Button size="icon" className="absolute right-2 top-2 h-10 w-10 bg-indigo-600 rounded-xl">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {sidebarTab === 'participants' && (
                            <div className="p-6 space-y-4">
                                {participants.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-white/5">
                                                <AvatarImage src={p.avatar} />
                                                <AvatarFallback>{p.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-white tracking-tight">{p.name}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{p.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {p.isMuted && <MicOff className="h-3 w-3 text-rose-500" />}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sidebarTab === 'notes' && (
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Collaborative Notes</h4>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px]">AUTO-SAVING</Badge>
                                    </div>
                                    <textarea 
                                        className="w-full h-96 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-xs font-bold leading-relaxed focus:outline-none focus:border-indigo-500/50"
                                        placeholder="Record clinical consensus, plan changes, or specialist input..."
                                        defaultValue={`MDT REVIEW - APRIL 30, 2026\n\n1. Cardiac Update: Ejection fraction stable at 55%.\n2. Physio: Transition to weight-bearing exercises in 48h.\n3. Meds: Statins verified. Pharmacist notes interaction check complete.\n\nNext Review: May 07.`}
                                    />
                                </div>
                                <Button className="w-full h-16 bg-white text-black hover:bg-slate-100 rounded-[2rem] font-black uppercase text-xs tracking-widest gap-3">
                                    <FileText className="h-5 w-5" /> Commit to Medical Record
                                </Button>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
