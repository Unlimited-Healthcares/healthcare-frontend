import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    Activity,
    Pill,
    Beaker,
    FileText,
    CreditCard,
    MessageSquare,
    ArrowRight,
    ChevronRight,
    ShieldCheck,
    Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdherenceTracker } from '@/components/clinical/AdherenceTracker';
import { TestStatusTracker } from '@/components/clinical/TestStatusTracker';
import { usePrescriptions, useEncounters } from '@/hooks/useClinical';
import { useAuth } from '@/hooks/useAuth';

export default function PatientClinicalDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'adherence';
    const [activeTab, setActiveTab] = useState(initialTab);

    const { user } = useAuth();
    const { data: prescriptionsRes } = usePrescriptions();
    const { data: encountersRes } = useEncounters();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setSearchParams({ tab: val });
    };

    const realTests = (encountersRes?.data || [])
        .filter((e: any) => e.metadata?.labsRequested?.length > 0)
        .flatMap((e: any) => e.metadata.labsRequested.map((lab: string, i: number) => ({
            id: `${e.id}-lab-${i}`,
            testName: lab,
            status: 'processing' as const,
            lastUpdated: e.updatedAt || e.createdAt
        })));

    return (
        <DashboardLayout>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 pb-32">
                {/* Patient Welcome Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                                <Activity className="h-8 w-8" />
                            </div>
                            <Badge className="bg-indigo-50 text-indigo-700 border-none font-black text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full">
                                YOUR CLINICAL HUB
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                            Recovery <span className="text-indigo-600">Companion</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-xl italic">
                            Track your laboratory screenings, manage medications, and coordinate with your clinical team in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all shadow-xl shadow-indigo-100 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" /> Pay Medical Bills
                        </Button>
                    </div>
                </div>

                {/* Global Security Disclaimer */}
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex items-start gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <ShieldCheck className="h-10 w-10 text-amber-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest mb-1">Clinical Protocol Notice</h4>
                        <p className="text-sm text-amber-800 font-medium italic leading-relaxed">
                            Preliminary images and reports are for reference only. Please schedule a consultation with your doctor to discuss results and clinical implications before taking action.
                        </p>
                    </div>
                </div>

                {/* Main Experience Matrix */}
                <Tabs value={activeTab} className="space-y-12" onValueChange={handleTabChange}>
                    <div className="flex items-center justify-start lg:justify-center overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                        <TabsList className="bg-slate-100 p-1.5 rounded-[2rem] h-auto gap-1 border border-slate-200/50 flex-nowrap shrink-0">
                            {[
                                { value: 'adherence', label: 'Medication Tracker', icon: Pill },
                                { value: 'test-status', label: 'Laboratory Status', icon: Beaker },
                                { value: 'reports', label: 'Prescriptions & Records', icon: FileText },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="rounded-xl h-12 px-5 sm:h-14 sm:px-8 font-black text-[11px] sm:text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-premium transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                                >
                                    <tab.icon className="h-5 w-5" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                        <TabsContent value="adherence" className="outline-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-12">
                                        <AdherenceTracker />
                                    </div>
                                </div>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="test-status" className="outline-none">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <TestStatusTracker tests={realTests} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="reports" className="outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="rounded-[3rem] border-none shadow-soft bg-white group hover:shadow-premium transition-all overflow-hidden">
                                    <CardContent className="p-10">
                                        <div className="h-20 w-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mb-8">
                                            <Pill className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Prescription Vault</h3>
                                        <p className="text-slate-500 font-medium italic mb-8">View active and archived medication orders digitally signed by your providers.</p>
                                        <Button variant="ghost" className="p-0 h-auto font-black text-indigo-600 hover:text-indigo-700 hover:bg-transparent flex items-center gap-2">
                                            Access Pharmacy Payload <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card className="rounded-[3rem] border-none shadow-soft bg-white group hover:shadow-premium transition-all overflow-hidden">
                                    <CardContent className="p-10">
                                        <div className="h-20 w-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-500 mb-8">
                                            <FileText className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Discharge Summary</h3>
                                        <p className="text-slate-500 font-medium italic mb-8">Receive and store your professional discharge packages and recovery summaries.</p>
                                        <Button variant="ghost" className="p-0 h-auto font-black text-indigo-600 hover:text-indigo-700 hover:bg-transparent flex items-center gap-2">
                                            Download Summary Package <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>

                {/* Feedback Section */}
                <div className="pt-20 border-t border-slate-100 flex flex-col items-center text-center space-y-6">
                    <div className="flex -space-x-4 mb-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-300">
                                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                            </div>
                        ))}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">How was your experience today?</h3>
                    <p className="text-slate-500 font-medium italic">Your feedback helps us optimize the clinical stream for all patients.</p>
                    <Button className="h-14 px-12 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-black transition-all">
                        Rate Clinical Service
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
