import { apiClient } from '@/lib/api-client';
import { auditService } from './auditService';
import { toast } from 'sonner';

export const emergencyEscalation = {
    /**
     * Broadcasts emergency data to the nearest center and notifies ER MDTs.
     */
    triggerEmergency: async (patientId: string, location: any, phoneNumber: string) => {
        try {
            // 1. Log the emergency trigger in the audit trail (MANDATORY)
            await auditService.logAction('EMERGENCY_ESCALATION_TRIGGERED', patientId, {
                location,
                phoneNumber,
                timestamp: new Date().toISOString()
            });

            // 2. Transmit data to nearest center via API
            // In a real system, the backend would use the location to find the nearest center
            const response = await apiClient.post('/emergency/broadcast', {
                patientId,
                location,
                phoneNumber,
                type: 'CODE_RED',
                broadcastRadius: '10km' // Logic handled server-side
            });

            // 3. UI Feedback
            toast.error("EMERGENCY SIGNAL BROADCAST", {
                description: "Your location and contact data have been relayed to the nearest ER center.",
                duration: 10000,
                style: { background: '#ef4444', color: 'white', border: 'none' }
            });

            return response;
        } catch (error) {
            console.error("Emergency escalation failed:", error);
            // Fallback: Notify user to call manual emergency number
            toast.error("BROADCAST FAILURE", {
                description: "Automatic escalation failed. Please call 911 / Local Emergency immediately.",
                duration: 0,
            });
            throw error;
        }
    }
};
