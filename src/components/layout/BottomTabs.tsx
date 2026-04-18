import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, FileText, MessageSquare, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { id: "dashboard", label: "Home", icon: Home, path: "/dashboard" },
  { id: "appointments", label: "Calendar", icon: Calendar, path: "/appointments" },
  { id: "records", label: "Records", icon: FileText, path: "/records" },
  { id: "chat", label: "Chat", icon: MessageSquare, path: "/chat" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const getIsActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-t border-slate-200/60 dark:border-slate-800/60 px-2 safe-area-pb z-[600] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.12)] overflow-hidden">
      <div className="flex items-center justify-around h-20 px-1">
        {tabs.map((tab) => {
          const isActive = getIsActive(tab.path);
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-500",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn(
                  "h-7 w-7 transition-all duration-500 ease-out",
                  isActive ? "scale-110" : "scale-100"
                )} />
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -inset-3 bg-blue-100/50 dark:bg-blue-900/40 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
