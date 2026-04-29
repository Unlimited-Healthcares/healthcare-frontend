import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FileText,
  ShoppingCart,
  AlertTriangle,
  Heart,
  Settings,
  ChevronLeft,
  Menu,
  CreditCard,
  Building2,
  Droplets,
  ClipboardList,
  ArrowRightLeft,
  Star,
  Bell,
  Video,
  Search,
  Users,
  Inbox,
  Mail,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Shield,
  HelpCircle,
  Brain,
  Pill,
  Activity,
  HeartPulse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isProfileComplete, calculateProfileCompletion } from "@/services/profileApi";
import { Progress } from "@/components/ui/progress";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, iconColor: "text-indigo-600" },
  { name: "Messages", href: "/chat", icon: MessageSquare, iconColor: "text-blue-600" },
  { name: "Pricing & Plans", href: "/pricing", icon: CreditCard, iconColor: "text-purple-600" },
  { name: "Discovery", href: null, icon: Search, expandable: true, iconColor: "text-violet-600" },
  { name: "AI Triage", href: "/symptom-analysis", icon: Brain, iconColor: "text-violet-600" },
  { name: "Appointments", href: "/appointments", icon: Calendar, iconColor: "text-sky-600" },
  { name: "Health Calendar", href: "/calendar", icon: Calendar, iconColor: "text-emerald-600" },
  { name: "Video Conferences", href: "/video-conferences", icon: Video, iconColor: "text-purple-600" },
  { name: "Health Centers", href: "/centers", icon: Building2, iconColor: "text-amber-600" },
  { name: "Health Records", href: "/records", icon: FileText, iconColor: "text-amber-700" },
  { name: "Blood Donation", href: "/blood-donation", icon: Droplets, iconColor: "text-red-600" },
  { name: "Medical Reports", href: "/medical-reports", icon: ClipboardList, iconColor: "text-teal-600" },
  { name: "Referrals", href: "/referrals", icon: ArrowRightLeft, iconColor: "text-cyan-600" },
  { name: "Reviews", href: "/reviews", icon: Star, iconColor: "text-yellow-600" },
  { name: "Notifications", href: "/notifications", icon: Bell, iconColor: "text-orange-500" },
  { name: "Emergency", href: "/emergency", icon: AlertTriangle, iconColor: "text-red-600" },
  { name: "Community", href: "/community", icon: Heart, iconColor: "text-rose-500" },
  { name: "Support Hub", href: "/support", icon: HelpCircle, iconColor: "text-blue-500" },
  { name: "Security Center", href: "/security", icon: Shield, iconColor: "text-blue-700" },
  { name: "My Wallet", href: "/wallet", icon: CreditCard, iconColor: "text-green-600" },
  { name: "Pharmacy", href: "/pharmacy", icon: Pill, iconColor: "text-purple-600" },
  { name: "Clinical Matrix", href: "/clinical/workflow", icon: Activity, iconColor: "text-blue-600", professionalOnly: true },
  { name: "Recovery Hub", href: "/clinical/me", icon: HeartPulse, iconColor: "text-indigo-600", patientOnly: true },
  { name: "Settings", href: "/settings", icon: Settings, iconColor: "text-slate-600" },
];

const adminNavigation = [
  { name: "Global Overview", href: "/admin", icon: LayoutDashboard, iconColor: "text-blue-700" },
  { name: "Entity Directory", href: "/admin/users", icon: Users, iconColor: "text-indigo-600" },
  { name: "Trust Registry", href: "/admin/verification", icon: ShieldCheck, iconColor: "text-indigo-700" },
  { name: "Financial Ledger", href: "/admin/finance", icon: CreditCard, iconColor: "text-emerald-600" },
  { name: "System Control", href: "/admin/settings", icon: Settings, iconColor: "text-slate-600" },
  { name: "Authority Audit", href: "/admin/audit", icon: Shield, iconColor: "text-rose-700" },
];

// Helper function to check if user is a patient
const isPatientUser = (roles: string[] | undefined): boolean => {
  if (!roles || roles.length === 0) return true; // Default to patient if no roles
  return roles.includes('patient') && roles.length === 1;
};

