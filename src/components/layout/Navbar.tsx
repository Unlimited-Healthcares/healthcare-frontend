import { useState, useEffect, useState as useReactState } from "react";
import { Search, Bell, User, Menu, HelpCircle, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { useNotificationsContext } from "@/context/NotificationsContext";
import { walletApi } from "@/services/walletApi";
import { backendSearchService, SearchResult } from "@/services/backendSearchService";
import { Loader2, X, Building, User as UserIcon, Calendar, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isMobile?: boolean;
}

export function Navbar({ onToggleSidebar, isMobile }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [walletBalance, setWalletBalance] = useReactState<number | null>(null);
  const { profile, user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { unreadCount } = useNotificationsContext();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      loadBalance();
      // Poll for real-time balance updates every 30 seconds
      interval = setInterval(loadBalance, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  const loadBalance = async () => {
    try {
      const data = await walletApi.getBalance();
      setWalletBalance(data.balance);
    } catch (e) {
      console.warn("Could not load wallet balance");
    }
  };

  // Live search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await backendSearchService.globalSearch(searchQuery);
          setSuggestions(results.slice(0, 5));
          setShowSuggestions(true);
        } catch (e) {
          console.error("Search suggestions failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Resolve a human-friendly display name with sensible fallbacks
  const getUserName = () => {
    const profileDisplay = (profile as any)?.displayName || (profile as any)?.display_name;
    if (profileDisplay) return String(profileDisplay);

    const userDisplay = (user as any)?.displayName || (user as any)?.display_name;
    if (userDisplay) return String(userDisplay);

    if (profile?.name) return profile.name;
    if (user?.name) return user.name;

    const composedProfileName = [
      (profile as any)?.firstName || (profile as any)?.first_name,
      (profile as any)?.lastName || (profile as any)?.last_name,
    ].filter(Boolean).join(' ').trim();

    return composedProfileName || 'User';
  };

  const getUserInitials = () => {
    const userName = getUserName();
    if (userName && userName !== 'User') {
      const names = userName.split(' ');
      if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
      return names[0][0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayId = () => {
    const fromUser = (user as any)?.displayId || (user as any)?.display_id;
    const fromProfile = (profile as any)?.displayId || (profile as any)?.display_id;
    return fromUser || fromProfile || 'N/A';
  };

  const getUserIdLabel = () => {
    if (!user?.roles || user.roles.length === 0) return 'User ID';
    const primaryRole = user.roles[0];
    switch (primaryRole) {
      case 'doctor': return 'Health Care Practitioner ID';
      case 'nurse': return 'Nurse ID';
      case 'staff': return 'Registry ID';
      case 'center': return 'Center ID';
      case 'diagnostic': return 'Diagnostic ID';
      case 'pharmacy': return 'Pharmacy ID';
      case 'fitness_center': return 'Fitness ID';
      case 'ambulance_service': return 'Transport ID';
      case 'mortuary': return 'Mortuary ID';
      case 'maternity': return 'Maternity ID';
      case 'virology': return 'Virology ID';
      case 'psychiatric': return 'Psychiatric ID';
      case 'biotech_engineer': return 'Biotech ID';
      case 'allied_practitioner': return 'Allied Healthcare Practitioner ID';
      case 'admin': return 'Admin ID';
      default: return 'Patient ID';
    }
  };

  const getSearchPlaceholder = () => {
    if (!isAuthenticated || !user?.roles?.[0]) return "Search doctors, hospitals, services...";
    const role = user.roles[0];
    switch (role) {
      case 'doctor':
      case 'nurse':
      case 'staff':
        return "Search patients by name/ID, clinical records, or registry...";
      case 'center':
      case 'diagnostic':
        return "Search patients, staff, records, or services...";
      case 'admin':
        return "Search all users, centers, logs, or records...";
      default:
        return "Search anything: doctors, patients, services...";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discovery?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item: SearchResult) => {
    setSearchQuery("");
    setShowSuggestions(false);

    switch (item.entity_type) {
      case 'patient':
        navigate(`/dashboard/patients/${item.entity_id}`);
        break;
      case 'doctor':
        navigate(`/discovery?search=${encodeURIComponent(item.title)}`);
        break;
      case 'center':
        navigate(`/dashboard/centers/${item.entity_id}`);
        break;
      case 'medical_record':
        navigate(`/dashboard/records/${item.entity_id}`);
        break;
      case 'appointment':
        navigate(`/dashboard/appointments`);
        break;
      case 'service':
        navigate(`/discovery?search=${encodeURIComponent(item.title)}`);
        break;
      default:
        navigate(`/discovery?search=${encodeURIComponent(item.title)}`);
    }
  };

  return (
    <nav className="bg-card border-b border-border px-2 sm:px-4 md:px-6 pt-10 sm:pt-4 pb-2 sm:pb-4 safe-area-pt w-full relative z-50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        {/* Top bar on Mobile / Left side on Desktop */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="p-2 flex-shrink-0 touch-target"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {!isMobile && (
              <div className="flex-shrink-0 mr-4">
                {/* Logo placeholder or site title could go here if needed */}
              </div>
            )}
          </div>

          {/* Right side icons - only show on top bar for Mobile when not searching, or always for Desktop */}
          <div className={cn(
            "flex items-center gap-1.5 sm:gap-4 flex-shrink-0",
            isMobile && isSearchFocused ? "hidden" : "flex"
          )}>
            {isAuthenticated && walletBalance !== null && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet')}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 h-auto rounded-full border transition-all group relative overflow-hidden",
                  walletBalance < 10
                    ? "bg-rose-50 hover:bg-rose-100 border-rose-200 animate-pulse"
                    : "bg-green-50/50 hover:bg-green-100/50 border-green-100/50"
                )}
              >
                <WalletIcon className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  walletBalance < 10 ? "text-rose-600" : "text-emerald-600"
                )} />
                <div className="flex flex-col items-start leading-none">
                  <span className={cn(
                    "text-[8px] sm:text-[9px] font-black uppercase tracking-tighter",
                    walletBalance < 10 ? "text-rose-700" : "text-emerald-700"
                  )}>
                    {walletBalance < 10 ? 'LOW' : 'Bal'}
                  </span>
                  <span className={cn(
                    "text-xs sm:text-sm font-black",
                    walletBalance < 10 ? "text-rose-800" : "text-emerald-800"
                  )}>
                    ${walletBalance?.toLocaleString(undefined, { minimumFractionDigits: walletBalance < 100 ? 2 : 1 })}
                  </span>
                </div>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 touch-target-sm"
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-blue-600 border-2 border-white text-white rounded-full"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 touch-target-sm group"
              onClick={() => navigate('/support')}
            >
              <HelpCircle className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Button>

            {!authLoading && isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 hover:bg-transparent touch-target-sm">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarImage src={(profile as any)?.avatar ?? (profile as any)?.image_url} alt={getUserName()} />
                      <AvatarFallback className="bg-blue-600 text-white font-medium text-xs sm:text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-xs sm:text-sm font-semibold text-black truncate max-w-[100px]">
                        {getUserName()}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onClick={handleSignOut} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600 font-medium">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Search row - Full width on Mobile, Flex-1 on Desktop */}
        <div className={cn(
          "transition-all duration-300 w-full",
          isMobile ? "flex" : "flex-1 max-w-2xl"
        )}>
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search
                className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-blue-500 transition-colors"
                onClick={handleSearch}
              />
              <Input
                type="text"
                placeholder={isMobile ? "Search Name or ID..." : getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="pl-8 sm:pl-12 pr-8 sm:pr-10 py-1.5 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-700 placeholder-gray-400 text-xs sm:text-base w-full min-h-[40px] sm:min-h-[44px]"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {isSearching && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Quick Results</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {suggestions.map((item: any) => (
                      <button
                        key={`${item.entity_type}-${item.entity_id}`}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors group"
                      >
                        <Avatar className="h-8 w-8 border border-gray-100 flex items-center justify-center bg-gray-50">
                          {item.metadata.avatar || item.metadata.logoUrl ? (
                            <AvatarImage src={(item.metadata.avatar || item.metadata.logoUrl) as string} />
                          ) : (
                            <div className="text-gray-400">
                              {item.entity_type === 'center' && <Building className="h-4 w-4" />}
                              {item.entity_type === 'doctor' && <UserIcon className="h-4 w-4" />}
                              {item.entity_type === 'patient' && <UserIcon className="h-4 w-4" />}
                              {item.entity_type === 'service' && <Zap className="h-4 w-4" />}
                              {item.entity_type === 'medical_record' && <FileText className="h-4 w-4" />}
                              {item.entity_type === 'appointment' && <Calendar className="h-4 w-4" />}
                            </div>
                          )}
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">
                            {item.title[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 truncate flex items-center gap-1.5">
                            {item.title}
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase">
                              {item.entity_type}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 truncate capitalize">
                            {item.entity_type === 'doctor' || item.entity_type === 'patient' ? (
                              <span className="font-bold text-blue-600 mr-1">{item.metadata.displayId || item.metadata.patientId || ''}</span>
                            ) : null}
                            {item.description || (item.metadata.type as string) || "Healthcare Result"} • {item.metadata.city as string || "Access Hub"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSearch}
                    className="w-full p-3 text-center text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors border-t border-blue-100"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </nav>
  );
}
