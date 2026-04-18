import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, Microscope, FileCheck, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TestStatus {
    id: string;
    testName: string;
    status: 'sample-collected' | 'processing' | 'result-ready';
    lastUpdated: string;
}

interface TestStatusTrackerProps {
    tests: TestStatus[];
}

export const TestStatusTracker: React.FC<TestStatusTrackerProps> = ({ tests }) => {
    const steps = [
        { id: 'sample-collected', label: 'Sample Collected', icon: Beaker },
        { id: 'processing', label: 'Processing', icon: Microscope },
        { id: 'result-ready', label: 'Result Ready', icon: FileCheck },
    ];

    const getStepIndex = (status: string) => steps.findIndex(s => s.id === status);

    return (
        <div className="space-y-6">
            {tests.map((test, idx) => {
                const currentIdx = getStepIndex(test.status);
                return (
                    <Card key={test.id} className="rounded-[2.5rem] border-none shadow-soft bg-white overflow-hidden group hover:shadow-premium transition-all">
                        <CardContent className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{test.testName}</h4>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                                        Request ID: {test.id.slice(0, 8).toUpperCase()} • Last sync: {new Date(test.lastUpdated).toLocaleTimeString()}
                                    </p>
                                </div>
                                {test.status === 'result-ready' && (
                                    <Badge className="bg-emerald-500 text-white border-none font-black px-4 py-1.5 rounded-full animate-pulse">
                                        URGENT: DISCUSS WITH DOCTOR
                                    </Badge>
                                )}
                            </div>

                            <div className="relative">
                                {/* Progress Line */}
                                <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                <motion.div
                                    className="absolute top-6 left-0 h-1 bg-blue-600 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />

                                <div className="flex justify-between items-start relative z-10">
                                    {steps.map((step, sIdx) => {
                                        const isActive = sIdx <= currentIdx;
                                        const isCurrent = sIdx === currentIdx;
                                        const Icon = step.icon;

                                        return (
                                            <div key={step.id} className="flex flex-col items-center max-w-[100px] text-center">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500",
                                                        isActive
                                                            ? "bg-blue-600 border-white shadow-lg text-white"
                                                            : "bg-white border-slate-50 text-slate-200"
                                                    )}
                                                >
                                                    {isActive && sIdx < currentIdx ? (
                                                        <CheckCircle2 className="h-6 w-6" />
                                                    ) : (
                                                        <Icon className="h-6 w-6" />
                                                    )}
                                                </motion.div>
                                                <span className={cn(
                                                    "mt-4 text-[10px] font-black uppercase tracking-widest leading-tight",
                                                    isActive ? "text-slate-900" : "text-slate-300"
                                                )}>
                                                    {step.label}
                                                </span>
                                                {isCurrent && (
                                                    <motion.div
                                                        layoutId="active-indicator"
                                                        className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"
                                                        animate={{ scale: [1, 1.5, 1] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
            {tests.length === 0 && (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">No active laboratory screenings in progress.</p>
                </div>
            )}
        </div>
    );
};