// Discovery System Navigation - will be filtered based on user role
const getDiscoveryNavigation = (userRoles: string[] | undefined) => {
  const baseNavigation = [
    { name: "Find Practitioners", href: "/discovery", icon: Search, iconColor: "text-violet-600" },
    { name: "Find Centers", href: "/centers", icon: Building2, iconColor: "text-amber-600" },
    { name: "My Connections", href: "/connections", icon: Users, iconColor: "text-blue-600" },
    { name: "Collaboration Requests", href: "/requests", icon: Inbox, iconColor: "text-teal-600" },
    { name: "Service Invitations", href: "/invitations", icon: Mail, iconColor: "text-pink-500" },
  ];

  // Filter for fitness center specific discovery
  if (userRoles?.includes('fitness_center')) {
    return [
      { name: "My Connections", href: "/connections", icon: Users, iconColor: "text-blue-600" },
      { name: "My Members", href: "/center/patients", icon: Users, iconColor: "text-indigo-600" },
      { name: "Invitations", href: "/invitations", icon: Mail, iconColor: "text-pink-500" },
    ];
  }

  // Filter for mortuary specific discovery
  if (userRoles?.includes('mortuary')) {
    return [
      { name: "Find Centers", href: "/centers", icon: Building2, iconColor: "text-amber-600" },
      { name: "My Connections", href: "/connections", icon: Users, iconColor: "text-blue-600" },
      { name: "Collaboration Requests", href: "/requests", icon: Inbox, iconColor: "text-teal-600" },
      { name: "My Registry", href: "/center/patients", icon: Users, iconColor: "text-indigo-600" },
    ];
  }

  // Filter for virology specific discovery
  if (userRoles?.includes('virology')) {
    return [
      { name: "Global Discovery", href: "/centers", icon: Building2, iconColor: "text-amber-600" },
      { name: "Find Specialists", href: "/discovery", icon: Search, iconColor: "text-violet-600" },
      { name: "Case Registry", href: "/center/patients", icon: Users, iconColor: "text-indigo-600" },
      { name: "Connections", href: "/connections", icon: Users, iconColor: "text-blue-600" },
    ];
  }

  // Only add "My Patients" for non-patient users (doctors, centers, staff, etc.)
  if (!isPatientUser(userRoles)) {
    baseNavigation.splice(4, 0, { name: "My Patients", href: "/center/patients", icon: Users, iconColor: "text-indigo-600" });
  }

  return baseNavigation;
};

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mode?: "full" | "breadcrumbs-only";
}

