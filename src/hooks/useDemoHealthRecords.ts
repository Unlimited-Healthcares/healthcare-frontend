import { useMemo } from 'react';
import { demoCategories, demoRecords } from '@/data/demoHealthRecords';
import { SearchFilters } from '@/types/health-records';

export const useDemoHealthRecords = (filters?: SearchFilters) => {
  const filteredRecords = useMemo(() => {
    let filtered = [...demoRecords];

    // Filter by search query
    if (filters?.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(query) ||
        record.description?.toLowerCase().includes(query) ||
        record.patientName?.toLowerCase().includes(query) ||
        record.providerName?.toLowerCase().includes(query) ||
        record.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      filtered = filtered.filter(record => 
        filters.categoryIds!.includes(record.categoryId || '')
      );
    }

    // Filter by record type
    if (filters?.recordTypes && filters.recordTypes.length > 0) {
      filtered = filtered.filter(record => 
        filters.recordTypes!.includes(record.recordType)
      );
    }

    // Filter by status
    if (filters?.status && filters.status.length > 0) {
      filtered = filtered.filter(record => 
        filters.status!.includes(record.status)
      );
    }

    // Filter by priority
    if (filters?.priority && filters.priority.length > 0) {
      filtered = filtered.filter(record => 
        filters.priority!.includes(record.priority || 'normal')
      );
    }

    // Filter by confidentiality level
    if (filters?.confidentialityLevel && filters.confidentialityLevel.length > 0) {
      filtered = filtered.filter(record => 
        filters.confidentialityLevel!.includes(record.confidentialityLevel || 'restricted')
      );
    }

    // Filter by has files
    if (filters?.hasFiles !== undefined) {
      filtered = filtered.filter(record => 
        filters.hasFiles ? (record.files && record.files.length > 0) : (!record.files || record.files.length === 0)
      );
    }

    // Filter by shared records
    if (filters?.isShared !== undefined) {
      filtered = filtered.filter(record => 
        filters.isShared ? (record.sharedWith && record.sharedWith.length > 0) : (!record.sharedWith || record.sharedWith.length === 0)
      );
    }

    return filtered;
  }, [filters]);

  const stats = useMemo(() => ({
    totalRecords: demoRecords.length,
    sharedRecords: demoRecords.filter(r => r.sharedWith && r.sharedWith.length > 0).length,
    pendingRequests: 3, // Mock data
    recentActivity: 8 // Mock data
  }), []);

  return {
    records: filteredRecords,
    categories: demoCategories,
    stats,
    isLoading: false,
    error: null
  };
};
