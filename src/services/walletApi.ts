import { apiClient } from '@/lib/api-client';

export const walletApi = {
  getBalance: async () => {
    const response = await apiClient.get<any>('/wallets/balance');
    return response?.data || response;
  },

  completeOnboarding: async (minimumAmount: number, currency?: string) => {
    const response = await apiClient.patch<any>('/wallets/onboarding', { minimumAmount, currency });
    return response?.data || response;
  },

  initializeDeposit: async (amount: number, redirectUrl: string, paymentMethod: string = 'paystack') => {
    const response = await apiClient.post<any>('/wallets/deposit', { amount, redirectUrl, paymentMethod });
    return response?.data || response;
  },

  initializeActivation: async (redirectUrl: string, paymentMethod: string = 'paystack') => {
    const response = await apiClient.post<any>('/wallets/activate', { redirectUrl, paymentMethod });
    return response?.data || response;
  },

  updateSettings: async (data: {
    minimumAmount?: number,
    currency?: string,
    isAutoTopUpEnabled?: boolean,
    rechargeThreshold?: number,
    rechargeAmount?: number,
    monthlySpendMax?: number
  }) => {
    const response = await apiClient.patch<any>('/wallets/settings', data);
    return response?.data || response;
  },

  verifyDeposit: async (reference: string) => {
    const response = await apiClient.get<any>(`/wallets/verify/${reference}`);
    return response?.data || response;
  },

  getHistory: async () => {
    const response = await apiClient.get<any>('/wallets/history');
    return response?.data || response;
  },
};
