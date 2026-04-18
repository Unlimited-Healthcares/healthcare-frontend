
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CenterTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  iconBgColor?: string;
  className?: string;
}

export const CenterTypeCard = ({
  icon: Icon,
  title,
  description,
  href,
  iconBgColor = "bg-healthcare-100",
  className,
}: CenterTypeCardProps) => {
  return (
    <a href={href}>
      <Card 
        className={cn(
          "cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-1",
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={cn("p-2 rounded-full", iconBgColor)}>
              <Icon className="h-6 w-6 text-healthcare-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

export const CenterTypeGrid = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {children}
    </div>
  );
};
