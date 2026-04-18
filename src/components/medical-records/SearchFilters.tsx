import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '@/types/health-records';
import { useCategories } from '@/hooks/useHealthRecords';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: (query: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localQuery, setLocalQuery] = useState(filters.query || '');
  const { data: categories = [] } = useCategories();
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Update local query when filters.query changes (e.g. from Clear Filters)
  React.useEffect(() => {
    setLocalQuery(filters.query || '');
  }, [filters.query]);

  // Debounced search logic
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (localQuery !== (filters.query || '')) {
        onSearch(localQuery);
        handleFilterChange('query', localQuery);
      }
    }, 600); // 600ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      onSearch(localQuery);
      handleFilterChange('query', localQuery);
    }
  };

  const recordTypes = [
    { value: 'lab_result', label: 'Lab Results' },
    { value: 'imaging', label: 'Radiology' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'consultation', label: 'Consultations' },
    { value: 'procedure', label: 'Procedures' },
    { value: 'vaccination', label: 'Vaccinations' },
    { value: 'allergy', label: 'Allergies' },
    { value: 'vital_signs', label: 'Vital Signs' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'referral', label: 'Referrals' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const confidentialityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'restricted', label: 'Restricted' },
    { value: 'confidential', label: 'Confidential' },
    { value: 'secret', label: 'Secret' }
  ];

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(value =>
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  ).length;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-soft border border-slate-200 p-4 md:p-8 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
            <Search className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Search & Filter Records</h3>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none">
                  {activeFilterCount} active parameters
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-slate-100"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-premium font-black text-[10px] uppercase tracking-widest"
          >
            <Filter className={`w-3.5 h-3.5 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            <span>{showAdvanced ? 'Hide' : 'Advanced'}</span>
          </button>
        </div>
      </div>

      {/* Main Search */}
      <div className="mb-8">
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-slate-50 border border-slate-100 group-focus-within:bg-primary/10 transition-colors">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Query records, metadata, or diagnostic temporal markers..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all font-medium placeholder:text-slate-400 border-2"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Category Node', key: 'categoryIds', val: filters.categoryIds?.[0] || '', options: categories.map(c => ({ v: c.id, l: c.name })), placeholder: 'All Categories' },
          { label: 'Record Type', key: 'recordTypes', val: filters.recordTypes?.[0] || '', options: recordTypes.map(t => ({ v: t.value, l: t.label })), placeholder: 'All Types' },
          { label: 'Sync Status', key: 'status', val: filters.status?.[0] || '', options: statusOptions.map(s => ({ v: s.value, l: s.label })), placeholder: 'All Status' },
          { label: 'Priority Level', key: 'priority', val: filters.priority?.[0] || '', options: priorityOptions.map(p => ({ v: p.value, l: p.label })), placeholder: 'All Priorities' }
        ].map((f) => (
          <div key={f.key} className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              {f.label}
            </label>
            <select
              value={f.val}
              onChange={(e) => handleFilterChange(f.key as any, e.target.value ? [e.target.value] : [])}
              className="w-full px-4 py-3 bg-slate-50/50 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 text-sm border-2 cursor-pointer hover:bg-white"
            >
              <option value="">{f.placeholder}</option>
              {f.options.map((opt: any) => (
                <option key={opt.v} value={opt.v}>
                  {opt.l}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID
              </label>
              <input
                type="text"
                placeholder="Enter patient ID"
                value={filters.patientId || ''}
                onChange={(e) => handleFilterChange('patientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider ID
              </label>
              <input
                type="text"
                placeholder="Enter provider ID"
                value={filters.providerId || ''}
                onChange={(e) => handleFilterChange('providerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidentiality Level
            </label>
            <select
              value={filters.confidentialityLevel?.[0] || ''}
              onChange={(e) => handleFilterChange('confidentialityLevel', e.target.value ? [e.target.value] : [])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              {confidentialityOptions.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hasFiles || false}
                onChange={(e) => handleFilterChange('hasFiles', e.target.checked || undefined)}
                className="text-teal-600 focus:ring-teal-500 rounded"
              />
              <span className="text-sm text-gray-700">Has Files</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.isShared || false}
                onChange={(e) => handleFilterChange('isShared', e.target.checked || undefined)}
                className="text-teal-600 focus:ring-teal-500 rounded"
              />
              <span className="text-sm text-gray-700">Shared Records</span>
            </label>
          </div>
        </div>
      )}

      {/* Quick Filter Tags */}
      <div className="mt-8 pt-6 border-t border-slate-100 overflow-hidden -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Filter Nodes</span>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 -mb-2">
          <button
            onClick={() => handleFilterChange('recordTypes', filters.recordTypes?.[0] === 'lab_result' ? [] : ['lab_result'])}
            className={`flex-shrink-0 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm border ${filters.recordTypes?.[0] === 'lab_result'
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
              : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
              }`}
          >
            Lab Results
          </button>
          <button
            onClick={() => handleFilterChange('recordTypes', filters.recordTypes?.[0] === 'imaging' ? [] : ['imaging'])}
            className={`flex-shrink-0 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm border ${filters.recordTypes?.[0] === 'imaging'
              ? 'bg-purple-600 text-white border-purple-600 shadow-purple-200'
              : 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100'
              }`}
          >
            Radiology
          </button>
          <button
            onClick={() => handleFilterChange('priority', filters.priority?.[0] === 'urgent' ? [] : ['urgent'])}
            className={`flex-shrink-0 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm border ${filters.priority?.[0] === 'urgent'
              ? 'bg-red-600 text-white border-red-600 shadow-red-200'
              : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
              }`}
          >
            Urgent Priority
          </button>
          <button
            onClick={() => handleFilterChange('hasFiles', filters.hasFiles ? undefined : true)}
            className={`flex-shrink-0 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm border ${filters.hasFiles
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200'
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
              }`}
          >
            Document Hub
          </button>
          <button
            onClick={() => handleFilterChange('isShared', filters.isShared ? undefined : true)}
            className={`flex-shrink-0 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm border ${filters.isShared
              ? 'bg-amber-600 text-white border-amber-600 shadow-amber-200'
              : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
              }`}
          >
            Shared Network
          </button>
        </div>
      </div>
    </div>
  );
};
