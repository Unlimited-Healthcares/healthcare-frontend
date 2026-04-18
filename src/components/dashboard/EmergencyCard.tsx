import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, Clock, Heart, Truck, Activity, ShieldAlert, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EmergencyCard() {
  const navigate = useNavigate();

  const emergencyActions = [
    { label: 'Ambulance / Medical Transport', icon: Truck, category: 'Ambulance Service', color: 'bg-red-600' },
    { label: 'Paramedic Response Team', icon: Activity, category: 'Paramedic Team', color: 'bg-orange-600' },
    { label: 'Red Cross Emergency', icon: Heart, category: 'Red Cross Response', color: 'bg-rose-600' },
  ];

  const handleEmergencyClick = (category: string) => {
     // Route to discovery with emergency type and service
     const params = new URLSearchParams();
     params.append('service', category);
     params.append('type', 'emergency_service');
     navigate(`/discovery?${params.toString()}`);
  }

  return (
    <Card className="shadow-2xl border-4 border-red-100 bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
      
      <CardHeader className="pb-4 px-4 md:px-6 bg-red-50/50">
        <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center space-x-3 text-red-700 min-w-0">
            <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 animate-bounce flex-shrink-0" />
            <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-red-700 block truncate">Life-Saving Protocols</span>
                <p className="text-[8px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest opacity-80 truncate">Fetch · Accept · Schedule Engine Active</p>
            </div>
            </CardTitle>
            <Badge className="bg-red-600 text-white animate-pulse border-none text-[8px] sm:text-xs shrink-0">Emergency Hub</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 md:px-6 pt-6">
        <div className="grid grid-cols-1 gap-3">
          {emergencyActions.map((action) => (
            <Button
              key={action.label}
              size="lg"
              className={`w-full h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 font-black text-xs sm:text-sm ${action.color} hover:brightness-110 border-0 shadow-lg group transition-all`}
              onClick={() => handleEmergencyClick(action.category)}
            >
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-white uppercase text-left leading-[1.1] truncate break-words">{action.label}</span>
              </div>
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-white shrink-0" />
            </Button>
          ))}
        </div>

        <div className="bg-slate-900 p-4 rounded-xl text-white shadow-inner flex items-center justify-between border-b-2 border-red-500">
           <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Live Coordinate Transmission</p>
                   <p className="text-xs font-bold">Protocol: GPS Match Discovery</p>
                </div>
           </div>
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-2 flex flex-col items-center gap-1">
           <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Response Cycle: 24/7 Redundant Alerts Active</span>
           </div>
           <p className="italic font-medium lowercase opacity-70">"Instant documentation & vault archival triggered upon dispatch"</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityCard() {
  return (
    <Card className="shadow-soft border-0 bg-slate-50 border-l-4 border-slate-300">
      <CardHeader className="pb-3 px-3 md:px-6">
        <CardTitle className="flex items-center space-x-2 text-sm font-black text-slate-900 uppercase tracking-tight">
          <Heart className="w-4 h-4 text-slate-400" />
          <span>Local Health Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 md:px-6 pb-6">
        <div className="bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center py-4 text-slate-400 italic text-[11px] font-medium leading-relaxed">
          No mandatory health alerts in your designated geozone for the current 24hr cycle.
        </div>
      </CardContent>
    </Card>
  );
}
