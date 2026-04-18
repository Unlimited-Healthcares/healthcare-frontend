import { Activity, Heart, Thermometer, Droplets, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VitalItem {
  label: string;
  value: string | number;
  unit: string;
  icon: any;
  color: string;
  bgColor: string;
  status?: 'normal' | 'warning' | 'critical';
}

interface HealthMonitoringCardProps {
  patient?: any;
  vitals?: VitalItem[];
  healthTips?: string[];
}

export function HealthMonitoringCard({ patient, vitals: propVitals, healthTips: propTips }: HealthMonitoringCardProps) {
  // Use provided vitals or fallback to patient-specific defaults from their record
  const displayVitals: VitalItem[] = propVitals || [
    { 
      label: "Heart Rate", 
      value: patient?.vitals?.heartRate || "72", 
      unit: "bpm", 
      icon: Activity, 
      color: "text-rose-500", 
      bgColor: "bg-rose-50",
      status: patient?.vitals?.heartRate && patient.vitals.heartRate > 100 ? 'warning' : 'normal'
    },
    { 
      label: "Blood Pressure", 
      value: patient?.vitals?.bp || "120/80", 
      unit: "mmHg", 
      icon: Heart, 
      color: "text-blue-500", 
      bgColor: "bg-blue-50" 
    },
    { 
      label: "Temperature", 
      value: patient?.vitals?.temp || "36.6", 
      unit: "°C", 
      icon: Thermometer, 
      color: "text-orange-500", 
      bgColor: "bg-orange-50" 
    },
    { 
      label: "SpO2", 
      value: patient?.vitals?.spO2 || "98", 
      unit: "%", 
      icon: Droplets, 
      color: "text-teal-500", 
      bgColor: "bg-teal-50",
      status: patient?.vitals?.spO2 && patient.vitals.spO2 < 95 ? 'critical' : 'normal'
    },
  ];

  const displayTips = propTips || [
    patient?.age > 40 ? "Schedule a preventive heart screening." : "Stay active with 30 minutes of cardio daily.",
    "Maintain consistent hydration (2-3L water / day).",
    patient?.vitals?.spO2 < 95 ? "Monitor your breathing and contact your doctor if you feel short of breath." : "Practice deep breathing for better oxygen saturation."
  ];

  return (
    <Card className="shadow-soft border-0 bg-white overflow-hidden group">
      <CardHeader className="pb-4 px-3 md:px-6 relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-24 w-24 text-teal-600" />
        </div>
        <CardTitle className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span className="text-gray-900 text-xl font-black uppercase tracking-tight">Physiological HUD</span>
          </div>
          <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50 p-2 font-bold text-[10px] uppercase tracking-widest">
            <TrendingUp className="w-4 h-4 mr-1" />
            Vitals Trends
          </Button>
        </CardTitle>
        <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Patient-Specific Real-Time Monitoring
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 px-3 md:px-6 relative z-10">
        {/* Vitals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          {displayVitals.map((vital, index) => (
            <div
              key={index}
              className={cn(
                "text-center p-4 rounded-3xl transition-all border-2 border-transparent hover:border-white hover:shadow-xl relative",
                vital.bgColor
              )}
            >
              {vital.status === 'critical' || vital.status === 'warning' ? (
                <div className="absolute top-2 right-2">
                    <AlertCircle className={cn("h-3 w-3", vital.status === 'critical' ? 'text-rose-600 animate-pulse' : 'text-orange-500')} />
                </div>
              ) : null}
              <vital.icon className={cn("w-6 h-6 mx-auto mb-2", vital.color)} />
              <div className="font-black text-2xl text-gray-900 mb-0.5 tracking-tighter">
                {vital.value}
                <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{vital.unit}</span>
              </div>
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{vital.label}</div>
            </div>
          ))}
        </div>

        {/* Health Tips Section */}
        <div className="space-y-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
          <h4 className="font-black text-[10px] flex items-center gap-2 text-slate-500 uppercase tracking-[0.2em]">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Personalized Clinical Insights
          </h4>
          <div className="space-y-3">
            {displayTips.map((tip, index) => (
              <div
                key={index}
                className="text-xs text-slate-700 font-bold flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-2 w-full">
          <Button variant="outline" className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest h-12">
            Archive History
          </Button>
          <Button className="flex-1 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 shadow-lg">
            Sync Device
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
