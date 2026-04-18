'use client';

import { useState, useEffect } from 'react';
import {
    Building2,
    MapPin,
    Mail,
    Phone,
    Users,
    FileCheck,
    Calendar,
    AlertCircle,
    Upload,
    UserPlus,
    Trash2,
    Pencil,
    Plus,
    Activity as ActivityIcon
} from 'lucide-react';
import { ClinicalAuditTrail } from '../clinical/ClinicalAuditTrail';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { CenterProfile, CenterPersonnel } from '@/types/profile';
import { profileApi } from '@/services/profileApi';
import { format, isPast, parseISO } from 'date-fns';

const facilitySchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    address: z.string().min(5, 'Address is too short'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(5, 'Invalid phone number'),
    numberOfStaff: z.number().min(0).default(0),
    businessRegistrationNumber: z.string().min(2, 'Registration number required'),
    registrationDateIssued: z.string().min(1, 'Date issued required'),
    registrationExpiryDate: z.string().min(1, 'Expiry date required'),
});

const personnelSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    practiceNumber: z.string().min(2, 'Practice number required'),
    dateIssued: z.string().min(1, 'Date issued required'),
    expiryDate: z.string().min(1, 'Expiry date required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
});

interface FacilityManagementProps {
    centerId: string;
}

export function FacilityManagement({ centerId }: FacilityManagementProps) {
    const [profile, setProfile] = useState<CenterProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingPersonnel, setIsAddingPersonnel] = useState(false);
    const [editingPersonnelId, setEditingPersonnelId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof facilitySchema>>({
        resolver: zodResolver(facilitySchema),
    });

    const personnelForm = useForm<z.infer<typeof personnelSchema>>({
        resolver: zodResolver(personnelSchema),
    });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await profileApi.getCenterById(centerId);
            setProfile(data);
            form.reset({
                name: data.name,
                address: data.address,
                email: data.email || '',
                phone: data.phone || '',
                numberOfStaff: data.numberOfStaff || 0,
                businessRegistrationNumber: data.businessRegistrationNumber || '',
                registrationDateIssued: data.registrationDateIssued || '',
                registrationExpiryDate: data.registrationExpiryDate || '',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast({
                title: 'Error',
                description: 'Could not load facility information',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (centerId) fetchProfile();
    }, [centerId]);

    const onFacilitySubmit = async (values: z.infer<typeof facilitySchema>) => {
        try {
            const updated = await profileApi.updateCenter(centerId, values);
            setProfile(updated);
            setIsEditing(false);
            toast({ title: 'Success', description: 'Facility information updated' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update information', variant: 'destructive' });
        }
    };

    const onPersonnelSubmit = async (values: z.infer<typeof personnelSchema>) => {
        try {
            const currentPersonnels = profile?.personnels || [];
            let updatedPersonnels;

            if (editingPersonnelId) {
                updatedPersonnels = currentPersonnels.map(p =>
                    p.id === editingPersonnelId ? { ...values, id: p.id } : p
                );
            } else {
                updatedPersonnels = [...currentPersonnels, { ...values, id: Math.random().toString(36).substr(2, 9) }];
            }

            const updated = await profileApi.updateCenter(centerId, { personnels: updatedPersonnels });
            setProfile(updated);
            setIsAddingPersonnel(false);
            setEditingPersonnelId(null);
            personnelForm.reset();
            toast({ title: 'Success', description: 'Personnel information updated' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update personnel', variant: 'destructive' });
        }
    };

    const deletePersonnel = async (id: string) => {
        try {
            const updatedPersonnels = (profile?.personnels || []).filter(p => p.id !== id);
            const updated = await profileApi.updateCenter(centerId, { personnels: updatedPersonnels });
            setProfile(updated);
            toast({ title: 'Success', description: 'Personnel removed' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to remove personnel', variant: 'destructive' });
        }
    };

    const editPersonnel = (personnel: CenterPersonnel) => {
        setEditingPersonnelId(personnel.id || null);
        personnelForm.reset({
            name: personnel.name,
            practiceNumber: personnel.practiceNumber,
            dateIssued: personnel.dateIssued,
            expiryDate: personnel.expiryDate,
            email: personnel.email,
            phone: personnel.phone,
        });
        setIsAddingPersonnel(true);
    };

    const isExpired = (dateString?: string) => {
        if (!dateString) return false;
        try {
            return isPast(parseISO(dateString));
        } catch {
            return false;
        }
    };

    if (loading) return <div>Loading facility info...</div>;

    return (
        <div className="space-y-6">
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl mb-4">
                    <TabsTrigger value="details" className="rounded-lg px-6">Enterprise Details</TabsTrigger>
                    <TabsTrigger value="personnel" className="rounded-lg px-6">Medical Personnel</TabsTrigger>
                    <TabsTrigger value="audit" className="rounded-lg px-6">Access Audit</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card className="border-none shadow-sm rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Facility Information</CardTitle>
                                <CardDescription>Official business details and registration</CardDescription>
                            </div>
                            <Button
                                variant={isEditing ? "outline" : "default"}
                                onClick={() => setIsEditing(!isEditing)}
                                className="rounded-xl"
                            >
                                {isEditing ? "Cancel" : "Edit Details"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onFacilitySubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Enterprise Name</FormLabel>
                                                        <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Official Email</FormLabel>
                                                        <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="numberOfStaff"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Number of Staff</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                                                className="rounded-xl"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Physical Address</FormLabel>
                                                    <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="border-t pt-4 mt-4">
                                            <h3 className="font-semibold mb-3">Business Registration</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="businessRegistrationNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Reg Number</FormLabel>
                                                            <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="registrationDateIssued"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Date Issued</FormLabel>
                                                            <FormControl><Input type="date" {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="registrationExpiryDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Expiry Date</FormLabel>
                                                            <FormControl><Input type="date" {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl text-white">Save Changes</Button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <InfoItem icon={Building2} label="Enterprise" value={profile?.name} />
                                        <InfoItem icon={Mail} label="Email" value={profile?.email} />
                                        <InfoItem icon={Phone} label="Phone" value={profile?.phone} />
                                        <InfoItem icon={MapPin} label="Address" value={profile?.address} className="md:col-span-2" />
                                        <InfoItem icon={Users} label="Staff Count" value={profile?.numberOfStaff?.toString() || '0'} />
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold flex items-center gap-2">
                                                <FileCheck className="h-5 w-5 text-blue-600" />
                                                Business Registration
                                            </h3>
                                            {isExpired(profile?.registrationExpiryDate) && (
                                                <Badge variant="destructive" className="animate-pulse">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Document Expired
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Number</p>
                                                <p className="font-mono font-bold">{profile?.businessRegistrationNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Date Issued</p>
                                                <p className="font-semibold">{profile?.registrationDateIssued ? format(parseISO(profile.registrationDateIssued), 'PPP') : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Expiry Date</p>
                                                <p className={cn("font-semibold", isExpired(profile?.registrationExpiryDate) ? "text-red-500" : "text-green-600")}>
                                                    {profile?.registrationExpiryDate ? format(parseISO(profile.registrationExpiryDate), 'PPP') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        {profile?.businessRegistrationDocUrl ? (
                                            <div className="mt-4 p-3 bg-white border rounded-xl flex items-center justify-between">
                                                <span className="text-sm font-medium">Registration Document</span>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={profile.businessRegistrationDocUrl} target="_blank" rel="noreferrer">View Doc</a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="mt-4 p-4 border-2 border-dashed rounded-xl text-center">
                                                <p className="text-sm text-gray-500 mb-2">No registration document uploaded</p>
                                                <Button variant="outline" size="sm">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload Now
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="personnel">
                    <Card className="border-none shadow-sm rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Medical Personnel</CardTitle>
                                <CardDescription>Manage doctors, nurses, and practitioners</CardDescription>
                            </div>
                            <Button
                                onClick={() => {
                                    setEditingPersonnelId(null);
                                    personnelForm.reset({ name: '', practiceNumber: '', dateIssued: '', expiryDate: '', email: '', phone: '' });
                                    setIsAddingPersonnel(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 rounded-xl text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Personnel
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isAddingPersonnel ? (
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                                    <h3 className="font-bold mb-4">{editingPersonnelId ? "Edit Personnel" : "Add New Personnel"}</h3>
                                    <Form {...personnelForm}>
                                        <form onSubmit={personnelForm.handleSubmit(onPersonnelSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={personnelForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Full Name</FormLabel>
                                                            <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={personnelForm.control}
                                                    name="practiceNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Practice Number</FormLabel>
                                                            <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={personnelForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email Address</FormLabel>
                                                            <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={personnelForm.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Phone (Optional)</FormLabel>
                                                            <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={personnelForm.control}
                                                    name="dateIssued"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Registration Date Issued</FormLabel>
                                                            <FormControl><Input type="date" {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={personnelForm.control}
                                                    name="expiryDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Expiry Date</FormLabel>
                                                            <FormControl><Input type="date" {...field} className="rounded-xl" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button type="button" variant="outline" onClick={() => setIsAddingPersonnel(false)} className="rounded-xl">Cancel</Button>
                                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl text-white">
                                                    {editingPersonnelId ? "Update" : "Add"} Personnel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(profile?.personnels || []).length === 0 ? (
                                    <div className="md:col-span-2 text-center py-12 border-2 border-dashed rounded-2xl">
                                        <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No medical personnel added yet</p>
                                    </div>
                                ) : (
                                    profile?.personnels?.map((person) => (
                                        <div key={person.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{person.name}</h4>
                                                        <p className="text-xs text-blue-600 font-medium">Practice: {person.practiceNumber}</p>
                                                    </div>
                                                    {isExpired(person.expiryDate) && (
                                                        <Badge variant="destructive" className="h-6">Expired</Badge>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {person.email}</div>
                                                    {person.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {person.phone}</div>}
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className={isExpired(person.expiryDate) ? "text-red-500 font-medium" : ""}>
                                                            Expires: {person.expiryDate ? format(parseISO(person.expiryDate), 'PP') : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50">
                                                <Button variant="ghost" size="sm" onClick={() => editPersonnel(person)} className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => person.id && deletePersonnel(person.id)} className="h-8 w-8 p-0 text-gray-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="audit">
                    <ClinicalAuditTrail />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value, className }: { icon: any, label: string, value?: string, className?: string }) {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</p>
                <p className="font-medium text-gray-900">{value || 'N/A'}</p>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
