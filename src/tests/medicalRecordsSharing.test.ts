import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { supabase } from '@/lib/supabase-client';
import { medicalRecordService } from '@/services/medicalRecordService';

// Mock supabase client
vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'mock-request-id' },
            error: null
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'mock-id' },
            error: null
          }))
        })),
        in: vi.fn(() => ({
          data: [{ id: 'mock-id' }],
          error: null
        })),
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [{ id: 'mock-id' }],
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: { id: 'mock-id' },
          error: null
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'mock-user-id' } },
        error: null
      }))
    }
  }
}));

// Mock notification service
vi.mock('@/services/notificationService', () => ({
  addNotification: vi.fn(() => Promise.resolve({ success: true }))
}));

// Mock medicalRecordService
vi.mock('@/services/medicalRecordService', () => ({
  medicalRecordService: {
    requestMedicalRecords: vi.fn(() => Promise.resolve({
      success: true,
      message: 'Medical record request submitted successfully',
      request_id: 'mock-request-id'
    })),
    respondToMedicalRecordRequest: vi.fn(() => Promise.resolve({
      success: true,
      message: 'Medical record request responded to successfully',
      share_id: 'mock-share-id',
      expiry_date: '2023-12-31'
    })),
    getMedicalRecordRequest: vi.fn(() => Promise.resolve({
      id: 'mock-id',
      patient_name: 'Test Patient',
      from_center_name: 'Test Center A',
      to_center_name: 'Test Center B',
      status: 'pending'
    })),
    listMedicalRecordRequests: vi.fn(() => Promise.resolve([
      { id: 'mock-id', status: 'pending' }
    ])),
    getSharedMedicalRecords: vi.fn(() => Promise.resolve([
      { id: 'mock-id', patient_name: 'Test Patient' }
    ])),
    revokeAccess: vi.fn(() => Promise.resolve(true)),
    logMedicalRecordAccess: vi.fn(() => Promise.resolve('mock-log-id')),
    updateSharingPreferences: vi.fn(() => Promise.resolve(true))
  }
}));

describe('Medical Records Sharing Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should request medical records successfully', async () => {
    const result = await medicalRecordService.requestMedicalRecords({
      patient_id: 'patient-id',
      from_center_id: 'from-center-id',
      to_center_id: 'to-center-id',
      purpose: 'For treatment purposes',
      access_duration_days: 30,
      specific_records: null
    });

    expect(result.success).toBe(true);
    expect(result).toHaveProperty('request_id', 'mock-request-id');
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_requests');
  });

  it('should respond to a medical record request', async () => {
    const result = await medicalRecordService.respondToMedicalRecordRequest({
      request_id: 'request-id',
      status: 'approved',
      response_notes: 'Approved for treatment',
      data_scope: { all: true },
      access_level: 'read'
    });

    expect(result.success).toBe(true);
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_requests');
    // Should also call medical_record_shares when approving
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_shares');
  });

  it('should get a medical record request details', async () => {
    const result = await medicalRecordService.getMedicalRecordRequest('request-id');

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('id', 'mock-id');
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_requests');
  });

  it('should list medical record requests', async () => {
    const result = await medicalRecordService.listMedicalRecordRequests({
      center_id: 'center-id'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_requests');
  });

  it('should get shared medical records', async () => {
    const result = await medicalRecordService.getSharedMedicalRecords({
      center_id: 'center-id'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_shares');
  });

  it('should revoke access to a shared medical record', async () => {
    const result = await medicalRecordService.revokeAccess('share-id');

    expect(result).toBe(true);
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_shares');
  });

  it('should log medical record access', async () => {
    const result = await medicalRecordService.logMedicalRecordAccess(
      'share-id',
      'staff-id',
      'view',
      { source: 'web' }
    );

    expect(result).not.toBeNull();
    expect(supabase?.from).toHaveBeenCalledWith('medical_record_access_logs');
  });

  it('should update patient sharing preferences', async () => {
    const preferences = {
      auto_approve_trusted: true,
      trusted_centers: ['center-id-1', 'center-id-2'],
      default_access_duration_days: 45,
      notify_on_access: true
    };

    const result = await medicalRecordService.updateSharingPreferences('patient-id', preferences);

    expect(result).toBe(true);
    expect(supabase?.from).toHaveBeenCalledWith('patients');
  });
}); 