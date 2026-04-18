import React, { useEffect, useRef } from 'react';
import { Search, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CenterCard } from './CenterCard';
import { CompactDoctorCard } from './CompactDoctorCard';
import { User, Center } from '@/types/discovery';

interface SearchResultsProps {
  results: (User | Center)[];
  loading: boolean;
  error?: string;
  onRequest: (userOrCenter: User | Center) => void;
  onViewProfile: (publicId: string) => void;
  onCall?: (userOrCenter: User | Center) => void;
  searchType: 'doctor' | 'center' | 'practitioner' | 'patient' | 'biotech_engineer' | 'allied_practitioner' | 'nurse' | 'diagnostic' | 'maternity';
  hasMore?: boolean;
  onLoadMore?: () => void;
  isSelectMode?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  selectedService?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  onRequest,
  onViewProfile,
  onCall,
  searchType,
  hasMore,
  onLoadMore,
  isSelectMode = false,
  selectedIds = [],
  onToggleSelect,
  selectedService
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore, loading]);

  const getDisplayType = (type: string, isPlural: boolean = false) => {
    switch (type) {
      case 'doctor':
        return isPlural ? 'Consultant Doctors' : 'Consultant Doctor';
      case 'practitioner':
        return isPlural ? 'General Practitioners' : 'General Practitioner';
      case 'allied_practitioner':
        return isPlural ? 'ALLIED HEALTH CARE PRACTITIONERS' : 'ALLIED HEALTH CARE PRACTITIONER';
      case 'biotech_engineer':
        return isPlural ? 'Biotech Specialists' : 'Biotech Specialist';
      case 'patient':
        return isPlural ? 'Patients' : 'Patient';
      case 'center':
        return isPlural ? 'Healthcare Centers' : 'Healthcare Center';
      default:
        return isPlural ? `${type}s` : type;
    }
  };

  if (loading && results.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Searching for {getDisplayType(searchType, true)}...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Error</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600 text-center mb-4">
            We couldn't find any {getDisplayType(searchType, true)} matching your search criteria.
          </p>
          <div className="text-sm text-gray-500 text-center">
            <p>Try adjusting your search filters or expanding your search radius.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full relative z-10">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">
            {results.length} {getDisplayType(searchType, results.length !== 1)} found
          </h2>
        </div>
      </div>

      {/* Single Column Feed for Users */}
      {searchType === 'doctor' || searchType === 'practitioner' || searchType === 'patient' || searchType === 'biotech_engineer' || searchType === 'allied_practitioner' ? (
        <div className="space-y-5">
          {results.map((item) => {
            const user = item as User;
            return (
              <CompactDoctorCard
                key={user.publicId}
                user={user}
                onRequest={(u) => onRequest(u)}
                onViewProfile={onViewProfile}
                onCall={(u) => onCall?.(u)}
                isSelectable={isSelectMode}
                isSelected={selectedIds.includes(user.id)}
                onSelect={() => onToggleSelect?.(user.id)}
                selectedService={selectedService}
              />
            );
          })}
        </div>
      ) : (
        /* Grid Layout for Centers */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item) => {
            const center = item as Center;
            return (
              <CenterCard
                key={center.publicId}
                center={center}
                onViewDetails={() => window.open(`/centers/${center.id}`, '_blank')}
                onSendRequest={() => onRequest(center)}
                onContact={() => onCall?.(center)}
                showActions
                isSelectable={isSelectMode}
                isSelected={selectedIds.includes(center.id)}
                onSelect={() => onToggleSelect?.(center.id)}
                selectedService={selectedService}
              />
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && onLoadMore && (
        <div ref={loadMoreRef} className="h-20" />
      )}

      {loading && results.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
};
