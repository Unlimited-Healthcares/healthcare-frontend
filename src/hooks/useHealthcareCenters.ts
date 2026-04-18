import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  HealthcareCenter,
  CenterService,
  CenterStaff,
  CenterFilters,
  CenterType,
  CENTER_TYPE_LABELS
} from '@/types/healthcare-centers';
import { healthcareCentersService, centerDiscoveryUtils } from '@/services/healthcareCentersService';

// Hook for center discovery
export const useCenters = (initialFilters?: CenterFilters) => {
  const [centers, setCenters] = useState<HealthcareCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<HealthcareCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CenterFilters>(initialFilters || {});
  const [centerTypes, setCenterTypes] = useState<Array<{ value: string; label: string }>>([]);

  // Load center types
  const loadCenterTypes = useCallback(async () => {
    try {
      const types = await healthcareCentersService.getCenterTypes();
      setCenterTypes(types);
    } catch (err) {
      console.error('Failed to load center types:', err);
    }
  }, []);

  // Load centers based on filters
  const loadCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let centersData: HealthcareCenter[] = [];
      
      // Load centers based on type filter
      if (filters.type) {
        centersData = await healthcareCentersService.getCentersByType(filters.type);
      } else {
        // Load all centers (this might be admin-only, so we'll try specific types)
        const typePromises = Object.values(CenterType).map(type => 
          healthcareCentersService.getCentersByType(type).catch(() => [])
        );
        const results = await Promise.all(typePromises);
        centersData = results.flat();
      }
      
      setCenters(centersData);
      
      // Apply additional filters
      const filtered = centerDiscoveryUtils.filterCenters(centersData, filters);
      
      // Sort by distance if coordinates provided
      if (filters.latitude && filters.longitude) {
        const sorted = centerDiscoveryUtils.sortCentersByDistance(
          filtered, 
          filters.latitude, 
          filters.longitude
        );
        setFilteredCenters(sorted);
      } else {
        setFilteredCenters(filtered);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load centers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CenterFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Search centers
  const searchCenters = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Filter by type
  const filterByType = useCallback((type: string) => {
    updateFilters({ type });
  }, [updateFilters]);

  // Filter by location
  const filterByLocation = useCallback((city?: string, state?: string) => {
    updateFilters({ city, state });
  }, [updateFilters]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadCenterTypes();
  }, [loadCenterTypes]);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  return {
    centers,
    filteredCenters,
    loading,
    error,
    filters,
    centerTypes,
    updateFilters,
    clearFilters,
    searchCenters,
    filterByType,
    filterByLocation,
    refetch: loadCenters
  };
};

// Hook for center details
export const useCenterDetails = (centerId: string) => {
  const [center, setCenter] = useState<HealthcareCenter | null>(null);
  const [services, setServices] = useState<CenterService[]>([]);
  const [staff, setStaff] = useState<CenterStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCenterDetails = useCallback(async () => {
    if (!centerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Always try to get center data first - this is critical
      const centerData = await healthcareCentersService.getCenterById(centerId);
      setCenter(centerData);
      
      // Try to get services and staff data, but don't fail if they error
      try {
        const servicesData = await healthcareCentersService.getCenterServices(centerId);
        setServices(servicesData);
      } catch (servicesErr) {
        console.warn('Failed to load center services:', servicesErr);
        setServices([]);
      }
      
      try {
        const staffData = await healthcareCentersService.getCenterStaff(centerId);
        setStaff(staffData);
      } catch (staffErr) {
        console.warn('Failed to load center staff:', staffErr);
        setStaff([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load center details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    loadCenterDetails();
  }, [loadCenterDetails]);

  return {
    center,
    services,
    staff,
    loading,
    error,
    refetch: loadCenterDetails
  };
};

// Hook for center services
export const useCenterServices = (centerId: string) => {
  const [services, setServices] = useState<CenterService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    if (!centerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const servicesData = await healthcareCentersService.getCenterServices(centerId);
      setServices(servicesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  const createService = useCallback(async (serviceData: any) => {
    try {
      const newService = await healthcareCentersService.createCenterService(centerId, serviceData);
      setServices(prev => [...prev, newService]);
      toast.success('Service created successfully');
      return newService;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service';
      toast.error(errorMessage);
      throw err;
    }
  }, [centerId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    error,
    createService,
    refetch: loadServices
  };
};

// Hook for center staff
export const useCenterStaff = (centerId: string) => {
  const [staff, setStaff] = useState<CenterStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    if (!centerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const staffData = await healthcareCentersService.getCenterStaff(centerId);
      setStaff(staffData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load staff';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  const addStaffMember = useCallback(async (staffData: { userId: string; role: string }) => {
    try {
      const newStaff = await healthcareCentersService.addStaffMember(centerId, staffData);
      setStaff(prev => [...prev, newStaff]);
      toast.success('Staff member added successfully');
      return newStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add staff member';
      toast.error(errorMessage);
      throw err;
    }
  }, [centerId]);

  const removeStaffMember = useCallback(async (staffId: string) => {
    try {
      await healthcareCentersService.removeStaffMember(centerId, staffId);
      setStaff(prev => prev.filter(member => member.id !== staffId));
      toast.success('Staff member removed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove staff member';
      toast.error(errorMessage);
      throw err;
    }
  }, [centerId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  return {
    staff,
    loading,
    error,
    addStaffMember,
    removeStaffMember,
    refetch: loadStaff
  };
};

// Utility hook for center type information
export const useCenterTypeInfo = () => {
  const getCenterTypeLabel = useCallback((type: string) => {
    return CENTER_TYPE_LABELS[type] || type;
  }, []);

  const getServiceType = useCallback((center: HealthcareCenter) => {
    return centerDiscoveryUtils.getServiceType(center);
  }, []);

  return {
    getCenterTypeLabel,
    getServiceType
  };
};
