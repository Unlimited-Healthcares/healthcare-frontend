import { toast } from 'sonner';
import { appointmentService } from '@/services/appointmentService';
import { healthRecordsApi } from '@/services/healthRecordsApi';
import { emergencyService } from '@/services/emergencyService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { referralService, ReferralType } from '@/services/referralService';
import { discoveryService } from '@/services/discoveryService';
import { careTaskService } from '@/services/careTaskService';
import { integrationsService } from '@/services/integrationsService';

export const useQuickActionHandler = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const handleQuickAction = async (action: string, data?: any) => {
        console.log(`🚀 Executing Quick Action: ${action}`, data);

        const recipientId = data?.user === 'general' ? undefined : data?.user;
        const reason = data?.reason || '';

        try {
            // "Under Review" actions - mostly navigation or information viewing
            if (action.startsWith('Review ')) {
                const item = action.replace('Review ', '');
                toast.info(`Opening review for ${item}...`);
                // Navigation logic would go here if we had a central router handler
                return;
            }

            // "Under Create" & Primary actions
            switch (action) {
                case 'Appointment Schedule':
                case 'Create Appointment Schedule':
                case 'Create Call':
                case 'Call':
                case 'Treatment':
                case 'Create Treatment':
                case 'Create Treatment Schedule':
                case 'Treatment Schedule':
                    if (!recipientId) {
                        toast.error("Please select a recipient for this proposal");
                        return;
                    }

                    const typeMap: Record<string, any> = {
                        'Appointment Schedule': 'appointment_proposal',
                        'Create Appointment Schedule': 'appointment_proposal',
                        'Call': 'call_request',
                        'Create Call': 'call_request',
                        'Treatment': 'treatment_proposal',
                        'Create Treatment': 'treatment_proposal',
                        'Treatment Schedule': 'treatment_proposal',
                        'Create Treatment Schedule': 'treatment_proposal'
                    };

                    // Special check for ambulance service - Instant Consultation
                    const isAmbulance = user?.roles?.includes('ambulance_service');
                    if (isAmbulance && (action === 'Call' || action === 'Create Call')) {
                        try {
                            const confirmed = data?.confirmed || window.confirm("Initiate Emergency Consultation? This will immediately debit your wallet to unlock direct lines.");
                            if (!confirmed) return;

                            toast.loading('Processing instant consultation fee...', { id: 'emergency-payment' });

                            // 1. Create emergency request
                            const request = await discoveryService.createRequest({
                                recipientId,
                                requestType: 'consultation_request',
                                message: reason || `EMERGENCY AMBULANCE CONSULTATION: Initiating immediate contact for patient inbound.`,
                                metadata: {
                                    isEmergency: true,
                                    immediateAccess: true,
                                    centerId: profile?.center_id
                                }
                            });

                            // 2. Process immediate wallet debit
                            // Using standard emergency session fee if price not provided in data
                            const amount = data?.price || 5000;
                            const currency = data?.currency || 'USD';

                            await integrationsService.processPayment({
                                amount,
                                currency,
                                patientId: null,
                                centerId: (profile?.center_id || (user as any)?.centerId) || null,
                                description: `INSTANT EMERGENCY CONSULTATION FEE - AMBULANCE UNIT`,
                                paymentMethod: 'wallet',
                                metadata: { requestId: request.id, type: 'emergency_consultation' }
                            });

                            toast.success("Consultation unlocked! Dialing recipient...", { id: 'emergency-payment' });

                            // 3. Initiate call if phone is available
                            if (data?.phone) {
                                window.open(`tel:${data.phone}`);
                            } else {
                                toast.info("Emergency line unlocked. You may now call from the recipient's profile.");
                            }
                            return;
                        } catch (err: any) {
                            toast.error(err.message || 'Failed to initiate emergency consultation.', { id: 'emergency-payment' });
                            return;
                        }
                    }

                    await discoveryService.createRequest({
                        recipientId,
                        requestType: typeMap[action] || 'consultation_request',
                        message: reason || `New ${action} proposal from ${profile?.name || user?.name}`,
                        metadata: {
                            title: action,
                            initiatedBy: user?.id,
                            centerId: profile?.center_id
                        }
                    });
                    toast.success("Interactive proposal sent! Waiting for recipient to schedule.");
                    break;

                case 'Create Medical Report':
                case 'Medical Report':
                    if (!recipientId) {
                        toast.error("Please select a recipient");
                        return;
                    }
                    await discoveryService.createRequest({
                        recipientId,
                        requestType: 'medical_report_proposal',
                        message: reason || `Proposal to create a medical report from ${profile?.name || user?.name}`,
                        metadata: { title: 'Medical Report', centerId: profile?.center_id }
                    });
                    toast.success("Medical report proposal sent");
                    break;
                case 'Create Prescription & Diagnosis':
                case 'Prescription & Diagnosis':
                    if (!recipientId) {
                        toast.error("Please select a recipient");
                        return;
                    }
                    await discoveryService.createRequest({
                        recipientId,
                        requestType: 'prescription_proposal',
                        message: reason || `Proposal for prescription and diagnosis from ${profile?.name || user?.name}`,
                        metadata: { title: 'Prescription & Diagnosis', centerId: profile?.center_id }
                    });
                    toast.success("Prescription/Diagnosis proposal sent");
                    break;

                case 'Call Ambulance':
                    await emergencyService.requestAmbulance({
                        severity: 'high',
                        reason: reason || 'Emergency call from dashboard',
                        location: {
                            address: 'Current Facility',
                            coordinates: [0, 0]
                        },
                        contactPhone: profile?.phoneNumber || ''
                    } as any);
                    toast.success("Ambulance request dispatched");
                    break;

                case 'Transfer Patient':
                    if (!recipientId) {
                        toast.error("Please select a recipient facility or patient");
                        return;
                    }
                    await discoveryService.createRequest({
                        recipientId,
                        requestType: 'transfer_patient',
                        message: reason || `Proposal to transfer patient from ${profile?.name || user?.name}`,
                        metadata: {
                            title: 'Transfer Patient',
                            centerId: profile?.center_id,
                            initiatedBy: user?.id
                        }
                    });
                    toast.success("Patient transfer proposal sent for acceptance");
                    break;

                case 'Refer':
                    if (!recipientId) {
                        toast.error("Please select a recipient for the referral");
                        return;
                    }
                    await discoveryService.createRequest({
                        recipientId,
                        requestType: 'referral',
                        message: reason || `Referral proposal from ${profile?.name || user?.name}`,
                        metadata: {
                            title: 'Specialist Referral',
                            centerId: profile?.center_id,
                            initiatedBy: user?.id
                        }
                    });
                    toast.success("Referral proposal sent and workflow initiated");
                    break;

                case 'ClinicalRequest':
                case 'CONNECT COLLEAGUES':
                case 'Contact':
                case 'Contact Patient':
                    if (!recipientId) {
                        toast.error("Please select a recipient");
                        return;
                    }
                    await discoveryService.createRequest({
                        recipientId,
                        requestType: (data?.category === 'referral' || String(action).includes('Refer')) ? 'referral' : 'consultation_request',
                        message: reason || `${action} initiated by ${profile?.name || user?.name}`,
                        metadata: {
                            category: data?.category,
                            title: action,
                            centerId: profile?.center_id
                        }
                    });
                    toast.success(`${action} proposal sent successfully`);
                    break;


                case 'Care Task':
                case 'Create Care Task':
                case 'Assign Care Task':
                    if (!recipientId) {
                        toast.error("Please select a recipient");
                        return;
                    }
                    await discoveryService.createRequest({
                        recipientId,
                        requestType: 'care_task',
                        message: reason || 'New care task assignment',
                        metadata: { title: 'Care Task Proposal', centerId: profile?.center_id }
                    });
                    toast.success("Care task proposal sent for acceptance");
                    break;

                case 'Create Request':
                    if (!recipientId) {
                        toast.error("Please select a recipient");
                        return;
                    }
                    await discoveryService.createRequest({
                        recipientId,
                        requestType: 'consultation_request',
                        message: reason || 'New request initiated',
                    });
                    toast.success("General request proposal sent");
                    break;

                case 'Call a Doctor':
                    if (recipientId) {
                        await discoveryService.createRequest({
                            recipientId,
                            requestType: 'call_request',
                            message: reason || `Call request from ${profile?.name || user?.name}`,
                        });
                        toast.success("Call request sent");
                    } else {
                        navigate('/discovery?type=doctor&service=consultation');
                    }
                    break;

                case 'Search for Service':
                    navigate('/discovery');
                    break;

                case 'Emergency Assistance':
                    navigate('/emergency');
                    break;

                case 'Book Appointment':
                    if (recipientId) {
                        await discoveryService.createRequest({
                            recipientId,
                            requestType: 'appointment_proposal',
                            message: reason || `Appointment request from ${profile?.name || user?.name}`,
                        });
                        toast.success("Appointment request sent");
                    } else {
                        navigate('/discovery?service=consultation');
                    }
                    break;

                case 'Diagnostics':
                    if (recipientId) {
                        await discoveryService.createRequest({
                            recipientId,
                            requestType: 'consultation_request',
                            message: reason || `Diagnostics request from ${profile?.name || user?.name}`,
                            metadata: { category: 'diagnostics' }
                        });
                        toast.success("Diagnostics request sent");
                    } else {
                        navigate('/discovery?type=center&service=diagnostics');
                    }
                    break;

                case 'Pharmacy':
                    if (recipientId) {
                        await discoveryService.createRequest({
                            recipientId,
                            requestType: 'consultation_request',
                            message: reason || `Pharmacy request from ${profile?.name || user?.name}`,
                            metadata: { category: 'pharmacy' }
                        });
                        toast.success("Pharmacy request sent");
                    } else {
                        navigate('/discovery?type=center&service=pharmacy');
                    }
                    break;

                case 'Pricing':
                    navigate('/pricing');
                    break;

                default:
                    toast.info(`${action} initiated`);
                    break;
            }
        } catch (error: any) {
            console.error(`Quick Action Error (${action}):`, error);
            toast.error(error.message || `Failed to perform ${action}`);
        }
    };

    return { handleQuickAction };
};
