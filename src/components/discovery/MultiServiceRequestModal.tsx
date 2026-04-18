import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Plus,
    X,
    Stethoscope,
    Activity,
    Heart,
    Truck,
    Microscope,
    Filter,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Building,
    ChevronDown,
    Pill,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/types/discovery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check } from 'lucide-react';

interface MultiServiceRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialService?: string;
}

const COMMON_SERVICES = [
    { name: 'General Medical Tests', icon: Microscope, category: 'center' },
    { name: 'MRI / CT Scan', icon: Microscope, category: 'center' },
    { name: 'Blood Test Panel', icon: Activity, category: 'center' },
    { name: 'Ultrasound', icon: Activity, category: 'center' },
    { name: 'Radiology / Imaging', icon: Activity, category: 'center' },
    { name: 'General Consultation', icon: Stethoscope, category: 'doctor' },
    { name: 'Cardiology Review', icon: Heart, category: 'doctor' },
    { name: 'Emergency Ambulance', icon: Truck, category: 'center' },
    { name: 'Red Cross Response', icon: Heart, category: 'emergency' },
    { name: 'Fire & Rescue', icon: Truck, category: 'emergency' },
    { name: 'Prosthetics & Orthotics', icon: Activity, category: 'doctor' },
];

export const MultiServiceRequestModal = ({ isOpen, onClose, initialService }: MultiServiceRequestModalProps) => {
    const isEmergency = initialService === 'Emergency Assistance' || initialService === 'Call Ambulance';
    const [selectedServices, setSelectedServices] = useState<string[]>(initialService ? [initialService] : []);
    const [customService, setCustomService] = useState('');
    const [country, setCountry] = useState('');
    const [openCountry, setOpenCountry] = useState(false);
    const [city, setCity] = useState('');
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [searchType, setSearchType] = useState<string>(isEmergency ? 'center' : 'doctor');
    const navigate = useNavigate();

    const detectLocation = async () => {
        setIsDetectingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Reverse geocoding using a free API (e.g., bigdatacloud or openstreetmap)
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await response.json();

                    if (data.city || data.locality) {
                        setCity(data.city || data.locality || data.principalSubdivision);
                        if (data.countryName) setCountry(data.countryName);
                        toast.success(`Location detected: ${data.city || data.locality}`);
                    }
                } catch (error) {
                    console.error("Location detection failed", error);
                    toast.error("Could not determine specific town. Please enter manually.");
                } finally {
                    setIsDetectingLocation(false);
                }
            }, (error) => {
                toast.error("Location access denied. Please enter your town manually.");
                setIsDetectingLocation(false);
            });
        } else {
            toast.error("Geolocation not supported by your browser.");
            setIsDetectingLocation(false);
        }
    };

    const addService = (service: string) => {
        if (!selectedServices.includes(service)) {
            setSelectedServices([...selectedServices, service]);
            setCustomService('');
        }
    };

    const removeService = (service: string) => {
        setSelectedServices(selectedServices.filter(s => s !== service));
    };

    const handleFetchProviders = () => {
        if (selectedServices.length === 0) {
            toast.error("Please add at least one service you need.");
            return;
        }

        const params = new URLSearchParams();
        const serviceQuery = selectedServices.join(',');
        params.append('service', serviceQuery);

        if (country) params.append('country', country);
        if (city) params.append('city', city);

        // Enhanced Emergency Routing Logic
        if (isEmergency) {
            if (searchType === 'doctor') {
                // Search for specialized emergency practitioners/doctors
                params.append('type', 'doctor');
                params.append('specialty', 'Emergency Medicine');
            } else {
                // Search for emergency facilities
                params.append('type', 'center');
                params.append('service', 'Emergency,Ambulance,' + serviceQuery);
            }
        } else {
            params.append('type', searchType);
        }

        navigate(`/discovery?${params.toString()}`);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 border-0 shadow-2xl overflow-y-auto max-h-[90dvh] bg-white z-[155] mb-safe">
                {/* Visual Header */}
                <div className={cn(
                    "p-8 text-white relative",
                    isEmergency
                        ? "bg-gradient-to-br from-red-600 via-rose-700 to-red-900"
                        : "bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900"
                )}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        {isEmergency ? <Truck className="h-32 w-32" /> : <Activity className="h-32 w-32" />}
                    </div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
                            <Plus className={cn(
                                "h-7 w-7 rounded-full p-1 border",
                                isEmergency ? "bg-red-500/30 border-red-400/50" : "bg-blue-500/30 border-blue-400/50"
                            )} />
                            {isEmergency ? 'Critical Emergency Request' : 'Interactive Request Form'}
                        </DialogTitle>
                        <DialogDescription className={isEmergency ? "text-red-100 font-medium" : "text-blue-200 font-medium"}>
                            {isEmergency
                                ? "Urgent! Select the specific emergency assistance you need immediately."
                                : "Select all the services you need. We'll find matching professionals for your specific request with their current prices."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8 pb-32">
                    {/* Multi-Service Builder */}
                    <div className="space-y-4">
                        <Label className="text-gray-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            Selected Services
                        </Label>

                        <div className="min-h-[60px] p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-wrap gap-2 items-center">
                            {selectedServices.length === 0 ? (
                                <p className="text-sm text-slate-400 font-medium italic">No services added yet...</p>
                            ) : (
                                selectedServices.map(service => (
                                    <Badge
                                        key={service}
                                        className="h-9 px-4 rounded-xl bg-blue-600 border-blue-600 text-white flex items-center gap-2 hover:bg-red-600 hover:border-red-600 transition-all group cursor-pointer active:scale-95 shadow-md"
                                        onClick={() => removeService(service)}
                                    >
                                        <span className="font-bold">{service}</span>
                                        <X className="h-3 w-3 opacity-80 group-hover:opacity-100" />
                                    </Badge>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Type service (e.g. MRI, Prosthetics, Blood Test)"
                                    className="pl-11 h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                                    value={customService}
                                    onChange={(e) => setCustomService(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (customService.trim()) addService(customService.trim());
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold active:scale-95"
                                onClick={() => customService && addService(customService)}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(isEmergency
                                ? COMMON_SERVICES.filter(s => s.category === 'emergency')
                                : COMMON_SERVICES.filter(s => s.category !== 'emergency')
                            ).map(service => (
                                <button
                                    key={service.name}
                                    type="button"
                                    onClick={() => addService(service.name)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold shadow-sm active:scale-95",
                                        isEmergency
                                            ? "border-red-100 bg-white text-red-600 hover:border-red-200 hover:bg-red-50"
                                            : "border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
                                    )}
                                >
                                    <service.icon className="h-3 w-3" />
                                    {service.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Building className="h-3 w-3" /> Provider Category
                        </Label>
                        <Select value={searchType} onValueChange={setSearchType}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-700">
                                <SelectValue placeholder="Select provider category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden z-[10002]">
                                {!isEmergency && (
                                    <SelectItem value="doctor" className="rounded-lg font-bold py-3">
                                        <div className="flex items-center gap-3">
                                            <Stethoscope className="h-4 w-4 text-blue-600" /> Doctors & Specialists
                                        </div>
                                    </SelectItem>
                                )}
                                <SelectItem value="center" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Building className="h-4 w-4 text-emerald-600" /> Hospitals & Clinics</div></SelectItem>
                                <SelectItem value="diagnostic" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Microscope className="h-4 w-4 text-purple-600" /> Diagnostic Centers</div></SelectItem>
                                <SelectItem value="pharmacy" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Pill className="h-4 w-4 text-amber-600" /> Pharmacies & Chemists</div></SelectItem>
                                <SelectItem value="maternity" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Heart className="h-4 w-4 text-rose-600" /> Maternity Centers</div></SelectItem>
                                <SelectItem value="ambulance" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Truck className="h-4 w-4 text-red-600" /> Ambulance Services</div></SelectItem>
                                <SelectItem value="nurse" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Activity className="h-4 w-4 text-teal-600" /> Nurses & Care Workers</div></SelectItem>
                                <SelectItem value="biotech_engineer" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Zap className="h-4 w-4 text-blue-500" /> Biotech & Prosthetics</div></SelectItem>
                                <SelectItem value="allied_practitioner" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Activity className="h-4 w-4 text-indigo-600" /> Allied Health Professionals</div></SelectItem>
                                <SelectItem value="research_center" className="rounded-lg font-bold py-3"><div className="flex items-center gap-3"><Microscope className="h-4 w-4 text-slate-600" /> Research Institutions</div></SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Filter className="h-3 w-3" /> Target Country
                            </Label>
                            <Popover open={openCountry} onOpenChange={setOpenCountry}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCountry}
                                        className="w-full h-11 rounded-xl justify-between font-medium border-slate-200"
                                    >
                                        {country ? country : "Select Country"}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 z-[10001]">
                                    <Command>
                                        <CommandInput placeholder="Search your country..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup>
                                                {COUNTRIES.map((c) => (
                                                    <CommandItem
                                                        key={c}
                                                        value={c}
                                                        onSelect={(currentValue) => {
                                                            setCountry(currentValue === country ? "" : currentValue)
                                                            setOpenCountry(false)
                                                        }}
                                                        className="flex items-center justify-between"
                                                    >
                                                        {c}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                country === c ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Smallest Town / Neighborhood
                            </Label>
                            <div className="relative">
                                <Input
                                    placeholder="Enter Town/Neighborhood"
                                    className="h-11 rounded-xl pr-20"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={isDetectingLocation}
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-9 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                                >
                                    {isDetectingLocation ? "..." : "Detect"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pb-20 sm:pb-8 bg-slate-50 sticky bottom-0 border-t border-slate-100 z-10">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl font-bold text-slate-500 hidden sm:flex"
                    >
                        Cancel
                    </Button>
                    <Button
                        className={cn(
                            "w-full sm:w-auto rounded-xl px-8 h-12 font-black uppercase tracking-tight shadow-xl group transition-all duration-300",
                            selectedServices.length === 0
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-200"
                        )}
                        onClick={handleFetchProviders}
                        disabled={selectedServices.length === 0}
                    >
                        {selectedServices.length === 0 ? "Select a Service" : "Fetch Matching Providers"}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
