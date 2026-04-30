import React, { useState, useEffect, useCallback } from 'react';
import { patientService, PatientRecord } from '@/services/patientService';
import { discoveryService } from '@/services/discoveryService';
import { appointmentService } from '@/services/appointmentService';
import { Appointment } from '@/types/appointments';
import { format, isPast, isFuture, addMinutes } from 'date-fns';
import {
    Plus,
    Eye,
    FileText,
    Link,
    UserPlus,
    ClipboardList,
    Send,
    Users,
    Phone,
    Stethoscope,
    Search,
    ChevronDown,
    Activity,
    Pill,
    Calendar,
    ArrowLeftRight,
    HeartHandshake,
    Building,
    User,
    Truck,
    Video,
    ShoppingCart,
    Key,
    ScanLine,
    MapPin,
    TestTube,
    Microscope,
    Heart,
    MessageSquare,
    Brain,
    Download,
    Dumbbell,
    CreditCard,
    Image as ImageIcon,
    AlertTriangle,
    Zap,
    Package,
    ShieldCheck,
    ListTodo,
    Construction,
    Wrench,
    ShieldAlert,
    HelpCircle,
    GraduationCap,
    RefreshCw
} from 'lucide-react';
import { ServiceOfferModal } from './ServiceOfferModal';
import { MultiServiceRequestModal } from '../discovery/MultiServiceRequestModal';
import { BloodWorkflowModal } from '../blood-donation/BloodWorkflowModal';
import { InvoiceModal } from './InvoiceModal';
import { TreatmentPlanModal } from './TreatmentPlanModal';
import { MedicalReportModal } from './MedicalReportModal';
import { PharmacyWorkflowModal } from './PharmacyWorkflowModal';
import { BiotechWorkflowModal, BiotechWorkflowType } from './BiotechWorkflowModal';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickActionsProps {
    user: any | null;
    clinicalRequests?: any[]; // For future real-time counts
    onAction?: (action: string, data?: any) => void;
    hasMedicalStaff?: boolean;
    className?: string;
}

interface UniversalUser {
    id: string;
    name: string;
    type: 'patient' | 'doctor' | 'center' | 'nurse' | 'facility';
    subtitle?: string;
}

