import { apiClient } from '@/lib/api-client';

export interface PaymentData {
  amount: number;
  currency: string;
  patientId: string | null;
  centerId: string | null;
  description: string;
  paymentMethod: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  transactionId?: string;
  errorMessage?: string;
  redirectUrl?: string;
}

class IntegrationsService {
  private apiClient = apiClient;

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    return this.apiClient.post<PaymentResult>('/integrations/payments/process', paymentData);
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    return this.apiClient.get<PaymentResult>(`/integrations/payments/${paymentId}/status`);
  }

  async verifyInsurance(insuranceData: any) {
    return this.apiClient.post<any>('/integrations/insurance/verify', insuranceData);
  }

  async sendSms(smsData: { to: string; message: string; type?: string }) {
    return this.apiClient.post<any>('/integrations/sms/send', smsData);
  }
}

export const integrationsService = new IntegrationsService();
export default integrationsService;

