import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, User, Calendar, FileText, Building, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { backendSearchService, SearchResult } from '@/services/backendSearchService';
import { useNavigate } from 'react-router-dom';

// Using the imported SearchResult from backendSearchService

interface SavedSearch {
  id: string;
  search_name: string;
  search_criteria: {
    query: string;
    [key: string]: unknown;
  };
  search_type: string;
}



export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedSearches();
    loadRecentSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      // For now, we'll load saved searches from localStorage
      // TODO: Implement backend saved searches when endpoint is available
      const saved = localStorage.getItem('savedSearches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchQuery, ...recent.filter((s: string) => s !== searchQuery)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Use backend search service
      const searchResults = await backendSearchService.globalSearch(query, {
        limit: 20,
        page: 1
      });

      setResults(searchResults);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
    }
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate based on entity type
    switch (result.entity_type) {
      case 'patient':
        navigate(`/dashboard/patients/${result.entity_id}`);
        break;
      case 'appointment':
        navigate(`/dashboard/appointments/${result.entity_id}`);
        break;
      case 'medical_record':
        navigate(`/dashboard/records/${result.entity_id}`);
        break;
      case 'doctor':
        navigate(`/discovery?search=${result.title}`);
        break;
      case 'service':
        navigate(`/discovery?search=${result.title}`);
        break;
      case 'center':
        navigate(`/dashboard/centers/${result.entity_id}`);
        break;
      default:
        break;
    }
    setIsOpen(false);
    setQuery('');
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'patient':
        return <User className="w-4 h-4" />;
      case 'doctor':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'medical_record':
        return <FileText className="w-4 h-4" />;
      case 'center':
        return <Building className="w-4 h-4" />;
      case 'service':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'patient':
        return 'Patient';
      case 'doctor':
        return 'Doctor';
      case 'appointment':
        return 'Appointment';
      case 'medical_record':
        return 'Medical Record';
      case 'center':
        return 'Healthcare Center';
      case 'service':
        return 'Medical Service';
      case 'file':
        return 'File';
      default:
        return 'Result';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        handleResultClick(results[selectedIndex]);
      } else if (query.trim()) {
        navigate(`/discovery?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={searchRef}
          type="text"
          placeholder="Search health records, doctors, symptoms..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20" // Increased right padding for the buttons
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery('');
                setResults([]);
                searchRef.current?.focus();
              }}
              className="h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (query.trim()) {
                navigate(`/discovery?search=${encodeURIComponent(query.trim())}`);
                setIsOpen(false);
              }
            }}
            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold"
          >
            Search
          </Button>
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg max-h-96">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : query.length <= 2 ? (
                <div className="p-4 space-y-3">
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Recent Searches
                      </h4>
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="block w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  )}

                  {savedSearches.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        Saved Searches
                      </h4>
                      {savedSearches.slice(0, 3).map((search) => (
                        <button
                          key={search.id}
                          onClick={() => setQuery(search.search_criteria.query)}
                          className="block w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                        >
                          {search.search_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              ) : (
                results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full text-left p-3 hover:bg-muted border-b last:border-b-0 ${index === selectedIndex ? 'bg-muted' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getEntityIcon(result.entity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {getEntityTypeLabel(result.entity_type)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {result.title}
                        </p>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {Object.entries(result.metadata).slice(0, 3).map(([key, value], i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
