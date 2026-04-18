import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current viewport is mobile sized
 * @param breakpoint The width threshold in pixels to consider as mobile (default: 768)
 * @returns Boolean indicating if the current viewport is mobile sized
 */
export function useIsMobile(breakpoint = 768) {
  // Initialize with actual window width to prevent layout flicker
  const [isMobile, setIsMobile] = useState(() => {
    // Only access window during initial render on client side
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    // Function to check if window width is less than breakpoint
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Set initial state (though it's already set)
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [breakpoint]);

  return isMobile;
} 