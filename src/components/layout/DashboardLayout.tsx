
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomTabs } from "./BottomTabs";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Initialize mobile state immediately to prevent layout flicker
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // md breakpoint
    }
    return false;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // md breakpoint
    }
    return false;
  });

  // Detect mobile devices and manage sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      setSidebarCollapsed(mobile);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden overscroll-contain">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      {!isMobile && (
        <div className="h-full pb-safe">
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-[1000] sidebar-overlay bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed left-0 top-0 z-[1010] sidebar-content h-full w-[280px] max-w-[85vw] bg-card border-r border-border shadow-xl transform transition-transform duration-300 ease-out flex flex-col pt-safe"
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar collapsed={false} onToggleCollapse={toggleSidebar} />
        </div>
      )}

      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        <Navbar onToggleSidebar={toggleSidebar} isMobile={isMobile} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50 w-full overflow-y-auto overflow-x-hidden pb-44 md:pb-12 safe-area-pb" style={{WebkitOverflowScrolling: 'touch'}}>
          {children}
        </main>
      </div>

      {/* Bottom Tabs - Only visible on mobile */}
      {isMobile && <BottomTabs />}
    </div>
  );
}
