import React from "react";
import { ReferralStatusHistory } from "@/services/referralService";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";

interface ReferralTimelineProps {
  statusHistory: ReferralStatusHistory[];
  className?: string;
}

export const ReferralTimeline: React.FC<ReferralTimelineProps> = ({
  statusHistory,
  className,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "in_progress":
        return <ArrowRight className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-medium">Referral Timeline</h3>
      
      {statusHistory.length === 0 ? (
        <p className="text-muted-foreground text-sm">No history available for this referral.</p>
      ) : (
        <div className="space-y-4">
          {statusHistory.map((item, index) => (
            <div key={item.id} className="relative pl-6">
              {/* Timeline connector */}
              {index < statusHistory.length - 1 && (
                <div className="absolute left-[10px] top-[28px] bottom-0 w-[1px] bg-gray-200" />
              )}
              
              {/* Status node */}
              <div className="flex items-start">
                <div className="absolute left-0 mt-1 bg-white">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item.status)}
                      <span className="text-sm font-medium">
                        Status changed to {item.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate((item.changedAt || item.created_at)?.toString() || '')}
                    </span>
                  </div>
                  
                  {item.notes && (
                    <div className="bg-muted p-3 rounded-md text-sm mt-2">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-muted-foreground">{item.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {(item.changedBy?.name || item.created_by) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated by {item.changedBy?.name || item.created_by}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralTimeline; 