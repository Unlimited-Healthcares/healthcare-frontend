import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useIdleTimer = (timeoutMs: number = 5 * 60 * 1000) => {
  const { signOut, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        toast.error("Session expired due to inactivity. Please log in again for your security.", {
            duration: 5000,
            position: 'top-center',
            className: 'bg-red-600 text-white border-none rounded-2xl shadow-2xl font-black uppercase text-xs tracking-widest'
        });
        signOut();
      }, timeoutMs);
    }
  }, [signOut, isAuthenticated, timeoutMs]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => resetTimer();

    if (isAuthenticated) {
      resetTimer();
      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimer]);
};
