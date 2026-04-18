import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SPECIALTY_SERVICES } from '@/constants/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SpecialtyServicesWidget: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    if (!user || !['doctor', 'nurse', 'biotech_engineer', 'allied_practitioner'].includes(user.roles?.[0] || '')) {
        return null;
    }

    const specialization = profile?.specialization || (user as any)?.specialization;
    if (!specialization) return null;

    const suggestedServices = SPECIALTY_SERVICES[specialization] || [];
    const currentServices = (profile as any)?.services || (profile as any)?.offeredServices || [];
    const currentServiceNames = Array.isArray(currentServices)
        ? currentServices.map((s: any) => (s.name || '').toLowerCase())
        : [];

    // Filter out services already added
    const newSuggestions = suggestedServices.filter(s => !currentServiceNames.includes(s.toLowerCase()));

    if (newSuggestions.length === 0) return null;

    return (
        <Card className="border-indigo-200 bg-white/50 backdrop-blur-sm shadow-lg overflow-hidden relative group transition-all hover:shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Stethoscope className="h-24 w-24 text-indigo-600" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        Tailored for {specialization}
                    </CardTitle>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold uppercase tracking-wider text-[10px]">
                        New Services
                    </Badge>
                </div>
                <CardDescription className="text-xs font-medium text-gray-500 mt-1">
                    Based on your subspecialty, consider adding these services to your clinical profile.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {newSuggestions.slice(0, 4).map((service) => (
                        <div
                            key={service}
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group/item"
                        >
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate mr-2">
                                {service}
                            </span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                onClick={() => navigate('/profile?edit=true&addService=' + encodeURIComponent(service))}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={() => navigate('/profile?edit=true')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 shadow-md shadow-indigo-200 group"
                >
                    MANAGE ALL SERVICES
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    );
};
