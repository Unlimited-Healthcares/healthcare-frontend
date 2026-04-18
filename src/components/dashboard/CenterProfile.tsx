import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface CenterData {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  profileImage?: string;
}

interface CenterProfileProps {
  centerId: string;
}

export const CenterProfile = ({ centerId }: CenterProfileProps) => {
  const [center, setCenter] = useState<CenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCenterData = async () => {
      setLoading(true);
      try {
        // This would be replaced with actual data fetching in production
        // Simulating API call with timeout
        setTimeout(() => {
          setCenter({
            id: centerId,
            name: "Sample Medical Center",
            type: "Hospital",
            address: "Federal housing New layout North bank Makurdi",
            phone: "(555) 123-4567",
            email: "info@samplemedical.com",
            hours: "Mon-Fri: 8am-6pm, Sat: 9am-1pm",
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching center data:", error);
        setLoading(false);
      }
    };

    if (centerId) {
      fetchCenterData();
    }
  }, [centerId]);

  if (loading) {
    return <div className="p-4 text-center">Loading center profile...</div>;
  }

  if (!center) {
    return <div className="p-4 text-center">Unable to load center profile.</div>;
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-healthcare-600 to-healthcare-400"></div>
      <CardHeader className="relative pb-0">
        <div className={`absolute -top-16 ${isMobile ? 'left-1/2 transform -translate-x-1/2' : 'left-6'} rounded-full bg-white p-1 shadow-md`}>
          <div className="w-24 h-24 rounded-full bg-healthcare-100 flex items-center justify-center">
            {center.profileImage ? (
              <img
                src={center.profileImage}
                alt={center.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-healthcare-500">
                {center.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className={`${isMobile ? 'mt-12 text-center' : 'ml-32'}`}>
          <CardTitle className="text-2xl">{center.name}</CardTitle>
          <CardDescription>
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-healthcare-100 text-healthcare-800 mt-1">
              {center.type}
            </span>
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <Settings className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className={`pt-6 space-y-4 ${isMobile ? 'px-4' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="break-words">{center.address}</span>
          </div>
          <div className="flex items-start space-x-2">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span>{center.phone}</span>
          </div>
          <div className="flex items-start space-x-2">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="break-words">{center.email}</span>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span>{center.hours}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
