import React from 'react';
import {
    Building2,
    MapPin,
    Mail,
    Phone,
    Users,
    FileCheck,
    AlertCircle,
    ShieldCheck,
    Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CenterProfile } from '@/types/profile';
import { isPast, parseISO } from 'date-fns';

interface EnterpriseHeaderProps {
    profile: CenterProfile | null;
    isLoading?: boolean;
    individualName?: string;
}

export const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({ profile, isLoading, individualName }) => {
    if (isLoading) {
        return (
            <Card className="border-none shadow-sm bg-white rounded-2xl animate-pulse">
                <CardContent className="p-6 h-32 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profile) return null;

    const isExpired = (dateString?: string) => {
        if (!dateString) return false;
        try {
            return isPast(parseISO(dateString));
        } catch {
            return false;
        }
    };

    const regExpired = isExpired(profile.registrationExpiryDate);
    const leadExpired = isExpired(profile.leadProfessionalExpiryDate);

    return (
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2" />
            <CardContent className="p-5 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
                    {/* Logo & Basic Info */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start flex-1 w-full min-w-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm flex-shrink-0 relative">
                            {profile.logoUrl ? (
                                <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                            )}
                            {profile.businessRegistrationNumber && (
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                    <ShieldCheck className="h-3 w-3" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words line-clamp-2">
                                        {profile.name}
                                    </h1>
                                    <Badge variant="secondary" className="capitalize bg-blue-50 text-blue-700 border-blue-100 w-fit self-center sm:self-auto text-[10px] sm:text-xs">
                                        {profile.type.replace('-', ' ')}
                                    </Badge>
                                </div>
                                {individualName && (
                                    <Badge variant="outline" className="border-indigo-100 text-indigo-700 bg-indigo-50/50 px-3 py-1 font-bold text-xs">
                                        Admin: {individualName}
                                    </Badge>
                                )}
                                <div className="sm:flex items-center gap-2 hidden lg:block">
                                    <Button
                                        onClick={() => window.location.href = '/centers'}
                                        variant="outline"
                                        className="rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 gap-2 font-bold px-4 shadow-sm h-9 text-xs"
                                    >
                                        <Search className="h-3.5 w-3.5" />
                                        Find Healthcare Center
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    <span className="truncate max-w-[250px] sm:max-w-xs">{profile.address}</span>
                                </div>
                                {profile.email && (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                        <span className="truncate max-w-[200px]">{profile.email}</span>
                                    </div>
                                )}
                                {profile.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Business Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row gap-4 sm:gap-6 w-full lg:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1 flex items-center gap-1">
                                <Users className="h-3 w-3" /> Staff
                            </span>
                            <span className="text-lg sm:text-xl font-black text-gray-900">{profile.numberOfStaff || 0}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1 flex items-center gap-1">
                                <FileCheck className="h-3 w-3" /> Reg No.
                            </span>
                            <span className="text-lg sm:text-xl font-black text-gray-900 font-mono truncate max-w-[100px] sm:max-w-none">
                                {profile.businessRegistrationNumber ? profile.businessRegistrationNumber : 'N/A'}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Registration
                            </span>
                            {regExpired ? (
                                <Badge variant="destructive" className="w-fit animate-pulse text-[9px] h-5 px-1.5">EXPIRED</Badge>
                            ) : (
                                <span className="text-sm font-black text-green-600 uppercase">Valid</span>
                            )}
                        </div>

                        {profile.leadProfessionalName && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Lead Pro</span>
                                <span className="text-sm font-black text-gray-900 truncate">
                                    {profile.leadProfessionalName}
                                </span>
                                {leadExpired && <span className="text-[8px] text-red-500 font-black uppercase mt-0.5 animate-bounce">Exp.</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Quick Links / Stats */}
                {(profile.services?.length || 0) > 0 || (profile.equipment?.length || 0) > 0 || (profile.personnels?.length || 0) > 0 ? (
                    <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
                        {profile.personnels && profile.personnels.length > 0 && (
                            <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600 font-medium py-1 px-3">
                                {profile.personnels.length} Specialized Personnel
                            </Badge>
                        )}
                        {profile.services && profile.services.length > 0 && (
                            <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-700 font-medium py-1 px-3">
                                {profile.services.length} Active Services
                            </Badge>
                        )}

                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
};
