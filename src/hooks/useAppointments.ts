import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Appointment,
  AppointmentFilters,
  CreateAppointmentDto,
  UpdateAppointmentDto
} from '@/types/appointments';
import { appointmentService } from '@/services/appointmentService';

// Hook for managing appointments
export const useAppointments = (initialFilters?: AppointmentFilters) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Load appointments
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔎 useAppointments.loadAppointments filters:', filters);
      const response = await appointmentService.getAppointments(filters);
      console.log('📦 useAppointments.loadAppointments response:', {
        total: response?.data?.length || 0,
        pagination: response?.pagination,
        first: response?.data?.[0]
      });
      // Ensure appointments is always an array
      setAppointments(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
      setError(errorMessage);
      toast.error(errorMessage);
      // Set fallback data when API fails
      setAppointments([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create appointment
  const createAppointment = useCallback(async (appointmentData: CreateAppointmentDto) => {
    try {
      const newAppointment = await appointmentService.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      toast.success('Appointment created successfully');
      return newAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updateData: UpdateAppointmentDto) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointment(id, updateData);
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      toast.success('Appointment updated successfully');
      return updatedAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Cancel appointment
  const cancelAppointment = useCallback(async (id: string, reason: string, cancelledBy?: string) => {
    try {
      const cancelledAppointment = await appointmentService.cancelAppointment(id, reason, cancelledBy);
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? cancelledAppointment : apt)
      );
      toast.success('Appointment cancelled successfully');
      return cancelledAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Confirm appointment
  const confirmAppointment = useCallback(async (id: string, message?: string) => {
    try {
      const confirmedAppointment = await appointmentService.confirmAppointment(id, undefined, message);
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? confirmedAppointment : apt)
      );
      toast.success('Appointment confirmed successfully');
      return confirmedAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      toast.success('Appointment deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AppointmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Load appointments on mount and when filters change
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Keep internal filters in sync when initialFilters (from props) change
  useEffect(() => {
    if (!initialFilters) return;
    setFilters(prev => {
      const next = { ...prev, ...initialFilters } as AppointmentFilters;
      return next;
    });
  }, [initialFilters?.centerId, initialFilters?.patientId, initialFilters?.providerId, initialFilters?.status, initialFilters?.dateFrom, initialFilters?.dateTo, initialFilters?.page, initialFilters?.limit]);

  return {
    appointments,
    loading,
    error,
    filters,
    pagination,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAppointment,
    deleteAppointment,
    updateFilters,
    clearFilters,
    refetch: loadAppointments
  };
};

// Hook for appointment statistics
export const useAppointmentStats = (appointments: Appointment[]) => {
  // Add null/undefined check to prevent errors
  const safeAppointments = appointments || [];

  const stats = {
    total: safeAppointments.length,
    pending: safeAppointments.filter(apt =>
      apt.confirmationStatus === 'pending' &&
      new Date(apt.appointmentDate) > new Date()
    ).length,
    upcoming: safeAppointments.filter(apt =>
      new Date(apt.appointmentDate) > new Date() &&
      apt.appointmentStatus !== 'cancelled' &&
      apt.confirmationStatus === 'confirmed'
    ).length,
    completed: safeAppointments.filter(apt =>
      apt.appointmentStatus === 'completed'
    ).length,
    cancelled: safeAppointments.filter(apt =>
      apt.appointmentStatus === 'cancelled'
    ).length
  };

  return stats;
};

// Hook for upcoming appointments
export const useUpcomingAppointments = (appointments: Appointment[], limit: number = 5) => {
  // Add null/undefined check to prevent errors
  const safeAppointments = appointments || [];

  const upcoming = safeAppointments
    .filter(apt =>
      new Date(apt.appointmentDate) > new Date() &&
      apt.appointmentStatus !== 'cancelled' &&
      apt.confirmationStatus === 'confirmed'
    )
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, limit);

  return upcoming;
};

// Hook for past appointments
export const usePastAppointments = (appointments: Appointment[], limit: number = 10) => {
  // Add null/undefined check to prevent errors
  const safeAppointments = appointments || [];

  const past = safeAppointments
    .filter(apt =>
      new Date(apt.appointmentDate) < new Date() ||
      apt.appointmentStatus === 'completed'
    )
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
    .slice(0, limit);

  return past;
};
