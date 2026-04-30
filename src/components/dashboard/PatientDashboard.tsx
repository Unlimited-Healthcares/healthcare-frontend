import { AppointmentsCard } from "@/components/dashboard/AppointmentsCard";
import { HealthRecordsCard } from "@/components/dashboard/HealthRecordsCard";
import { HealthMonitoringCard } from "@/components/dashboard/HealthMonitoringCard";
import { EmergencyCard, CommunityCard } from "@/components/dashboard/EmergencyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentScheduler } from "./AppointmentScheduler";
import { SchedulingCalendar } from "./SchedulingCalendar";

import { ApprovedDoctorsCard } from "@/components/dashboard/ApprovedDoctorsCard";
import { ApprovedCentersCard } from "@/components/dashboard/ApprovedCentersCard";
import { ApprovedProvidersSummary } from "@/components/dashboard/ApprovedProvidersSummary";
import { QuickActions } from "./QuickActions";
import { useQuickActionHandler } from "@/hooks/useQuickActionHandler";
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { PatientPostDischargeHub } from './PatientPostDischargeHub';
import { DigitalDeathCertificate } from './DigitalDeathCertificate';
import { PremiumActionHub } from './PremiumActionHub';
import { type ReactNode, useState, useId, type KeyboardEvent } from "react";

import { useAuth } from "@/hooks/useAuth";

type MobileCollapsibleProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
};

const MobileCollapsible: React.FC<MobileCollapsibleProps> = ({
    title,
    children,
    defaultOpen = false,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentId = useId();

    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleToggle();
        }
    };

    return (
        <div className={className}>
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="w-full flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    tabIndex={0}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${title}`}
                >
                    <span className="font-semibold text-foreground">{title}</span>
                    <span className="ml-2 text-muted-foreground">{isOpen ? "−" : "+"}</span>
                </button>
            </div>
            <div id={contentId} className={`mt-3 md:mt-0 ${isOpen ? "block" : "hidden"} md:block`}>
                {children}
            </div>
        </div>
    );
};

export function PatientDashboard() {
    const { handleQuickAction } = useQuickActionHandler();
    const { profile, user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl mb-6">
                    <TabsTrigger value="overview" className="rounded-lg px-8">Overview</TabsTrigger>
                    <TabsTrigger value="recovery" className="rounded-lg px-8">Recovery Hub</TabsTrigger>
                    <TabsTrigger value="eol_docs" className="rounded-lg px-8">EOL Documents</TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-lg px-8">Clinical Bookings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 overflow-x-hidden w-full">
                        {/* Left Column - Main Widgets */}
                        <div className="lg:col-span-8 space-y-3 sm:space-y-4 md:space-y-6">
                            {/* Healthcare Service Engine - Core Action Buttons */}
                            <div className="space-y-4 sm:space-y-6">
                                <PremiumActionHub onAction={handleQuickAction} />
                                <IncomingWorkflowProposals />
                            </div>

                            {/* Patient Quick Actions - Secondary/Workflow focused */}
                            <div className="mb-4 sm:mb-6 overflow-hidden">
                                <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter sm:tracking-tight uppercase truncate">
                                        Interactive Workflow Tools
                                    </h2>
                                </div>
                                <QuickActions user={user} onAction={handleQuickAction} />
                            </div>

                            {/* Two Column Layout - Stack on mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                <AppointmentsCard />
                                <HealthRecordsCard />
                            </div>

                            {/* Approved Providers */}
                            <MobileCollapsible title="Registered Clinical Partners" defaultOpen={false} className="space-y-3 sm:space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                    <ApprovedDoctorsCard />
                                    <ApprovedCentersCard />
                                </div>
                            </MobileCollapsible>

                            {/* Health Monitoring - Full Width - Hidden on mobile */}
                            <div className="hidden md:block">
                                <MobileCollapsible title="Health Monitoring" defaultOpen={false}>
                                    <HealthMonitoringCard patient={profile} />
                                </MobileCollapsible>
                            </div>
                        </div>

                        {/* Right Column - Secondary Widgets */}
                        <div className="lg:col-span-4 space-y-3 sm:space-y-4 md:space-y-6">
                            {/* Approved Providers Summary - Hidden on mobile */}
                            <div className="hidden md:block">
                                <MobileCollapsible title="Clinical Partners Summary" defaultOpen={false}>
                                    <ApprovedProvidersSummary />
                                </MobileCollapsible>
                            </div>

                            <MobileCollapsible title="Emergency & Community" defaultOpen={false} className="pb-32 sm:pb-0">
                                <div className="space-y-3 sm:space-y-4">
                                    <EmergencyCard />
                                    <CommunityCard />
                                </div>
                            </MobileCollapsible>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="recovery" className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <PatientPostDischargeHub patientId={user?.id || 'default'} />
                </TabsContent>

                <TabsContent value="eol_docs">
                    <DigitalDeathCertificate record={{ id: '8821', deceasedName: 'John Doe', intakeDate: 'April 29, 2026' }} />
                </TabsContent>

                <TabsContent value="appointments" className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 gap-6">
                        <AppointmentScheduler />
                        <SchedulingCalendar />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