export function Sidebar({ collapsed = false, onToggleCollapse, mode = "full" }: SidebarProps) {
  const location = useLocation();
  const [isDiscoveryExpanded, setIsDiscoveryExpanded] = useState(false);
  const discoveryRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();

  const profileComplete = profile != null && user != null && isProfileComplete(profile, user?.roles || []);

  // Get discovery navigation based on user role
  const discoveryNavigation = getDiscoveryNavigation(user?.roles);

  // Close Discovery submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (discoveryRef.current && !discoveryRef.current.contains(event.target as Node)) {
        setIsDiscoveryExpanded(false);
      }
    };

    if (isDiscoveryExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDiscoveryExpanded]);

  // If mode is breadcrumbs-only, show minimal navigation
  if (mode === "breadcrumbs-only") {
    return (
      <div className="bg-card border-b border-border p-2">
        <nav className="flex space-x-2 overflow-x-auto">
          {navigation.map((item) => {
            if (item.expandable) return null;
            const isActive = location.pathname === item.href;
            const href = item.href || "/";
            const isDisabled = !profileComplete;
            return (
              <NavLink
                key={item.name}
                to={isDisabled ? "/profile" : href}
                className={cn(
                  "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-blue-500 text-white shadow-soft" : "text-gray-600",
                  isDisabled && "opacity-60 cursor-not-allowed"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : ("iconColor" in item && item.iconColor))} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col h-full pt-8 sm:pt-0 safe-area-pt pb-safe overflow-x-hidden overscroll-contain",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
              <img
                src="/images/logo/logo-new.png"
                alt="UHC Logo"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold text-black">UHC</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-gray-100 text-black touch-target-sm"
        >
          {collapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation - Scrollable with touch-friendly targets */}
      <nav className="flex-1 p-2 sm:p-4 pb-48 sm:pb-4 space-y-1 sm:space-y-2 overflow-y-auto overscroll-contain scrolling-touch">
        {user?.roles?.includes('admin') ? (
          <div className="space-y-6">
            <div className="space-y-2">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Governance</p>
                </div>
              )}
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold transition-all duration-200 touch-target mx-1",
                      "hover:bg-blue-50 text-blue-700",
                      isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-gray-50/50 border border-gray-100",
                      collapsed && "justify-center px-0 mx-0 rounded-none border-x-0"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-white" : item.iconColor)} />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>

            {!collapsed && (
              <div className="px-4 space-y-4">
                <div className="h-px bg-gray-100" />
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utility</p>
                  <NavLink to="/chat" className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </NavLink>
                  <NavLink to="/settings" className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                    <Settings className="h-4 w-4" />
                    Personal Settings
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {navigation.map((item) => {
              const userRoles = (user?.roles || []) as any[];
              const isMortuaryStaff = userRoles.includes('mortuary');
              const isCenterAdmin = userRoles.includes('center') || userRoles.includes('hospital');
              const isFitnessCenter = userRoles.includes('fitness_center');

              // Extremely slim sidebar for mortuary staff/attendants (those with mortuary role but not center owner)
              const mortuaryAllowedItems = ["Dashboard", "Messages", "Discovery", "Settings", "Notifications"];
              if (isMortuaryStaff && !isCenterAdmin && !mortuaryAllowedItems.includes(item.name)) {
                return null;
              }

              // Filter out specific clinical items for fitness centers (maintain existing behavior)
              const fitnessCenterRestrictedItems = ["Health Centers", "Health Records", "Blood Donation", "Medical Reports"];
              if (isFitnessCenter && fitnessCenterRestrictedItems.includes(item.name)) {
                return null;
              }

              // Filter out professional-only items for patients
              if ((item as any).professionalOnly && isPatientUser(userRoles)) {
                return null;
              }
              // Filter out patient-only items for professionals
              if ((item as any).patientOnly && !isPatientUser(userRoles)) {
                return null;
              }
              const isActive = location.pathname === item.href;

              // Handle expandable Discovery menu
              if (item.expandable) {
                return (
                  <div key={item.name} className="relative" ref={discoveryRef}>
                    <button
                      onClick={() => setIsDiscoveryExpanded(!isDiscoveryExpanded)}
                      className={cn(
                        "flex items-center justify-between w-full rounded-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200 touch-target",
                        "hover:bg-gray-50 text-gray-600",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <item.icon className={cn("h-5 w-5 flex-shrink-0", "iconColor" in item && item.iconColor)} />
                        {!collapsed && <span className="text-sm">{item.name}</span>}
                      </div>
                      {!collapsed && (
                        isDiscoveryExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )
                      )}
                    </button>

                    {/* Discovery submenu */}
                    {!collapsed && isDiscoveryExpanded && (
                      <div className="relative mt-1 sm:mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 sm:py-2 min-w-full">
                        {discoveryNavigation.map((subItem) => {
                          const isSubActive = location.pathname === subItem.href;
                          return (
                            <NavLink
                              key={subItem.name}
                              to={profileComplete ? subItem.href : "/profile"}
                              className={cn(
                                "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium transition-all duration-200 touch-target",
                                "hover:bg-gray-50",
                                isSubActive
                                  ? "bg-green-500 text-white"
                                  : "text-gray-600",
                                !profileComplete && "opacity-60 cursor-not-allowed"
                              )}
                            >
                              <subItem.icon className={cn("h-4 w-4 flex-shrink-0", isSubActive ? "text-white" : subItem.iconColor)} />
                              <span>{subItem.name}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular navigation items (disabled and link to /profile when profile incomplete)
              const href = item.href || "/";
              const isPricing = href === "/pricing";
              const isPharmacy = item.name === "Pharmacy";
              const isDisabled = !profileComplete && !isPricing;

              // Gate Pharmacy to hospital/center roles if needed
              if (isPharmacy && !user?.roles?.some(r => ['hospital', 'pharmacy', 'diagnostic', 'staff'].includes(r))) {
                return null;
              }

              return (
                <NavLink
                  key={item.name}
                  to={isDisabled ? "/profile" : href}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200 touch-target",
                    "hover:bg-gray-50",
                    isActive
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600",
                    collapsed && "justify-center px-2",
                    isDisabled && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : ("iconColor" in item && item.iconColor))} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Discovery System Section - Collapsed */}
      {collapsed && (
        <div className="p-2 border-t border-gray-200">
          <nav className="space-y-1 sm:space-y-2">
            {discoveryNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={profileComplete ? item.href : "/profile"}
                  className={cn(
                    "flex items-center justify-center rounded-full p-2.5 sm:p-2 text-sm font-medium transition-all duration-200 touch-target-sm",
                    "hover:bg-gray-50",
                    isActive
                      ? "bg-green-500 text-white shadow-md"
                      : "text-gray-600",
                    !profileComplete && "opacity-60 cursor-not-allowed"
                  )}
                  title={item.name}
                >
                  <item.icon className={cn("h-5 w-5 sm:h-4 sm:w-4", isActive ? "text-white" : item.iconColor)} />
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}

      {/* Profile Completion Indicator */}
      {!collapsed && !profileComplete && user && (
        <div className="px-4 py-3 border-t border-gray-100 bg-blue-50/30">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Setup Profile</span>
            <span className="text-[10px] font-black text-blue-600">{calculateProfileCompletion(profile, user.roles || [])}%</span>
          </div>
          <Progress value={calculateProfileCompletion(profile, user.roles || [])} className="h-1.5 bg-blue-100" />
          <p className="text-[9px] text-blue-500 mt-2 font-medium leading-tight">
            Complete your profile to unlock all features.
          </p>
        </div>
      )}
    </div>
  );
}
