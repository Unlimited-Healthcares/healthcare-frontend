import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UnreadCountBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UnreadCountBadge: React.FC<UnreadCountBadgeProps> = ({ 
  count, 
  size = 'md',
  className 
}) => {
  if (!count || count <= 0) return null;

  const sizeClasses = {
    sm: {
      container: "min-w-[16px] h-4 px-1 text-[10px]",
      padding: {
        single: "px-1",
        double: "px-1.5", 
        triple: "px-2"
      }
    },
    md: {
      container: "min-w-[20px] h-5 px-1 text-xs",
      padding: {
        single: "px-1",
        double: "px-1.5",
        triple: "px-2"
      }
    },
    lg: {
      container: "min-w-[24px] h-6 px-1.5 text-sm",
      padding: {
        single: "px-1.5",
        double: "px-2",
        triple: "px-2.5"
      }
    }
  };

  const currentSize = sizeClasses[size];
  const paddingClass = count > 99 
    ? currentSize.padding.triple 
    : count > 9 
    ? currentSize.padding.double 
    : currentSize.padding.single;

  return (
    <div className="relative">
      <Badge 
        className={cn(
          "bg-red-500 hover:bg-red-500 text-white border-0",
          "rounded-full flex items-center justify-center font-semibold",
          currentSize.container,
          paddingClass,
          className
        )}
      >
        {count > 99 ? '99+' : count}
      </Badge>
      {/* Subtle glow effect for unread messages */}
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-pulse"></div>
    </div>
  );
};

export default UnreadCountBadge;
