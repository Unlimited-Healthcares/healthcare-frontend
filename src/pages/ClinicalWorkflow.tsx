import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    ClipboardList,
    Stethoscope,
    Pill,
    FileCheck,
    ChevronRight,
    Activity,
    Bell,
    Search,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkList } from '@/components/clinical/WorkList';
import { ClinicalEncounterDashboard } from '@/components/medical-records/ClinicalEncounterDashboard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useEncounters, usePrescriptions, useWorkList } from '@/hooks/useClinical';
import { toast } from 'sonner';

export default function ClinicalWorkflowPage() {
    const [activeTab, setActiveTab] = useState('receive-worklist');
    const [encounterOpen, setEncounterOpen] = useState(false);
    const [selectedPatientForEncounter, setSelectedPatientForEncounter] = useState<any>(null);
    const [initialStep, setInitialStep] = useState(1);

    const { data: encountersRes } = useEncounters();
    const { data: prescriptionsRes } = usePrescriptions();
    const { data: workListRes } = useWorkList();

    const formatVal = (val: number) => val < 10 ? `0${val}` : val.toString();

    const stats = [
        { label: 'Awaiting Assessment', value: formatVal(workListRes?.data?.length || 0), color: 'text-rose-500', bg: 'bg-rose-50', tab: 'receive-worklist' },
        { label: 'Prescriptions Pending', value: formatVal(prescriptionsRes?.data?.length || 0), color: 'text-blue-500', bg: 'bg-blue-50', tab: 'e-prescription' },
        { label: 'Lab Results Ready', value: formatVal((encountersRes?.data || []).filter((e: any) => e.metadata?.labsRequested?.length > 0).length), color: 'text-emerald-500', bg: 'bg-emerald-50', tab: 'review-results' },
        { label: 'Total Synchronized', value: formatVal(encountersRes?.data?.length || 0), color: 'text-indigo-500', bg: 'bg-indigo-50', tab: 'receive-worklist' },
    ];

    return (
        <DashboardLayout>
            <div className="px-4 md:px-10 py-6 md:py-10 max-w-7xl mx-auto space-y-8 md:space-y-12">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
                    <div className="space-y-3 md:space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="p-2 md:p-3 bg-blue-600 rounded-xl md:rounded-2xl text-white shadow-lg shadow-blue-200">
                                <Activity className="h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <Badge className="bg-slate-900 text-white border-none font-black text-[8px] md:text-[10px] tracking-widest px-3 py-1 rounded-full">
                                CLINICAL COMMAND CENTER
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                            Clinical Workflow <span className="text-blue-600">Matrix</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl italic leading-relaxed">
                            Synchronize diagnostics, prescriptions, and patient care streams through a high-fidelity interface.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <Button
                            onClick={() => setEncounterOpen(true)}
                            className="h-14 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-sm md:text-lg transition-all shadow-premium flex items-center justify-center gap-3"
                        >
                            <Plus className="h-5 w-5" /> Initiate Clinical Encounter
                        </Button>
                    </div>
                </div>

                {/* Intelligence Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, i) => (
                        <Card
                            key={i}
                            onClick={() => setActiveTab(stat.tab)}
                            className="rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden group hover:shadow-premium transition-all bg-white cursor-pointer active:scale-[0.98]"
                        >
                            <CardContent className="p-6 md:p-8">
                                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className={`text-3xl md:text-4xl font-black ${stat.color}`}>{stat.value}</h3>
                                    <div
                                        className={`h-10 w-10 md:h-11 md:w-11 rounded-xl ${stat.bg} flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-sm border border-slate-100 group-hover:bg-opacity-80`}
                                    >
                                        <ChevronRight className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Tabs Workspace */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8 pb-10">
                    <div className="flex items-center justify-between bg-white p-1.5 md:p-2 rounded-[24px] md:rounded-[2.5rem] shadow-soft border border-slate-200/60 overflow-x-auto no-scrollbar">
                        <TabsList className="bg-transparent h-auto gap-1 md:gap-2 flex-nowrap px-1 md:px-2">
                            {[
                                { value: 'receive-worklist', label: 'Work List', icon: ClipboardList },
                                { value: 'document-encounter', label: 'Documents', icon: Stethoscope },
                                { value: 'e-prescription', label: 'E-Rx', icon: Pill },
                                { value: 'review-results', label: 'Results', icon: FileCheck },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="rounded-[18px] md:rounded-3xl h-10 md:h-14 px-4 md:px-8 font-black text-xs md:text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2 md:gap-3 whitespace-nowrap"
                                >
                                    <tab.icon className="h-4 w-4 md:h-5 md:w-5" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                        <TabsContent value="receive-worklist">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <WorkList onTaskAction={(task) => {
                                    if (task.patient) {
                                        setSelectedPatientForEncounter({
                                            id: task.patientId,
                                            name: task.patient.profile?.displayName || 'Patient',
                                            displayId: task.patient.displayId,
                                            userId: task.patient.userId
                                        });
                                        setInitialStep(2); // Jump to Assessment
                                    }
                                    setEncounterOpen(true);
                                }} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="document-encounter">
                            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-16 border border-slate-200/60 shadow-soft text-center space-y-6 md:space-y-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                                <div className="h-24 w-24 md:h-32 md:w-32 bg-blue-50 rounded-[2.2rem] md:rounded-[2.8rem] flex items-center justify-center mx-auto text-blue-600 shadow-inner relative z-10">
                                    <Stethoscope className="h-10 w-10 md:h-16 md:w-16" />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">Virtual Encounter Module</h2>
                                    <p className="text-slate-500 font-medium max-w-lg mx-auto italic leading-relaxed text-sm md:text-lg">
                                        Documentation for active clinical sessions and diagnostic charting.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setEncounterOpen(true)}
                                    className="h-12 md:h-16 px-10 md:px-12 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm md:text-base relative z-10 shadow-xl shadow-blue-200"
                                >
                                    Open Clinical Desktop
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="e-prescription">
                            {/* Prescription Interface fallback */}
                            <div className="bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-premium relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-center md:text-left">
                                    <div className="space-y-4 md:space-y-6">
                                        <h2 className="text-2xl md:text-4xl font-black leading-tight">Secure E-Prescription Gateway</h2>
                                        <p className="text-slate-400 font-medium max-w-md italic text-sm md:text-base">
                                            Digitally signed prescriptions optimized for pharmacy dispatch.
                                        </p>
                                        <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                                            <Badge className="bg-white/10 text-white border-white/20 font-bold px-3 py-1 text-[8px] md:text-xs">DEA CERTIFIED</Badge>
                                            <Badge className="bg-white/10 text-white border-white/20 font-bold px-3 py-1 text-[8px] md:text-xs">ENCRYPTED</Badge>
                                        </div>
                                        <div className="pt-4">
                                            <Button
                                                asChild
                                                className="h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-white text-slate-900 hover:bg-blue-50 font-black text-sm"
                                            >
                                                <Link to="/records">Manage Prescription Logs</Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="h-32 w-32 md:h-48 md:w-48 bg-white/5 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 flex items-center justify-center backdrop-blur-md">
                                            <Pill className="h-16 w-16 md:h-24 md:w-24 text-blue-400 rotate-12" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="review-results">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-16 border border-slate-200/60 shadow-soft relative overflow-hidden"
                            >
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="h-20 w-20 md:h-24 md:w-24 bg-emerald-50 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-emerald-600">
                                        <FileCheck className="h-10 w-10 md:h-12 md:w-12" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">Clinical Results Vault</h2>
                                    <p className="text-slate-500 font-medium max-w-lg italic text-sm md:text-base">
                                        Access verified laboratory diagnostics and imaging reports.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl relative z-10">
                                        <Link to="/medical-reports" className="block group/card">
                                            <Card className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 group-hover/card:bg-white group-hover/card:border-emerald-200 transition-all shadow-sm group-hover/card:shadow-premium text-left h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover/card:scale-110 transition-transform">
                                                        <FileCheck className="h-5 w-5" />
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover/card:text-emerald-500 translate-x-0 group-hover/card:translate-x-1 transition-all" />
                                                </div>
                                                <h4 className="font-bold text-sm md:text-xl text-slate-900 mb-1">Lab Reports</h4>
                                                <p className="text-[10px] md:text-sm text-slate-500 font-medium">Verified pathology and diagnostic results.</p>
                                            </Card>
                                        </Link>

                                        <Link to="/dicom-viewer" className="block group/card">
                                            <Card className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 group-hover/card:bg-white group-hover/card:border-blue-200 transition-all shadow-sm group-hover/card:shadow-premium text-left h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover/card:scale-110 transition-transform">
                                                        <Activity className="h-5 w-5" />
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover/card:text-blue-500 translate-x-0 group-hover/card:translate-x-1 transition-all" />
                                                </div>
                                                <h4 className="font-bold text-sm md:text-xl text-slate-900 mb-1">Imaging Files</h4>
                                                <p className="text-[10px] md:text-sm text-slate-500 font-medium">High-resolution DICOM and Radiology streams.</p>
                                            </Card>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </div>

            <Dialog open={encounterOpen} onOpenChange={setEncounterOpen}>
                <DialogContent className="max-w-none w-full md:max-w-6xl md:w-[95vw] h-full md:h-[90dvh] p-0 bg-gray-50 overflow-hidden border-none md:rounded-[3rem] shadow-none md:shadow-2xl">
                    <ClinicalEncounterDashboard
                        patient={selectedPatientForEncounter}
                        initialStep={initialStep}
                        onCancel={() => {
                            setEncounterOpen(false);
                            setSelectedPatientForEncounter(null);
                            setInitialStep(1);
                        }}
                        onComplete={() => {
                            setEncounterOpen(false);
                            setSelectedPatientForEncounter(null);
                            setInitialStep(1);
                            toast.success('Clinical document synchronized successfully');
                        }}
                    />
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