export function QuickActions({ user, clinicalRequests = [], onAction, hasMedicalStaff = false, className }: QuickActionsProps) {
    const userRoles = user?.roles || [];
    const isDoctor = userRoles.includes('doctor' as any);
    const isNurse = userRoles.includes('nurse' as any);
    const isPatient = userRoles.includes('patient' as any);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [displayAction, setDisplayAction] = useState<string | null>(null);
    const [currentCategory, setCurrentCategory] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UniversalUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [reason, setReason] = useState('');
    const selectedUserData = searchResults.find(u => u.id === selectedUser) || (selectedUser ? { id: selectedUser, name: selectedUser } : null);
    const [isSearching, setIsSearching] = useState(false);
    const [isServiceOfferModalOpen, setIsServiceOfferModalOpen] = useState(false);
    const [isMultiServiceModalOpen, setIsMultiServiceModalOpen] = useState(false);
    const [isBloodWorkflowModalOpen, setIsBloodWorkflowModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isTreatmentPlanModalOpen, setIsTreatmentPlanModalOpen] = useState(false);
    const [isMedicalReportModalOpen, setIsMedicalReportModalOpen] = useState(false);
    const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
    const [isBiotechModalOpen, setIsBiotechModalOpen] = useState(false);
    const [biotechModalType, setBiotechModalType] = useState<BiotechWorkflowType>('maintenance');
    const [pharmacyModalType, setPharmacyModalType] = useState<'dispense' | 'counseling' | 'management' | 'ailment' | 'prevention'>('dispense');
    const [initialServiceForModal, setInitialServiceForModal] = useState('');
    const [scheduledCalls, setScheduledCalls] = useState<Appointment[]>([]);
    const [isLoadingCalls, setIsLoadingCalls] = useState(false);
    const authRecord = useAuth();
    const profile = authRecord.profile;
    const isBiotech = Array.isArray(profile?.roles) && profile?.roles.includes('biotech_engineer');
    const isAdmin = userRoles.includes('admin' as any);
    const isRadiographer = userRoles.includes('radiographer' as any);
    const isLabScientist = userRoles.includes('lab_scientist' as any);

    // Differentiate search based on the intent - use displayAction for more accurate context
    const actionLabel = (displayAction || '').toLowerCase();
    const isColleagueSearch = actionLabel.includes('colleague');
    const isPartnerSearch = (actionLabel.includes('connect') || actionLabel.includes('partner') || actionLabel.includes('equipment') || actionLabel.includes('maintenance') || actionLabel.includes('safety') || actionLabel.includes('technical') || actionLabel.includes('training') || actionLabel.includes('upgrade')) && !isColleagueSearch;
    const isPatientSearch = actionLabel.includes('patient');

    const searchIndividuals = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const isCenterAccount = user?.roles?.some((r: any) => ['hospital', 'pharmacy', 'diagnostic', 'staff', 'maternity'].includes(r));
            const centerId = (profile as any)?.centerId || (user as any)?.centerId;

            if (isColleagueSearch && isCenterAccount && centerId) {
                // Internal Staff Search
                const staff = await discoveryService.getCenterStaff(centerId);
                const filteredStaff = (staff || [])
                    .filter(u =>
                        u.displayName?.toLowerCase().includes(query.toLowerCase()) ||
                        u.email?.toLowerCase().includes(query.toLowerCase()) ||
                        u.specialty?.toLowerCase().includes(query.toLowerCase())
                    )
                    .map(u => ({
                        id: u.id,
                        name: u.displayName || u.email || 'Unnamed Staff',
                        type: (u.roles?.[0] as any) || 'staff',
                        subtitle: `${u.specialty || 'General'} · Internal Staff`
                    }));
                setSearchResults(filteredStaff as UniversalUser[]);
            } else if (isPartnerSearch) {
                // Global Facility Search
                const centerRes = await discoveryService.searchCenters({ service: query, page: 1, limit: 20 }).catch(() => ({ centers: [] }));
                const centers = (centerRes.centers || [])
                    .map(c => ({
                        id: c.id,
                        name: c.name,
                        type: 'center' as const,
                        subtitle: `${c.type} · Medical Partner`
                    }));
                setSearchResults(centers as UniversalUser[]);
            } else {
                // Generic or Patient focused search
                const [userRes, centerRes] = await Promise.all([
                    discoveryService.searchUsers({ search: query, page: 1, limit: 20 }).catch(() => ({ users: [] })),
                    discoveryService.searchCenters({ service: query, page: 1, limit: 10 }).catch(() => ({ centers: [] }))
                ]);

                const users = (userRes.users || [])
                    .filter(u => !isPatientSearch || u.roles?.includes('patient' as any))
                    .map(u => ({
                        id: u.id,
                        name: u.displayName || u.email || 'Unnamed User',
                        type: (u.roles?.[0] as any) || 'user',
                        subtitle: isColleagueSearch ? (u.specialty || u.email) : (u.patientId || u.email)
                    }));

                const centers = isPatientSearch ? [] : (centerRes.centers || [])
                    .map(c => ({
                        id: c.id,
                        name: c.name,
                        type: 'center' as const,
                        subtitle: c.type
                    }));

                setSearchResults([...users, ...centers] as UniversalUser[]);
            }
        } catch (error) {
            console.error("Discovery search failed:", error);
        } finally {
            setIsSearching(false);
        }
    }, [user?.roles, profile, (user as any)?.centerId, currentAction, displayAction]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) searchIndividuals(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, searchIndividuals]);

    const fetchScheduledCalls = useCallback(async () => {
        setIsLoadingCalls(true);
        try {
            const res = await appointmentService.getAppointments({
                status: 'confirmed',
                isOnline: true
            });
            setScheduledCalls(res.data || []);
        } catch (error) {
            console.error("Failed to fetch scheduled calls:", error);
        } finally {
            setIsLoadingCalls(false);
        }
    }, []);

    const navigate = useNavigate();

    const handleActionClick = (action: string) => {
        const primaryRole = userRoles[0] || 'patient';
        const isProfessional = primaryRole !== 'patient';
        // Check if the user is a center/facility account
        const isCenterAccount = user?.roles?.some((r: any) => ['hospital', 'pharmacy', 'diagnostic', 'staff', 'ambulance_service', 'maternity'].includes(r));

        // 1. Professional clinical routing (Top Priority)
        if (isProfessional) {
            const cleanAction = action.replace('Create ', '').trim().toLowerCase();
            const clinicalMap: Record<string, any> = {
                'medical report': 'ClinicalReport',
                'diagnosis and prescription': { action: 'ClinicalRequest', category: 'prescription', label: 'Diagnosis and Prescription' },
                'care task': { action: 'ClinicalRequest', category: 'care_task', label: 'Clinical Treatment Plan' },
                'care_task': { action: 'ClinicalRequest', category: 'care_task', label: 'Clinical Treatment Plan' },
                'care task proposal': { action: 'ClinicalRequest', category: 'care_task', label: 'Clinical Treatment Plan' },
                'treatment plan / care task': { action: 'ClinicalRequest', category: 'care_task', label: 'Clinical Treatment Plan' },
                'appointment schedule': { action: 'ClinicalRequest', category: 'appointment', label: 'Appointment Schedule' },
                'reschedule / rebook (missed)': { action: 'ClinicalRequest', category: 'appointment', label: 'Reschedule / Rebook' },
                'call': { action: 'ClinicalRequest', category: 'call', label: 'Consultation Call' },
                'create call': { action: 'ClinicalRequest', category: 'call', label: 'Consultation Call' },
                'treatment': { action: 'ClinicalRequest', category: 'treatment', label: 'Medical Treatment' },
                'treatment schedule': { action: 'ClinicalRequest', category: 'treatment', label: 'Treatment Schedule' },
                'diagnosis': { action: 'ClinicalRequest', category: 'prescription', label: 'Diagnosis and Prescription' },
                'referral': { action: 'ClinicalRequest', category: 'referral', label: 'Clinical Referral' },
                'refer patient': { action: 'ClinicalRequest', category: 'referral', label: 'Clinical Referral' },
                'transfer patient': { action: 'ClinicalRequest', category: 'transfer', label: 'In-house Transfer' },
                'connect patient': { action: 'ClinicalRequest', category: 'connection', label: 'Connect Patient' },
                'connect colleague': { action: 'ClinicalRequest', category: 'connection', label: 'Connect Colleagues' },
                'connect colleagues': { action: 'ClinicalRequest', category: 'connection', label: 'Connect Colleagues' },
                'diagnostic request': { action: 'ClinicalRequest', category: 'diagnostic', label: 'Diagnostic Request' },
                'ambulance': { action: 'ClinicalRequest', category: 'transfer', label: 'Ambulance Service (Patient Movement)' },
                'emergency': { action: 'Emergency', label: 'Emergency Services (ER MDT Alert)' },
                'general practitioner': { action: 'Discovery', query: 'type=doctor&specialty=General Practitioner' },
                'death certificate': { action: 'ClinicalRequest', category: 'death_certificate', label: 'Death Certificate' },
                'discharge summary': { action: 'ClinicalRequest', category: 'discharge_summary', label: 'Discharge Summary' },
                'connect biomedical engineer': { action: 'Discovery', query: 'type=biotech_engineer&specialty=Biotechnology' },
                'prescribe special exercise': { action: 'ClinicalRequest', category: 'exercise', label: 'Exercise Prescription' },
                'virtual inspection / call': { action: 'ClinicalRequest', category: 'call', label: 'Virtual Inspection' },
                // Pharmacy Clinical Mappings
                'dispensing medicines': { action: 'ClinicalReport', category: 'dispense', label: 'Dispensing Confirmation' },
                'patient counseling': { action: 'ClinicalRequest', category: 'counseling', label: 'Clinical Patient Counseling' },
                'medication management': { action: 'ClinicalRequest', category: 'management', label: 'Medication Management' },
                'minor ailment treatment': { action: 'ClinicalRequest', category: 'ailment', label: 'Minor Ailment Treatment' },
                'health promotion & disease prevention': { action: 'ClinicalRequest', category: 'prevention', label: 'Health Promotion & Prevention' },
                'health promotion / prevention': { action: 'ClinicalRequest', category: 'prevention', label: 'Health Promotion & Prevention' },
                'inventory and supplies': { action: 'InventoryManagement', label: 'Inventory and supplies' },
                // Biotech Engineering Mappings
                'equipment installation and setup': { action: 'BiotechWorkflow', category: 'installation', label: 'Equipment Installation' },
                'maintenance and repair': { action: 'BiotechWorkflow', category: 'maintenance', label: 'Maintenance & Repair' },
                'safety and risk management': { action: 'BiotechWorkflow', category: 'safety', label: 'Safety & Risk Management' },
                'technical support for clinical staff': { action: 'BiotechWorkflow', category: 'support', label: 'Technical Support' },
                'training on equipment use': { action: 'BiotechWorkflow', category: 'training', label: 'Equipment Training' },
                'equipment procurement selection and technology planning': { action: 'BiotechWorkflow', category: 'procurement', label: 'Procurement & Planning' },
                'documentation and records': { action: 'BiotechWorkflow', category: 'documentation', label: 'Technical Documentation' },
                'upgrades and system integration': { action: 'BiotechWorkflow', category: 'upgrades', label: 'Upgrades & Integration' }
            };

            const mapping = clinicalMap[cleanAction];
            if (mapping) {
                // Professional actions that require a recipient search MUST open the dialog
                const standardizedAction = typeof mapping === 'string' ? mapping : mapping.action;
                const category = typeof mapping === 'string' ? undefined : mapping.category;
                const label = typeof mapping === 'string' ? action : mapping.label;

                setCurrentAction(standardizedAction);
                setCurrentCategory(category);
                setDisplayAction(label || action);
                setIsModalOpen(true);
                return;
            }
        }

        // 1.5 Handle Virologist immediate redirections
        const isVirologist = userRoles.includes('virologist' as any);
        if (primaryRole === 'virologist' || isVirologist) {
            const viroMap: Record<string, any> = {
                'connect diagnostic center': 'type=diagnostic',
                'connect research lab': 'type=research_center',
                'connect research institution': 'type=research_center',
                'connect hospital': 'type=hospital'
            };
            const query = viroMap[action.toLowerCase()];
            if (query) {
                navigate(`/discovery?${query}`);
                return;
            }
        }

        // 2.2 Handle Pharmacy Specialized Flows (Immediate Modals)
        const lowerAction = action.toLowerCase();
        if (userRoles.includes('pharmacy' as any)) {
            if (lowerAction.includes('dispensing') || lowerAction.includes('counseling')) {
                setIsMedicalReportModalOpen(true);
                return;
            }
            if (lowerAction.includes('ailment') || lowerAction.includes('medication management') || lowerAction.includes('prevention')) {
                setIsTreatmentPlanModalOpen(true);
                return;
            }
            if (lowerAction.includes('inventory')) {
                navigate('/pharmacy/inventory');
                return;
            }
        }

        // 3. Handle direct navigation actions
        switch (action) {
            case 'Offer Service':
                setIsServiceOfferModalOpen(true);
                return;
            case 'Call':
            case 'Create Call':
                fetchScheduledCalls();
                setCurrentAction(action);
                setIsModalOpen(true);
                return;
            case 'AI Symptom Check':
                navigate('/symptom-analysis');
                return;
            case 'Find & Connect':
            case 'FIND PARTNERS':
                const isCenterAccount = user?.roles?.some((r: any) => ['hospital', 'pharmacy', 'diagnostic', 'staff', 'ambulance_service'].includes(r));
                if (isCenterAccount || primaryRole === 'maternity') {
                    setCurrentAction('Find & Connect');
                    setIsModalOpen(true);
                } else {
                    navigate('/discovery?type=center'); // Partners are usually centers/facilities
                }
                return;
            case 'CONNECT COLLEAGUES':
                if (['doctor', 'nurse', 'staff', 'center_staff'].includes(primaryRole as string)) {
                    navigate('/discovery?type=doctor'); // Connect with other professionals
                } else {
                    navigate('/discovery?type=doctor');
                }
                return;
            case 'Find Patients':
            case 'Find patients/link Doctor':
                navigate('/discovery?type=patient');
                return;
            case 'Find Facilities':
                navigate('/centers');
                return;
            case 'Call a Practitioner':
                navigate('/discovery?type=doctor');
                return;
            case 'Search for Service':
            case 'Book Appointment':
            case 'Request Appointment':
            case 'Book a Surgery':
            case 'Diagnostics':
            case 'Diagnostic & Test Requests':
            case 'MEDICAL REQUEST':
            case 'Medical Requests':
            case 'Cardiology':
            case 'Care Worker':
            case 'Eye Lenses':
                setInitialServiceForModal(action);
                setIsMultiServiceModalOpen(true);
                return;
            case 'Emergency Assistance':
            case 'Call Ambulance':
                setInitialServiceForModal(action);
                setIsMultiServiceModalOpen(true);
                return;
            case 'Review Prescription':
                navigate('/clinical/me?tab=adherence');
                return;
            case 'Review':
                if (onAction) onAction('Review');
                return;
            case 'Request':
                if (onAction) onAction('Request');
                return;
            case 'Call a doctor':
            case 'Call a Practitioner':
                if (onAction) onAction('Call a doctor');
                else navigate('/discovery?type=doctor');
                return;
            case 'Check symptoms':
            case 'Check Symptoms':
                navigate('/symptoms');
                return;
            case 'View Collaboration Request':
                navigate('/requests');
                return;

            case 'Volunteer':
            case 'Voluntary Service':
                navigate('/voluntary-service');
                return;
            case 'DICOM Viewer':
            case 'DICOM VIEWER':
                navigate('/dicom-viewer');
                return;
            case 'Cardiology Services':
                navigate('/discovery?service=cardiology');
                return;
            case 'Fitness Center Near You':
                navigate('/discovery?type=center&service=fitness');
                return;
            case 'GET EYE LENSES':
                navigate('/discovery?service=vision');
                return;
            case 'GET A CARE WORKER':
                navigate('/discovery?service=nursing');
                return;
            case 'Create Request':
                if (onAction) onAction('ClinicalRequest');
                return;
            case 'Diagnosis and prescription':
                if (onAction) onAction('ClinicalReport');
                return;
            case 'CONNECT BIOMEDICAL ENGINEER':
                navigate('/discovery?type=biotech_engineer&specialty=Biotechnology');
                return;
            case 'Contact Biotech Specialist':
                navigate('/discovery?type=biotech_engineer&specialty=Biotechnology');
                return;
            case 'CONNECT PROSTHETIC DOCTOR':
                navigate('/discovery?type=doctor&specialty=Prosthetics');
                return;
            case 'CONNECT DIAGNOSTIC CENTER':
                navigate('/discovery?type=center&specialty=Diagnostic');
                return;
            case 'CONNECT AMBULANCE':
                navigate('/discovery?type=ambulance');
                return;
            case 'CONNECT RESEARCH LAB':
                navigate('/discovery?type=center&specialty=Research');
                return;
            case 'Blood Donation':
                setIsBloodWorkflowModalOpen(true);
                return;
            case 'Generate Invoice':
                setIsInvoiceModalOpen(true);
                return;
            case 'CLINICAL TREATMENT PLAN':
            case 'Treatment Plan / Care Task':
                setIsTreatmentPlanModalOpen(true);
                return;
            case 'MEDICAL REPORT':
            case 'cre-medicalReport':
                setIsMedicalReportModalOpen(true);
                return;
            // Admin Governance Actions
            case 'Manage Users...':
                navigate('/admin/users');
                return;
            case 'Entity Governance...':
                navigate('/admin?tab=centers');
                return;
            case 'System Audit Logs':
                navigate('/admin?tab=audit');
                return;
            case 'Global Config...':
                navigate('/admin/settings');
                return;
            case 'ID Verifications':
                navigate('/admin/verification');
                return;
            case 'Financial Settlement':
                navigate('/admin/finance');
                return;
            // Pharmacy Special Routes
            case 'InventoryManagement':
            case 'Inventory and supplies':
                navigate('/pharmacy/inventory');
                return;
        }

        // Handle modal workflows
        setCurrentAction(action);
        setDisplayAction(action);
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedUser) return;

        // Special handling for scheduled calls
        if (currentAction === 'Call' || currentAction === 'Create Call') {
            const scheduledCall = scheduledCalls.find(c => c.id === selectedUser);
            if (scheduledCall) {
                const now = new Date();
                const startTime = new Date(scheduledCall.appointmentDate);
                const [h, m] = scheduledCall.startTime.split(':').map(Number);
                startTime.setHours(h, m, 0, 0);

                // Strict start time requirement
                if (isFuture(startTime)) {
                    toast.warning(`It is not yet time for this call. Scheduled for ${scheduledCall.startTime}`);
                    return;
                }

                // Trigger "Live Flow" modals for clinical document creation
                navigate(`/teleconsult/${scheduledCall.id}`);
                setIsModalOpen(false);
                return;
            }
        }

        // Trigger "Live Flow" modals for clinical document creation (The "Clinical Flow")
        const actionLower = (currentAction || '').toLowerCase();
        const categoryLower = (currentCategory || '').toLowerCase();

        // Specific Pharmacy Live Flows
        const pharmacyCategories: any[] = ['dispense', 'counseling', 'management', 'ailment', 'prevention'];
        if (pharmacyCategories.includes(categoryLower)) {
            setPharmacyModalType(categoryLower as any);
            setIsPharmacyModalOpen(true);
            setIsModalOpen(false);
            return;
        }

        // Specific Biotech Live Flows
        const biotechCategories: any[] = ['installation', 'maintenance', 'safety', 'support', 'training', 'procurement', 'documentation', 'upgrades'];
        if (biotechCategories.includes(categoryLower) || actionLower.includes('biotechworkflow')) {
            setBiotechModalType(categoryLower as any || 'maintenance');
            setIsBiotechModalOpen(true);
            setIsModalOpen(false);
            return;
        }

        if (actionLower.includes('medical report') || categoryLower === 'dispense' || categoryLower === 'counseling') {
            setIsMedicalReportModalOpen(true);
            setIsModalOpen(false);
            return;
        }

        if (categoryLower === 'ailment' || categoryLower === 'management' || categoryLower === 'prevention') {
            setIsTreatmentPlanModalOpen(true);
            setIsModalOpen(false);
            return;
        }

        if (onAction) onAction(currentAction || '', { user: selectedUser, reason, category: currentCategory });
        setIsModalOpen(false);
        setSelectedUser('');
        setReason('');
        setSearchTerm('');
        setSearchResults([]);
    };

    const primaryRole = userRoles[0] || 'patient';

    const actions = [
        // Workflow Actions (B2B/Providers)
        { id: 'discovery', label: primaryRole === 'virologist' ? 'CONNECT PARTNERS' : primaryRole === 'mortuary' ? 'CORPSE DEPOSITOR REGISTRY' : ['doctor', 'nurse', 'staff', 'center_staff', 'radiographer', 'lab_scientist'].includes(primaryRole as string) ? 'FIND & REGISTER PATIENT' : 'Find & Connect', icon: Search, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', roles: ['doctor', 'nurse', 'pharmacy', 'center', 'diagnostic', 'maternity', 'staff', 'center_staff', 'mortuary', 'virologist', 'radiographer', 'lab_scientist'] },
        { id: 'transferPatient', label: ['maternity', 'doctor', 'nurse', 'virologist', 'radiographer', 'lab_scientist'].some(r => userRoles.includes(r as any)) ? 'REFER PATIENT' : 'TRANSFER PATIENT', icon: ArrowLeftRight, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', roles: ['doctor', 'nurse', 'center', 'maternity', 'virologist', 'radiographer', 'lab_scientist'] },
        { id: 'contact', label: 'CONNECT COLLEAGUES', icon: UserPlus, color: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100', roles: ['doctor', 'nurse', 'pharmacy', 'diagnostic', 'maternity', 'staff', 'center_staff', 'virologist', 'radiographer', 'lab_scientist'] },
        { id: 'offerService', label: 'Offer Service', icon: HeartHandshake, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', roles: ['doctor', 'nurse', 'center', 'biotech_engineer', 'allied_practitioner', 'virologist'] },
        { id: 'careTask', label: 'CLINICAL TREATMENT PLAN', icon: ClipboardList, color: 'bg-teal-50 text-teal-600 hover:bg-teal-100', roles: ['doctor', 'nurse', 'center', 'allied_practitioner', 'virologist'] },
        { id: 'createMedicalReport', label: 'MEDICAL REPORT', icon: FileText, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', roles: ['doctor', 'nurse', 'center', 'allied_practitioner', 'virologist'] },
        { id: 'reviewTreatment', label: 'Review Case', icon: Activity, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100', roles: ['doctor', 'nurse', 'allied_practitioner', 'virologist'] },

        // Biotech Engineering Grid
        { id: 'biotech-installation', label: 'Equipment installation and setup', icon: Construction, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', roles: ['biotech_engineer'] },
        { id: 'biotech-maintenance', label: 'Maintenance and repair', icon: Wrench, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', roles: ['biotech_engineer'] },
        { id: 'biotech-safety', label: 'Safety and risk management', icon: ShieldAlert, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100', roles: ['biotech_engineer'] },
        { id: 'biotech-support', label: 'Technical support for clinical staff', icon: HelpCircle, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', roles: ['biotech_engineer'] },
        { id: 'biotech-training', label: 'Training on equipment use', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', roles: ['biotech_engineer'] },
        { id: 'biotech-procurement', label: 'Equipment procurement selection and technology planning', icon: ShoppingCart, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100', roles: ['biotech_engineer'] },
        { id: 'biotech-docs', label: 'Documentation and records', icon: FileText, color: 'bg-slate-50 text-slate-600 hover:bg-slate-100', roles: ['biotech_engineer'] },
        { id: 'biotech-upgrade', label: 'Upgrades and system integration', icon: RefreshCw, color: 'bg-teal-50 text-teal-600 hover:bg-teal-100', roles: ['biotech_engineer'] },

        // Service Actions (B2C/General)
        { id: 'view-prescriptions', label: 'Review Prescription', icon: Pill, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-200', roles: ['patient'] },
        { id: 'view-requests', label: 'View Collaboration Request', icon: ClipboardList, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 ring-amber-200', roles: ['patient'] },
        { id: 'ai-triage', label: 'AI Symptom Check', icon: Brain, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 ring-violet-200', roles: ['patient'] },
        { id: 'search-service', label: 'Search for Service', icon: Search, color: 'bg-teal-50 text-teal-700 hover:bg-teal-100 ring-teal-200', roles: ['patient'] },
        { id: 'appointments', label: 'Request Consultation', icon: Calendar, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', roles: ['patient'] },
        { id: 'ambulance', label: (['center', 'hospital', 'pharmacy', 'diagnostic', 'fitness_center', 'staff', 'maternity', 'radiographer', 'lab_scientist'].some((r: any) => userRoles.includes(r as any))) ? 'CONNECT AMBULANCE TEAM' : 'Call Ambulance', icon: Truck, color: 'bg-red-50 text-red-600 hover:bg-red-100', roles: ['patient', 'doctor', 'staff', 'center_staff', 'diagnostic', 'fitness_center', 'maternity', 'radiographer', 'lab_scientist'] },
        { id: 'surgery', label: 'Book a Surgery', icon: Activity, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100', roles: ['patient'] },
        { id: 'teleconsult', label: primaryRole === 'mortuary' ? 'Call Corpse Depositor' : 'Call a Practitioner', icon: primaryRole === 'mortuary' ? Phone : Stethoscope, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100', roles: ['patient', 'mortuary'] },
        { id: 'diagnostics', label: ['center', 'maternity', 'hospital', 'diagnostic'].some(r => userRoles.includes(r as any)) ? 'DIAGNOSTIC & TEST REQUEST' : 'Diagnostic & Test Requests', icon: TestTube, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', roles: ['patient', 'doctor', 'nurse', 'center', 'maternity', 'hospital', 'diagnostic'] },
        { id: 'cardiology', label: 'Cardiology Services', icon: Heart, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100', roles: ['patient', 'doctor'] },
        { id: 'fitness', label: 'Fitness Center Near You', icon: Building, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', roles: ['patient'] },
        { id: 'blood-donation', label: 'Blood Donation', icon: Heart, color: 'bg-pink-50 text-pink-600 hover:bg-pink-100', roles: ['patient', 'doctor', 'nurse', 'staff', 'center_staff'] },
        { id: 'vision', label: 'GET EYE LENSES', icon: Eye, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', roles: ['patient'] },
        { id: 'care-worker', label: 'GET A CARE WORKER', icon: HeartHandshake, color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100', roles: ['patient'] },
        { id: 'volunteer', label: 'Voluntary Service', icon: HeartHandshake, color: 'bg-stone-50 text-stone-600 hover:bg-stone-100', roles: ['patient', 'staff', 'center_staff'] },
        { id: 'dicom', label: 'DICOM VIEWER', icon: ScanLine, color: 'bg-slate-900 text-slate-100 hover:bg-slate-800', roles: ['patient', 'doctor', 'nurse', 'center', 'radiographer', 'lab_scientist'] },
        { id: 'clinical-request', label: 'Initiate Medical Order', icon: FileText, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', roles: ['doctor', 'nurse', 'practitioner', 'allied_practitioner', 'radiographer', 'lab_scientist'] },
        { id: 'clinical-report', label: 'Diagnosis and prescription', icon: Activity, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', roles: ['doctor', 'center', 'hospital', 'allied_practitioner'] },
        { id: 'book-attend', label: 'Book & Attend Appointment', icon: Calendar, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', roles: ['doctor', 'nurse', 'practitioner'] },
        { id: 'mdt-plan', label: 'Create MDT Treatment Plan', icon: Users, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', roles: ['doctor', 'nurse', 'practitioner'] },
        { id: 'escalate', label: 'Escalate Clinical Case', icon: ShieldAlert, color: 'bg-red-50 text-red-700 hover:bg-red-100', roles: ['nurse', 'staff'] },
        { id: 'contact-biotech', label: 'CONNECT BIOMEDICAL ENGINEER', icon: Microscope, color: 'bg-teal-50 text-teal-600 hover:bg-teal-100', roles: ['doctor', 'nurse', 'staff', 'center_staff', 'fitness_center', 'center', 'virologist'] },
        { id: 'connect-research', label: 'CONNECT RESEARCH LAB', icon: Microscope, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', roles: ['virologist'] },
        { id: 'connect-diag', label: 'CONNECT DIAGNOSTIC CENTER', icon: Building, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100', roles: ['virologist'] },
        { id: 'connect-hosp', label: 'CONNECT HOSPITAL', icon: Building, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', roles: ['virologist'] },
        { id: 'prescribe-exercise', label: 'PRESCRIBE SPECIAL EXERCISE', icon: Dumbbell, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', roles: ['fitness_center'] },
        { id: 'virtual-inspection', label: 'VIRTUAL INSPECTION / CALL', icon: Video, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100', roles: ['fitness_center'] },
        { id: 'connect-prosthetic', label: 'CONNECT PROSTHETIC DOCTOR', icon: User, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', roles: ['biotech_engineer'] },
        { id: 'connect-diag-biotech', label: 'CONNECT DIAGNOSTIC CENTER', icon: Building, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100', roles: ['biotech_engineer'] },
        { id: 'connect-ambulance', label: 'CONNECT AMBULANCE', icon: Zap, color: 'bg-red-50 text-red-600 hover:bg-red-100', roles: ['biotech_engineer'] },
        { id: 'connect-research-biotech', label: 'CONNECT RESEARCH LAB', icon: Microscope, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', roles: ['biotech_engineer'] },
        { id: 'generate-invoice', label: 'Generate Invoice', icon: CreditCard, color: 'bg-green-50 text-green-600 hover:bg-green-100', roles: ['doctor', 'nurse', 'hospital', 'pharmacy', 'center', 'diagnostic', 'maternity', 'staff', 'center_staff', 'virologist', 'biotech_engineer', 'allied_practitioner'] },

        // Pharmacy Specific Clinical Grid
        { id: 'dispense', label: 'Dispensing medicines', icon: Pill, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', roles: ['pharmacy'] },
        { id: 'counseling', label: 'Patient counseling', icon: MessageSquare, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', roles: ['pharmacy'] },
        { id: 'inventory', label: 'Inventory and supplies', icon: Package, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', roles: ['pharmacy'] },
        { id: 'ailment', label: 'Minor ailment treatment', icon: Stethoscope, color: 'bg-teal-50 text-teal-600 hover:bg-teal-100', roles: ['pharmacy'] },
        { id: 'prevention', label: 'Health promotion / Prevention', icon: ShieldCheck, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100', roles: ['pharmacy'] },

        // Admin Actions (Authority)
        { id: 'admin-users', label: 'MANAGE USER DIRECTORY', icon: Users, color: 'bg-slate-900 text-white hover:bg-black', roles: ['admin'] },
        { id: 'admin-centers', label: 'ENTITY GOVERNANCE', icon: Building, color: 'bg-slate-900 text-white hover:bg-black', roles: ['admin'] },
        { id: 'admin-audit', label: 'SYSTEM AUDIT LOGS', icon: Key, color: 'bg-slate-900 text-white hover:bg-black', roles: ['admin'] },
        { id: 'admin-config', label: 'GLOBAL CONFIGURATION', icon: Zap, color: 'bg-slate-900 text-white hover:bg-black', roles: ['admin'] },
        { id: 'admin-reports', label: 'COMPLIANCE REPORTS', icon: Activity, color: 'bg-slate-900 text-white hover:bg-black', roles: ['admin'] },
        { id: 'admin-finance', label: 'FINANCIAL SETTLEMENT', icon: CreditCard, color: 'bg-slate-900 text-white hover:bg-black', roles: ['admin'] },
    ];

    const filteredActions = actions.filter(action =>
        !action.roles || action.roles.some(role => userRoles.includes(role as any))
    );

    const isCenterAccount = user?.roles?.some((r: any) => ['hospital', 'pharmacy', 'diagnostic', 'staff', 'maternity'].includes(r));

    const reviewItems = [
        { id: 'rev-diagnosis', label: 'Diagnosis and prescription', icon: Search },
        { id: 'rev-referral', label: 'Referrer Patient', icon: ArrowLeftRight },
        { id: 'rev-treatment', label: 'Review Case', icon: Activity },
        { id: 'rev-careTask', label: 'Review Treatment Plan', icon: ClipboardList },
        { id: 'rev-prescriptions', label: 'Diagnosis and prescription', icon: Pill },
        { id: 'rev-pharmacy', label: 'Pharmacy', icon: Pill },
        { id: 'rev-appointment', label: 'Appointment Schedule', icon: Calendar },
        { id: 'rev-call', label: 'Call', icon: Phone },
        { id: 'rev-treatmentSchedule', label: 'Treatment Schedule', icon: Calendar },
        { id: 'rev-exercise', label: 'Exercise Prescriptions', icon: Dumbbell },
        { id: 'rev-imaging', label: 'Imaging Orders', icon: ImageIcon },
        { id: 'rev-lab', label: 'Lab Orders', icon: Microscope },
    ];

    const createItems = [
        { id: 'cre-medicalReport', label: 'Medical Report', icon: FileText },
        { id: 'cre-diagnosis', label: 'Diagnosis and prescription', icon: Search },
        { id: 'cre-referral', label: 'Referral', icon: ArrowLeftRight },
        { id: 'cre-prescription', label: 'Diagnosis and prescription', icon: Pill },
        { id: 'cre-pharmacy', label: 'Pharmacy Request', icon: Pill },
        { id: 'cre-careTask', label: 'CLINICAL TREATMENT PLAN', icon: ClipboardList },
        { id: 'cre-appointment', label: 'Reschedule / Rebook (Missed)', icon: Calendar },
        { id: 'cre-call', label: 'Call', icon: Phone },
        { id: 'cre-treatment', label: 'Treatment', icon: Activity },
        { id: 'cre-treatmentSchedule', label: 'Treatment Schedule', icon: Calendar },
        { id: 'cre-diagnostic', label: 'Diagnostic Request', icon: Microscope },
        { id: 'cre-ambulance', label: 'Ambulance Service (Movement)', icon: Truck },
        { id: 'cre-emergency', label: 'Emergency Services (ER MDT)', icon: AlertTriangle },
        { id: 'cre-deathCertificate', label: 'Death Certificate', icon: FileText },
        { id: 'cre-dischargeSummary', label: 'Discharge Summary', icon: FileText },
        { id: 'cre-exportResult', label: 'Export Diagnostic Result', icon: Download },
        { id: 'cre-exercise', label: 'Prescribe Special Exercise', icon: Dumbbell },
        { id: 'cre-invoice', label: 'Generate Invoice', icon: CreditCard },
        // Pharmacy Specifics
        { id: 'cre-dispense', label: 'Dispensing medicines', icon: Pill },
        { id: 'cre-counseling', label: 'Patient counseling', icon: MessageSquare },
        { id: 'cre-management', label: 'Medication management', icon: ClipboardList },
        { id: 'cre-ailment', label: 'Minor ailment treatment', icon: Stethoscope },
        { id: 'cre-prevention', label: 'Health promotion & disease prevention', icon: ShieldCheck },
        { id: 'cre-inventory', label: 'Inventory and supplies', icon: Package },
        // Biotech Specifics
        { id: 'cre-installation', label: 'Equipment installation and setup', icon: Construction },
        { id: 'cre-maintenance', label: 'Maintenance and repair', icon: Wrench },
        { id: 'cre-safety', label: 'Safety and risk management', icon: ShieldAlert },
        { id: 'cre-support', label: 'Technical support for clinical staff', icon: HelpCircle },
        { id: 'cre-training', label: 'Training on equipment use', icon: GraduationCap },
        { id: 'cre-procurement', label: 'Equipment procurement selection and technology planning', icon: ShoppingCart },
        { id: 'cre-documentation', label: 'Documentation and records', icon: FileText },
        { id: 'cre-upgrades', label: 'Upgrades and system integration', icon: RefreshCw },
        { id: 'cre-imaging', label: 'Process Imaging / Acquire', icon: ImageIcon },
        { id: 'cre-lab', label: 'Process Sample / Analysis', icon: Microscope },
    ];

    const isDiagnosticAccount = userRoles.includes('diagnostic' as any);
    const isFitnessCenterAccount = userRoles.includes('fitness_center' as any);
    const isMortuaryAccount = userRoles.includes('mortuary' as any);

    const filteredReviewItems = reviewItems.filter((item: any) => {
        if (item.id === 'rev-pharmacy' && !isCenterAccount) return false;
        // Diagnosticians have no access to Treatment, Care Tasks, or Prescriptions
        if (isDiagnosticAccount && ['rev-treatment', 'rev-careTask', 'rev-prescriptions', 'rev-treatmentSchedule'].includes(item.id)) return false;
        // Fitness centers have no business with clinical Diagnosis, Treatment, Care Tasks, or Prescriptions
        if (isFitnessCenterAccount && ['rev-diagnosis', 'rev-treatment', 'rev-careTask', 'rev-prescriptions'].includes(item.id)) return false;
        // Fitness centers DO see exercises
        if (item.id === 'rev-exercise' && !isFitnessCenterAccount) return false;
        // Mortuary attendants ONLY see Call and Death Certificate
        if (isMortuaryAccount && !['rev-call', 'rev-deathCertificate'].includes(item.id)) return false;
        // Biotech Engineers have no business with clinical Diagnosis or Prescriptions
        if (isBiotech && ['rev-diagnosis', 'rev-prescriptions'].includes(item.id)) return false;
        
        // Radiographer Specifics
        if (isRadiographer && !['rev-imaging', 'rev-call', 'rev-referral'].includes(item.id)) return false;
        if (item.id === 'rev-imaging' && !isRadiographer && !isDiagnosticAccount) return false;

        // Lab Scientist Specifics
        if (isLabScientist && !['rev-lab', 'rev-call', 'rev-referral'].includes(item.id)) return false;
        if (item.id === 'rev-lab' && !isLabScientist && !isDiagnosticAccount) return false;

        return true;
    });

    const filteredCreateItems = createItems.filter((item: any) => {
        if (['cre-pharmacy', 'cre-diagnosis', 'cre-referral'].includes(item.id) && !isCenterAccount) return false;
        // Diagnosticians only send back results, they don't create treatments, care tasks, or prescriptions
        if (isDiagnosticAccount && ['cre-treatment', 'cre-careTask', 'cre-prescription', 'cre-treatmentSchedule', 'cre-medicalReport'].includes(item.id)) return false;
        // Fitness centers don't create clinical diagnoses, medical reports, prescriptions, or clinical treatments
        if (isFitnessCenterAccount && ['cre-diagnosis', 'cre-medicalReport', 'cre-prescription', 'cre-treatment', 'cre-careTask'].includes(item.id)) return false;
        // Fitness centers DO create exercise prescriptions
        if (item.id === 'cre-exercise' && !isFitnessCenterAccount) return false;
        // Mortuary attendants ONLY create Call (scheduling) and Death Certificate
        if (isMortuaryAccount && !['cre-call', 'cre-deathCertificate'].includes(item.id)) return false;
        // Biotech Engineers don't create clinical diagnoses, medical reports, or prescriptions
        if (isBiotech && ['cre-diagnosis', 'cre-prescription', 'cre-medicalReport'].includes(item.id)) return false;

        // Pharmacy Filter
        const pharmacyOnly = ['cre-dispense', 'cre-counseling', 'cre-management', 'cre-ailment', 'cre-prevention', 'cre-inventory'];
        if (pharmacyOnly.includes(item.id) && userRoles[0] !== 'pharmacy') return false;

        const biotechOnly = ['cre-installation', 'cre-maintenance', 'cre-safety', 'cre-support', 'cre-training', 'cre-procurement', 'cre-documentation', 'cre-upgrades'];
        if (biotechOnly.includes(item.id) && !isBiotech) return false;

        // Radiographer Specifics
        if (isRadiographer && !['cre-imaging', 'cre-call', 'cre-referral', 'cre-invoice'].includes(item.id)) return false;
        if (item.id === 'cre-imaging' && !isRadiographer && !isDiagnosticAccount) return false;

        // Lab Scientist Specifics
        if (isLabScientist && !['cre-lab', 'cre-call', 'cre-referral', 'cre-invoice'].includes(item.id)) return false;
        if (item.id === 'cre-lab' && !isLabScientist && !isDiagnosticAccount) return false;

        return true;
    });

    return (
        <Card className={cn("border-none shadow-sm rounded-2xl bg-white mx-0 sm:mx-0", className)}>
            <CardHeader className="pb-3 px-4 sm:px-6 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                            {primaryRole === 'patient' ? 'Quick Services' : 'Connect & Collaborate'}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-500 font-medium">
                            {primaryRole === 'patient'
                                ? 'Access healthcare services and support'
                                : isAdmin
                                    ? 'Execute system governance and platform oversight'
                                    : isBiotech
                                        ? 'Manage technical services and collaborate with partners'
                                        : isCenterAccount
                                            ? 'Initiate interactive care workflows with partners'
                                            : 'Initiate interactive care workflows with PATIENTS'}
                        </CardDescription>
                    </div>
                    {primaryRole === 'patient' && (
                        <div className="flex gap-2 shrink-0">
                            <Button
                                onClick={() => handleActionClick('Search for Service')}
                                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2 px-4 sm:px-6 shadow-lg shadow-teal-100 hidden sm:flex h-11"
                            >
                                <Search className="h-4 w-4" />
                                <span className="hidden md:inline">Search for Service</span>
                                <span className="md:hidden">Search</span>
                            </Button>
                            <Button
                                onClick={() => handleActionClick('Emergency Assistance')}
                                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold gap-2 px-4 sm:px-6 shadow-lg shadow-red-100 h-11"
                            >
                                <Truck className="h-4 w-4" />
                                <span className="hidden sm:inline">Emergency</span>
                            </Button>
                        </div>
                    )}
                    {primaryRole !== 'patient' && (
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Under Review Dropdown */}
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="rounded-xl flex items-center gap-1.5 sm:gap-2 border-gray-200 h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold">
                                        <Eye className="h-4 w-4 text-gray-500 sm:hidden" />
                                        <span className="hidden sm:inline uppercase">{isAdmin ? 'Audit Vault' : 'Document Vault / Review'}</span>
                                        <span className="sm:hidden">Review</span>
                                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-xl shadow-xl border-gray-100 p-1 max-h-[70vh] overflow-y-auto" align="end">
                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 p-2">{isAdmin ? 'System Audit' : 'Select to Review'}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {isAdmin ? (
                                        <>
                                            <DropdownMenuItem onClick={() => navigate('/admin?tab=audit')} className="rounded-lg gap-3 py-2 cursor-pointer">
                                                <Key className="h-4 w-4 text-gray-500" />
                                                <span>Security Audit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/admin?tab=reports')} className="rounded-lg gap-3 py-2 cursor-pointer">
                                                <Activity className="h-4 w-4 text-gray-500" />
                                                <span>Compliance Review</span>
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        filteredReviewItems.map(item => (
                                            <DropdownMenuItem
                                                key={item.id}
                                                className="rounded-lg gap-3 py-2 cursor-pointer"
                                                onClick={() => handleActionClick(`Review ${item.label}`)}
                                            >
                                                <item.icon className="h-4 w-4 text-gray-500" />
                                                <span>{item.label}</span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Under Create Dropdown */}
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button className="rounded-xl flex items-center gap-1.5 sm:gap-2 bg-gray-900 hover:bg-black text-white h-10 px-3 sm:px-6 text-xs sm:text-sm font-bold shadow-md">
                                        <Plus className="h-4 w-4" />
                                        <span className="hidden sm:inline uppercase">{isAdmin ? 'Admin Console' : 'Generate Clinical Document'}</span>
                                        <span className="sm:hidden">{isAdmin ? 'Tools' : 'Create'}</span>
                                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-xl shadow-xl border-gray-100 p-1 max-h-[70vh] overflow-y-auto" align="end">
                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 p-2">{isAdmin ? 'Management Console' : 'Choose to Create'}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {isAdmin ? (
                                        <>
                                            <DropdownMenuItem onClick={() => navigate('/admin/users')} className="rounded-lg gap-3 py-2 cursor-pointer">
                                                <Users className="h-4 w-4 text-gray-500" />
                                                <span>User Management</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="rounded-lg gap-3 py-2 cursor-pointer">
                                                <Zap className="h-4 w-4 text-gray-500" />
                                                <span>System Settings</span>
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        filteredCreateItems.map(item => (
                                            <DropdownMenuItem
                                                key={item.id}
                                                className="rounded-lg gap-3 py-2 cursor-pointer"
                                                onClick={() => handleActionClick(`Create ${item.label}`)}
                                            >
                                                <item.icon className="h-4 w-4 text-gray-500" />
                                                <span>{item.label}</span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-8 pt-2">
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 font-bold">
                    {filteredActions.map((action) => (
                        <button
                            key={action.id}
                            className={cn(
                                "group relative h-[90px] sm:h-[120px] rounded-xl sm:rounded-3xl flex flex-col items-center justify-center gap-1.5 sm:gap-3 transition-all duration-500 border border-slate-100/80 bg-white hover:border-teal-100 hover:shadow-2xl hover:shadow-teal-100/40 hover:-translate-y-1.5 active:scale-[0.98] overflow-hidden p-1.5",
                            )}
                            onClick={() => handleActionClick(action.label)}
                        >
                            {/* Animated Background Glow */}
                            <div className={cn(
                                "absolute -right-4 -bottom-4 h-16 w-16 opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-700 rounded-full",
                                action.color.split(' ').find(c => c.startsWith('bg-'))
                            )} />

                            {/* Subtle Background Icon for Depth */}
                            <action.icon className="absolute -right-2 -bottom-2 h-10 w-10 sm:h-14 sm:w-14 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity rotate-12" />

                            <div className={cn(
                                "relative p-1.5 sm:p-3 rounded-lg sm:rounded-2xl bg-slate-50 shadow-inner group-hover:bg-white group-hover:shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ring-1 ring-slate-100 group-hover:ring-teal-100",
                                action.color.split(' ').filter(c => c.startsWith('text-')).join(' ')
                            )}>
                                <action.icon className="h-4 w-4 sm:h-7 sm:w-7 transition-all duration-500 group-hover:scale-110" />
                            </div>

                            <span className="relative text-[7px] min-[320px]:text-[8px] sm:text-[10px] md:text-[11px] font-black text-center leading-tight break-words max-w-full px-0.5 text-slate-500 group-hover:text-teal-950 transition-colors uppercase tracking-tighter sm:tracking-tight overflow-hidden line-clamp-2">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </CardContent>

            {/* Action Dialog */}
            {(() => {
                const actionLower = (displayAction || currentAction || '').toLowerCase();

                return (
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                            <DialogHeader className={cn(
                                "p-6 text-white text-left transition-colors duration-500",
                                isColleagueSearch ? "bg-gradient-to-br from-cyan-600 to-cyan-700" :
                                    isPartnerSearch ? "bg-gradient-to-br from-indigo-600 to-indigo-700" :
                                        "bg-gradient-to-br from-teal-600 to-teal-700"
                            )}>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
                                    {actionLower.includes('call') ? <Video className="h-5 w-5" /> :
                                        isColleagueSearch ? <UserPlus className="h-5 w-5" /> :
                                            <Activity className="h-5 w-5" />}
                                    {displayAction || currentAction}
                                </DialogTitle>
                                <DialogDescription className="text-white/90 mt-1 opacity-90 font-medium text-xs">
                                    {isAdmin
                                        ? `Initialize the ${displayAction} governance protocol by identifying the target record.`
                                        : isColleagueSearch
                                            ? 'Identify a clinical colleague to expand your professional network and collaborator list.'
                                            : isPartnerSearch
                                                ? 'Authorize a connection with a healthcare partner or diagnostic facility for system integration.'
                                                : isPatientSearch
                                                    ? 'Identify a PATIENT record to initiate this clinical workflow or medical order.'
                                                    : `Execute the ${displayAction} workflow by selecting a target participant.`}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <Label htmlFor="search" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Users className={cn(
                                            "h-4 w-4",
                                            isColleagueSearch ? "text-cyan-600" : isPartnerSearch ? "text-indigo-600" : "text-teal-600"
                                        )} />
                                        {isAdmin
                                            ? 'Search Registry'
                                            : isColleagueSearch
                                                ? 'Clinical Professional / Colleague'
                                                : isPartnerSearch
                                                    ? 'Healthcare Partner / Center'
                                                    : 'Find & Register Patient (Registry)'}
                                    </Label>

                                    {(currentAction === 'Call' || currentAction === 'Create Call') && scheduledCalls.length > 0 && (
                                        <div className="space-y-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                                            <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                                                Scheduled Today
                                            </p>
                                            <div className="space-y-2">
                                                {scheduledCalls.map(call => {
                                                    const subLabel = isColleagueSearch ? 'Provider' : 'Patient';
                                                    const name = call.patient
                                                        ? (`${call.patient.firstName || ''} ${call.patient.lastName || ''}`.trim() || call.patient.email || `Scheduled ${subLabel}`)
                                                        : `Scheduled ${subLabel}`;
                                                    return (
                                                        <div
                                                            key={call.id}
                                                            onClick={() => {
                                                                setSelectedUser(call.id);
                                                                setSearchTerm(name);
                                                            }}
                                                            className={cn(
                                                                "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]",
                                                                selectedUser === call.id
                                                                    ? "bg-white border-teal-500 shadow-md ring-1 ring-teal-500/20"
                                                                    : "bg-white/50 border-gray-100 hover:border-teal-200"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                                                    {name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
                                                                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                                        {format(new Date(call.appointmentDate), 'MMM dd')} @ {call.startTime}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge className={cn(
                                                                "text-white border-0 text-[10px] sm:text-[9px] h-5 px-2",
                                                                isFuture(addMinutes(new Date(`${call.appointmentDate.split('T')[0]}T${call.startTime}`), -10))
                                                                    ? "bg-slate-300"
                                                                    : "bg-teal-600 animate-pulse"
                                                            )}>
                                                                {isFuture(addMinutes(new Date(`${call.appointmentDate.split('T')[0]}T${call.startTime}`), -10)) ? "LOCKED" : "JOIN NOW"}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="relative py-2">
                                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-teal-100"></span></div>
                                                <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-[#fdfefd] px-2 text-teal-300 tracking-widest">or Find Others</span></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative group">
                                        <Search className={cn(
                                            "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:transition-colors",
                                            isColleagueSearch ? "group-focus-within:text-cyan-600" : isPartnerSearch ? "group-focus-within:text-indigo-600" : "group-focus-within:text-teal-600"
                                        )} />
                                        <Input
                                            id="search"
                                            placeholder={isAdmin ? 'Name, Email or Registry ID...' :
                                                isColleagueSearch ? "Name, email or specialty..." :
                                                    isPartnerSearch ? "Facility name or service..." :
                                                        "Patient name, ID or email..."}
                                            className={cn(
                                                "pl-11 rounded-2xl h-13 border-gray-200 transition-all text-sm shadow-sm",
                                                isColleagueSearch ? "focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" :
                                                    isPartnerSearch ? "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" :
                                                        "focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                                            )}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Activity className={cn(
                                                    "h-4 w-4 animate-spin",
                                                    isColleagueSearch ? "text-cyan-600" : isPartnerSearch ? "text-indigo-600" : "text-teal-600"
                                                )} />
                                            </div>
                                        )}
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="mt-2 max-h-[220px] overflow-auto border border-gray-100 rounded-2xl bg-gray-50/50 p-1.5 space-y-1.5 shadow-inner">
                                            {searchResults.map(res => (
                                                <div
                                                    key={res.id}
                                                    onClick={() => {
                                                        setSelectedUser(res.id);
                                                        setSearchTerm(res.name);
                                                        setSearchResults([]);
                                                    }}
                                                    className={cn(
                                                        "p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]",
                                                        selectedUser === res.id
                                                            ? cn(
                                                                "bg-white shadow-md ring-1",
                                                                isColleagueSearch ? "border-cyan-500 ring-cyan-500/20" :
                                                                    isPartnerSearch ? "border-indigo-500 ring-indigo-500/20" :
                                                                        "border-teal-500 ring-teal-500/20"
                                                            )
                                                            : "hover:bg-white border border-transparent shadow-sm"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-full flex items-center justify-center border shadow-sm transition-transform",
                                                            res.type === 'center' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
                                                        )}>
                                                            {res.type === 'center' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 leading-tight">{res.name}</p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5">{res.subtitle}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] uppercase tracking-wider font-bold h-5 bg-white",
                                                        res.type === 'center' ? "text-emerald-600 border-emerald-100" : "text-blue-600 border-blue-100"
                                                    )}>{res.type}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <FileText className={cn(
                                            "h-4 w-4",
                                            isColleagueSearch ? "text-cyan-600" : isPartnerSearch ? "text-indigo-600" : "text-teal-600"
                                        )} />
                                        {isColleagueSearch ? 'Connection Message' :
                                            isPartnerSearch ? 'Collaboration Proposal' :
                                                'Reason / Optional Notes'}
                                    </Label>
                                    <Input
                                        id="reason"
                                        placeholder={isColleagueSearch ? "E.g. Interested in your research on..." :
                                            isPartnerSearch ? "E.g. Inquiring about diagnostic capacity..." :
                                                "E.g. Consultation regarding test results"}
                                        className={cn(
                                            "rounded-2xl h-13 border-gray-200 transition-all text-sm shadow-sm",
                                            isColleagueSearch ? "focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" :
                                                isPartnerSearch ? "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" :
                                                    "focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                                        )}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>
                            </div>

                            <DialogFooter className="bg-gray-50/80 p-6 pb-24 sm:pb-8 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
                                <Button
                                    variant="ghost"
                                    className="rounded-2xl h-12 px-6 font-bold text-gray-500 hover:bg-gray-100 transition-all flex-1"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSearchTerm('');
                                        setSearchResults([]);
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    className={cn(
                                        "rounded-2xl h-12 px-10 font-bold shadow-lg transition-all active:scale-95 flex-1",
                                        isColleagueSearch ? "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-100" :
                                            isPartnerSearch ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100" :
                                                "bg-teal-600 hover:bg-teal-700 shadow-teal-100"
                                    )}
                                    onClick={handleConfirm}
                                    disabled={!selectedUser}
                                >
                                    {currentAction === 'Call' || currentAction === 'Create Call' ? 'Confirm Call' :
                                        currentAction === 'Diagnostic Request' ? 'Proceed to Request' : 'Continue'}
                                    <Plus className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            })()}

            <ServiceOfferModal
                isOpen={isServiceOfferModalOpen}
                onClose={() => setIsServiceOfferModalOpen(false)}
            />

            <MultiServiceRequestModal
                isOpen={isMultiServiceModalOpen}
                onClose={() => setIsMultiServiceModalOpen(false)}
                initialService={initialServiceForModal}
            />

            <BloodWorkflowModal
                isOpen={isBloodWorkflowModalOpen}
                onClose={() => setIsBloodWorkflowModalOpen(false)}
            />

            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
            />

            <TreatmentPlanModal
                isOpen={isTreatmentPlanModalOpen}
                onClose={() => setIsTreatmentPlanModalOpen(false)}
            />

            <MedicalReportModal
                isOpen={isMedicalReportModalOpen}
                onClose={() => {
                    setIsMedicalReportModalOpen(false);
                    setSelectedUser('');
                }}
                patientData={selectedUserData as any}
            />

            <PharmacyWorkflowModal
                isOpen={isPharmacyModalOpen}
                onClose={() => {
                    setIsPharmacyModalOpen(false);
                    setSelectedUser('');
                }}
                type={pharmacyModalType}
                patientData={selectedUserData as any}
            />

            <BiotechWorkflowModal
                isOpen={isBiotechModalOpen}
                onClose={() => {
                    setIsBiotechModalOpen(false);
                    setSelectedUser('');
                }}
                type={biotechModalType}
            />
        </Card>
    );
};
