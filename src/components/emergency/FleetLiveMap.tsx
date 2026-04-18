import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Navigation,
    MapPin,
    Truck,
    AlertCircle,
    Activity,
    Clock,
    Maximize2,
    Layers,
    LocateFixed
} from 'lucide-react';
import { useEmergencyTracking } from '@/hooks/useEmergencyTracking';
import { emergencyService } from '@/services/emergencyService';
import { toast } from 'sonner';

interface Vehicle {
    id: string;
    label: string;
    lat: number;
    lng: number;
    status: 'en_route' | 'on_scene' | 'returning' | 'available';
    patient?: string;
    lastUpdate: string;
    personnel: string;
}

export function FleetLiveMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMap = useRef<any>(null);
    const markers = useRef<Map<string, any>>(new Map());
    const [activeVehicles, setActiveVehicles] = useState<Vehicle[]>([
        {
            id: 'UNIT-01',
            label: 'AMB-001',
            lat: 6.5244,
            lng: 3.3792,
            status: 'en_route',
            patient: 'Critical - Mary O.',
            lastUpdate: new Date().toISOString(),
            personnel: 'Staff John, Nurse Alice'
        },
        {
            id: 'UNIT-04',
            label: 'AMB-002',
            lat: 6.5401,
            lng: 3.3900,
            status: 'on_scene',
            patient: 'Stable - Peter K.',
            lastUpdate: new Date().toISOString(),
            personnel: 'Staff Bob, Nurse Eve'
        },
        {
            id: 'UNIT-07',
            label: 'AMB-003',
            lat: 6.5000,
            lng: 3.3500,
            status: 'returning',
            patient: '-',
            lastUpdate: new Date().toISOString(),
            personnel: 'Staff Sam, Nurse Sue'
        }
    ]);
    const { isConnected, subscribe } = useEmergencyTracking();
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initialize Google Map
    useEffect(() => {
        if (!mapRef.current) return;

        const loadMap = () => {
            const win = window as any;
            if (win.google && win.google.maps) {
                const mapOptions: any = {
                    center: { lat: 6.5244, lng: 3.3792 },
                    zoom: 13,
                    mapId: 'AMBULANCE_FLEET_MAP', // Optional: for advanced markers
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    scaleControl: true,
                    streetViewControl: false,
                    rotateControl: true,
                    fullscreenControl: true,
                    styles: [
                        {
                            "featureType": "all",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#7c93a3" }]
                        },
                        {
                            "featureType": "administrative",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#444444" }]
                        },
                        {
                            "featureType": "landscape",
                            "elementType": "all",
                            "stylers": [{ "color": "#f2f2f2" }]
                        },
                        {
                            "featureType": "poi",
                            "elementType": "all",
                            "stylers": [{ "visibility": "off" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "all",
                            "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "all",
                            "stylers": [{ "visibility": "simplified" }]
                        },
                        {
                            "featureType": "road.arterial",
                            "elementType": "labels.icon",
                            "stylers": [{ "visibility": "off" }]
                        },
                        {
                            "featureType": "transit",
                            "elementType": "all",
                            "stylers": [{ "visibility": "off" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "all",
                            "stylers": [{ "color": "#dbeafe" }, { "visibility": "on" }]
                        }
                    ]
                };

                googleMap.current = new win.google.maps.Map(mapRef.current!, mapOptions);
                setMapLoaded(true);
            }
        };

        if ((window as any).google) {
            loadMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`;
            script.async = true;
            script.defer = true;
            script.onload = loadMap;
            document.head.appendChild(script);
        }
    }, []);

    // Update markers when activeVehicles change
    useEffect(() => {
        const win = window as any;
        if (!win.google || !googleMap.current || !mapLoaded) return;

        activeVehicles.forEach(vehicle => {
            let marker = markers.current.get(vehicle.id);

            if (!marker) {
                marker = new win.google.maps.Marker({
                    position: { lat: vehicle.lat, lng: vehicle.lng },
                    map: googleMap.current,
                    title: vehicle.id,
                    icon: {
                        path: vehicle.status === 'en_route' ? win.google.maps.SymbolPath.FORWARD_CLOSED_ARROW : win.google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        fillColor: vehicle.status === 'en_route' ? "#ef4444" : vehicle.status === 'on_scene' ? "#f59e0b" : "#10b981",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                    }
                });

                const infoWindow = new win.google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px; font-family: sans-serif;">
                            <h4 style="margin: 0 0 4px 0; font-weight: 800; color: #111827;">${vehicle.id}</h4>
                            <p style="margin: 0; font-size: 11px; color: #6b7280;">Status: <b>${vehicle.status.replace('_', ' ').toUpperCase()}</b></p>
                            <p style="margin: 4px 0 0 0; font-size: 10px; color: #ef4444; font-weight: 700;">${vehicle.patient}</p>
                            <p style="margin: 4px 0 0 0; font-size: 10px; color: #4b5563;">${vehicle.personnel}</p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(googleMap.current, marker);
                });

                markers.current.set(vehicle.id, marker);
            } else {
                marker.setPosition({ lat: vehicle.lat, lng: vehicle.lng });
            }
        });
    }, [activeVehicles, mapLoaded]);

    // Listen for live updates
    useEffect(() => {
        const handleLocationUpdate = (data: any) => {
            setActiveVehicles(prev => prev.map(v =>
                v.id === data.ambulanceId
                    ? { ...v, lat: data.latitude, lng: data.longitude, lastUpdate: new Date().toISOString() }
                    : v
            ));
        };

        subscribe('ambulance_location_update', handleLocationUpdate);
    }, [subscribe]);

    return (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100">
                            <Navigation className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-gray-900 leading-tight">LIVE DISPATCH CONTROL</CardTitle>
                            <CardDescription className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">
                                <Activity className="h-3 w-3" /> Real-time Global Fleet Positioning
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <Badge className={`${isConnected ? 'bg-emerald-500' : 'bg-red-500'} text-white border-none rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-tighter`}>
                                {isConnected ? 'Real-time Link Active' : 'Offline Mode'}
                            </Badge>
                            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">SAT-SYNC: 1.2s LATENCY</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative bg-slate-50 min-h-[550px]">
                <div
                    ref={mapRef}
                    className="absolute inset-0 z-0 bg-slate-200"
                    style={{ background: 'radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%)' }}
                />

                {/* Tracking Overlay UI */}
                <div className="absolute top-6 left-6 z-10 w-72 space-y-3 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white pointer-events-auto">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">FLEET SUMMARY</h5>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-red-50 rounded-xl border border-red-100/50">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-tighter">Active Missions</p>
                                <p className="text-xl font-black text-red-900">{activeVehicles.filter(v => v.status !== 'available').length}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Avg Response</p>
                                <p className="text-xl font-black text-emerald-900">8.4m</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white max-h-[300px] overflow-y-auto pointer-events-auto custom-scrollbar">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">UNIT TRACKING</h5>
                        <div className="space-y-2">
                            {activeVehicles.map((vehicle) => (
                                <div key={vehicle.id} className="group p-2.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-100 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${vehicle.status === 'en_route' ? 'bg-red-500 animate-pulse' : vehicle.status === 'on_scene' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            <span className="text-[11px] font-black text-slate-900">{vehicle.id}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-black border-slate-200 uppercase bg-white">
                                            {vehicle.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-bold text-red-600 uppercase tracking-tight">{vehicle.patient}</p>
                                            <p className="text-[8px] font-medium text-slate-400 mt-0.5">{vehicle.personnel}</p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => googleMap.current?.panTo({ lat: vehicle.lat, lng: vehicle.lng })}
                                        >
                                            <LocateFixed className="h-3 w-3 text-blue-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Controls */}
                <div className="absolute right-6 top-6 z-10 space-y-2">
                    <Button size="icon" className="h-10 w-10 rounded-xl bg-white text-slate-600 shadow-xl border-none hover:bg-slate-50">
                        <Layers className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="h-10 w-10 rounded-xl bg-white text-slate-600 shadow-xl border-none hover:bg-slate-50">
                        <Maximize2 className="h-5 w-5" />
                    </Button>
                </div>

                {/* Bottom Navigation HUD */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] pointer-events-none">
                    <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/10 pointer-events-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                                    <Truck className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Fleet</p>
                                    <p className="text-sm font-black text-white">12 Vehicles Active</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-500/30">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority Calls</p>
                                    <p className="text-sm font-black text-white">3 Pending Actions</p>
                                </div>
                            </div>
                        </div>
                        <Button className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20">
                            DEPLOY RAPID RESPONSE <Activity className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20">
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                                <Navigation className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 uppercase">Synchronizing Fleet...</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Establishing Secure Satellite Uplink</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

