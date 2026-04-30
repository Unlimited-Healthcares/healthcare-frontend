import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Image as ImageIcon, 
    User, 
    Activity, 
    Clock, 
    Video, 
    CheckCircle2, 
    ArrowLeft,
    AlertTriangle,
    Upload,
    Link as LinkIcon,
    Camera,
    Mic,
    ShieldCheck,
    FileText,
    ChevronRight,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VideoConferenceRoom } from '@/components/videoConferences/VideoConferenceRoom';
import { DicomViewer } from './DicomViewer';

interface ImagingMissionDashboardProps {
    order: any;
    onBack: () => void;
    onComplete: () => void;
}

export function ImagingMissionDashboard({ order, onBack, onComplete }: ImagingMissionDashboardProps) {
    const [acquisitionStatus, setAcquisitionStatus] = useState<'pending' | 'started' | 'processing' | 'completed'>('pending');
    const [examDetails, setExamDetails] = useState({
        technique: '',
        contrast: 'None',
        findings: ''
    });
    const [isMdtCallOpen, setIsMdtCallOpen] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    const handleUpdateStatus = (status: 'started' | 'processing' | 'completed') => {
        setAcquisitionStatus(status);
        toast.success(`Acquisition status: ${status.toUpperCase()}`);
    };

    const handleFinalize = () => {
        toast.success("Imaging mission finalized. Report sent to referring doctor and cardiologist.");
        onComplete();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Imaging Mission: {order.id}</h1>
                            <Badge className={`${order.priority === 'Stroke' || order.priority === 'Trauma' ? 'bg-red-500' : 'bg-indigo-500'} text-white border-none px-3`}>
                                {order.priority.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Technician: Unit 105 • {order.exam}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition Status</p>
                        <p className={`text-sm font-black uppercase ${acquisitionStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {acquisitionStatus}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column: Patient & Context */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" /> Patient Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-black text-slate-900 uppercase">{order.patient}</p>
                                <Badge variant="outline" className="border-slate-200 text-slate-500 font-black text-[9px]">ID: {order.id.slice(-6)}</Badge>
                            </div>
                            
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Indication</p>
                                <p className="text-xs font-bold text-slate-700">"Patient presenting with acute {order.priority.toLowerCase()} symptoms. Rule out focal lesions."</p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100">
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Special Precautions
                                    </p>
                                    <p className="text-xs font-bold text-slate-700">None Reported / Standard Protocol</p>
                                </div>
                                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> DICOM Auto-Sync
                                    </p>
                                    <p className="text-xs font-bold text-slate-700">Enabled for Specialist Review</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Acquisition Controls */}
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Acquisition Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <Button 
                                    onClick={() => handleUpdateStatus('started')}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${acquisitionStatus === 'started' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <Clock className="h-4 w-4" /> Start Acquisition
                                </Button>
                                <Button 
                                    onClick={() => handleUpdateStatus('processing')}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${acquisitionStatus === 'processing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <Activity className="h-4 w-4" /> Image Processing
                                </Button>
                                <Button 
                                    onClick={() => handleUpdateStatus('completed')}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${acquisitionStatus === 'completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Acquisition Complete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Imaging & Collaboration */}
                <div className="md:col-span-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Technique & Logs */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" /> Acquisition Logs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Technique / Protocol</Label>
                                        <Input 
                                            value={examDetails.technique}
                                            onChange={e => setExamDetails({...examDetails, technique: e.target.value})}
                                            placeholder="e.g. Standard PA View, 120kVp"
                                            className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contrast Media</Label>
                                        <Input 
                                            value={examDetails.contrast}
                                            onChange={e => setExamDetails({...examDetails, contrast: e.target.value})}
                                            placeholder="e.g. None or Omnipaque 350"
                                            className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preliminary Technician Observations</Label>
                                        <Textarea 
                                            value={examDetails.findings}
                                            onChange={e => setExamDetails({...examDetails, findings: e.target.value})}
                                            placeholder="Add clinical notes on image quality or patient positioning..."
                                            className="rounded-xl bg-slate-50 border-slate-100 min-h-[100px] font-bold p-4"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1 rounded-xl h-12 border-slate-100 gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                                        <Upload className="h-4 w-4" /> Upload DICOM
                                    </Button>
                                    <Button variant="outline" className="flex-1 rounded-xl h-12 border-slate-100 gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                                        <LinkIcon className="h-4 w-4" /> PACS Link
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* MDT & Collaboration */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white h-full">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <Video className="h-4 w-4 text-rose-500" /> Specialist Collaboration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex flex-col items-center justify-center py-8 text-center bg-rose-50/30 rounded-[2.5rem] border border-rose-100/50">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-lg shadow-rose-100 mb-4">
                                            <Users className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">MDT Multi-Person Call</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-6">
                                            Discuss findings or positioning with Cardiologist, Orthopaedic, and Patient.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => setIsMdtCallOpen(true)}
                                        className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-rose-100"
                                    >
                                        <Video className="h-5 w-5" /> Start MDT Video Room
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="rounded-xl h-10 text-[9px] font-black uppercase border-rose-100 text-rose-600" onClick={() => toast.success("Cardiologist Invited")}>Invite Cardiologist</Button>
                                        <Button variant="outline" className="rounded-xl h-10 text-[9px] font-black uppercase border-rose-100 text-rose-600" onClick={() => toast.success("Radiologist Invited")}>Invite Radiologist</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Integrated DICOM Viewer */}
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white min-h-[400px]">
                        <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-indigo-400" /> Integrated DICOM Viewer
                            </CardTitle>
                            <Badge className="bg-indigo-500 text-white font-black text-[9px]">DICOM COMPATIBLE</Badge>
                        </CardHeader>
                        <CardContent className="p-0 bg-black min-h-[400px] flex items-center justify-center relative">
                            {acquisitionStatus === 'completed' || acquisitionStatus === 'processing' ? (
                                <div className="w-full h-full p-4">
                                    <div className="w-full aspect-video bg-slate-800 rounded-2xl overflow-hidden relative group">
                                        <img 
                                            src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1000" 
                                            alt="X-Ray Scan" 
                                            className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-80 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4">
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Processing Preview</p>
                                                    <p className="text-xs font-bold text-white">Instance 1: AP Thorax View</p>
                                                </div>
                                                <Button size="sm" className="h-8 bg-indigo-600 text-white rounded-lg">View Full DICOM</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto text-white/20">
                                        <ImageIcon className="h-10 w-10" />
                                    </div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Awaiting Acquisition Stream...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-30 shadow-2xl">
                <div className="healthcare-container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Duration</p>
                            <p className="text-sm font-black text-slate-900">12:45</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
                        {acquisitionStatus === 'completed' ? (
                            <Button 
                                onClick={handleFinalize}
                                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-200 gap-3"
                            >
                                <CheckCircle2 className="h-5 w-5" /> Finalize & Dispatch Report
                            </Button>
                        ) : (
                            <Button 
                                disabled
                                className="w-full h-14 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-2 border-slate-200"
                            >
                                {acquisitionStatus === 'pending' ? 'Ready to Start' : 'Processing Image Data...'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* MDT Video Call Overlay */}
            <Dialog open={isMdtCallOpen} onOpenChange={setIsMdtCallOpen}>
                <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-slate-950 border-none rounded-[40px]">
                    <VideoConferenceRoom 
                        conference={{
                            id: 'imaging-' + order.id,
                            title: `IMAGING MDT: ${order.exam} - ${order.patient}`,
                            type: 'consultation',
                            status: 'active',
                            participants: [
                                { id: 'p1', conferenceId: 'imaging-' + order.id, userId: 'radiographer', userName: 'Radiographer Unit 105', userRole: 'doctor', isHost: true, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' },
                                { id: 'p2', conferenceId: 'imaging-' + order.id, userId: 'referrer', userName: 'Referrer: Dr. Smith', userRole: 'doctor', isHost: false, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' },
                                { id: 'p3', conferenceId: 'imaging-' + order.id, userId: 'specialist', userName: 'Specialist: Cardiologist', userRole: 'doctor', isHost: false, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' }
                            ],
                            hostId: 'radiographer',
                            hostName: 'Radiographer Unit 105',
                            maxParticipants: 10,
                            currentParticipants: 3,
                            isRecordingEnabled: true,
                            isRecording: true,
                            waitingRoomEnabled: false,
                            autoAdmitParticipants: true,
                            muteParticipantsOnEntry: false,
                            provider: 'webrtc',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }}
                        ws={null}
                        onLeave={() => setIsMdtCallOpen(false)}
                        userId="radiographer"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Users({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
