import React from "react";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  href: string;
  color?: string;
  className?: string;
}

export const ActionButton = ({
  icon: Icon,
  label,
  href,
  color = "bg-healthcare-600",
  className,
}: ActionButtonProps) => {
  return (
    <a
      href={href}
      className={cn(
        "flex flex-col items-center rounded-xl transition-all hover:-translate-y-1 active:scale-95",
        "p-2 sm:p-4 min-h-[85px] sm:min-h-[100px] justify-center",
        color,
        className
      )}
    >
      <Icon className="h-6 w-6 sm:h-10 sm:w-10 text-white mb-1.5" />
      <span className="text-white font-bold text-[10px] sm:text-sm text-center leading-tight line-clamp-2">
        {label}
      </span>
    </a>
  );
};

export const ActionButtonGrid = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 px-1 sm:px-0">
      {children}
    </div>
  );
};
