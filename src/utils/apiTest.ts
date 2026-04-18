// Simple API test utility to verify backend connectivity
import { apiClient } from '@/lib/api-client';

export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await apiClient.get('/health');
    console.log('✅ Health check response:', healthResponse);
    
    return {
      success: true,
      message: 'API connection successful',
      health: healthResponse
    };
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    };
  }
};

export const testAppointmentEndpoints = async () => {
  try {
    console.log('🧪 Testing appointment endpoints...');
    
    // Test getting appointments (this will fail if not authenticated)
    const appointmentsResponse = await apiClient.get('/appointments?limit=1');
    console.log('✅ Appointments endpoint response:', appointmentsResponse);
    
    return {
      success: true,
      message: 'Appointment endpoints accessible',
      data: appointmentsResponse
    };
  } catch (error) {
    console.error('❌ Appointment endpoints test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    };
  }
};

// Add this to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testApi = {
    connection: testApiConnection,
    appointments: testAppointmentEndpoints
  };
}
