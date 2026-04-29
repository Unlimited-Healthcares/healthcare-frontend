'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, DollarSign, Clock, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import { centerManagementService } from '@/services/centerManagementService';
import { profileApi } from '@/services/profileApi';
import { SERVICE_CATEGORIES, CenterService, CenterServiceFormData } from '@/types/center-management';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const serviceFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Service name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  is_available: z.boolean().default(true),
  requires_appointment: z.boolean().default(true),
  category: z.string().optional(),
});

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

const TYPE_SPECIFIC_SERVICES: Record<string, string[]> = {
  diagnostic: [
    "MRI Scan",
    "CT Scan",
    "Digital X-Ray",
    "Ultrasound",
    "Complete Blood Count (CBC)",
    "ECG/EKG",
    "Biopsy",
    "Genetic Testing",
    "Stress Test",
    "Endoscopy"
  ],
  pharmacy: [
    "Prescription Dispensing",
    "Medication Counseling",
    "Annual Flu Shot",
    "COVID-19 Vaccination",
    "Blood Pressure Check",
    "Blood Glucose Monitoring",
    "Home Delivery Service",
    "Medication Therapy Management",
    "First Aid Supplies",
    "Health Supplements Advice"
  ],
  'fitness-center': [
    "Personal Training Session",
    "Yoga Group Class",
    "HIIT Workout",
    "Nutritional Consultation",
    "Swimming Lessons",
    "Body Composition Analysis",
    "Physiotherapy",
    "Massage Therapy",
    "Zumba Class",
    "CrossFit Training"
  ],
  clinic: [
    "General Consultation",
    "Pediatric Checkup",
    "Prenatal Care Visit",
    "Chronic Disease Management",
    "Minor Wound Dressing",
    "Flu Treatment",
    "Specialist Referral",
    "Wellness Physical",
    "Mental Health Support",
    "Travel Vaccination"
  ],
  hospital: [
    "Emergency Care",
    "Inpatient Surgery",
    "Intensive Care (ICU)",
    "Maternity/Delivery",
    "Oncology Treatment",
    "Orthopedic Surgery",
    "Cardiovascular Care",
    "Neurological Evaluation",
    "Dialysis Session",
    "Rehabilitation Program"
  ]
};

const DEFAULT_SERVICES = [
  "General Consultation",
  "Emergency Care",
  "Standard Checkup",
  "Follow-up Visit"
];

interface ServiceManagementProps {
  centerId?: string;
  userId?: string;
  centerType?: string;
}

export function ServiceManagement({ centerId, userId, centerType }: ServiceManagementProps) {
  const isUserMode = !!userId && !centerId;
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<CenterService[]>([]);
  const [filteredServices, setFilteredServices] = useState<CenterService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<boolean | null>(null);
  const [selectedService, setSelectedService] = useState<CenterService | null>(null);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      duration_minutes: undefined,
      price: undefined,
      currency: 'USD',
      is_available: true,
      requires_appointment: true,
      category: undefined,
    },
  });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      if (isUserMode && userId) {
        const profile = await profileApi.getUserProfile();
        const userServices = profile?.services || profile?.offeredServices || [];
        setServices(userServices);
        setFilteredServices(userServices);
      } else if (centerId) {
        const servicesData = await centerManagementService.getServices({
          center_id: centerId,
        });
        setServices(servicesData);
        setFilteredServices(servicesData);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [centerId, userId, isUserMode]);

  const applyFilters = useCallback(() => {
    let filtered = [...services];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (service.description &&
            service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    // Apply availability filter
    if (selectedAvailability !== null) {
      filtered = filtered.filter((service) => service.is_available === selectedAvailability);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory, selectedAvailability]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (services.length > 0) {
      applyFilters();
    }
  }, [applyFilters, services]);

  useEffect(() => {
    // Reset form when dialog closes
    if (!serviceDialogOpen) {
      form.reset({
        name: '',
        description: '',
        duration_minutes: undefined,
        price: undefined,
        currency: 'USD',
        is_available: true,
        requires_appointment: true,
        category: undefined,
      });
      setEditMode(false);
      setSelectedService(null);
    }
  }, [serviceDialogOpen, form]);

  useEffect(() => {
    // Populate form when editing
    if (editMode && selectedService) {
      form.reset({
        name: selectedService.name,
        description: selectedService.description || '',
        duration_minutes: selectedService.duration_minutes || undefined,
        price: selectedService.price || undefined,
        currency: (selectedService as any).currency || 'USD',
        is_available: selectedService.is_available,
        requires_appointment: selectedService.requires_appointment,
        category: selectedService.category || undefined,
      });
    }
  }, [editMode, selectedService, form]);

  const handleOpenServiceDialog = (mode: 'create' | 'edit', service?: CenterService) => {
    if (mode === 'edit' && service) {
      setSelectedService(service);
      setEditMode(true);
    } else {
      setEditMode(false);
    }
    setServiceDialogOpen(true);
  };

  const handleOpenDeleteDialog = (service: CenterService) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleCreateService = async (data: CenterServiceFormData) => {
    try {
      if (isUserMode) {
        const newService = { ...data, id: crypto.randomUUID() };
        const updatedServices = [...services, newService];
        await profileApi.createOrUpdateProfile({ services: updatedServices } as any);
        toast({
          title: 'Success',
          description: 'Service added to your profile.',
        });
        setServiceDialogOpen(false);
        fetchServices();
      } else if (centerId) {
        const response = await centerManagementService.createService(centerId, data);
        if (response.success) {
          toast({
            title: 'Success',
            description: response.message,
          });
          setServiceDialogOpen(false);
          fetchServices();
        } else {
          toast({
            title: 'Error',
            description: response.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateService = async (data: CenterServiceFormData) => {
    if (!selectedService) return;

    try {
      if (isUserMode) {
        const updatedServices = services.map((s) =>
          s.id === selectedService.id ? { ...s, ...data } : s
        );
        await profileApi.createOrUpdateProfile({ services: updatedServices } as any);
        toast({
          title: 'Success',
          description: 'Service updated on your profile.',
        });
        setServiceDialogOpen(false);
        fetchServices();
      } else {
        const response = await centerManagementService.updateService(selectedService.id, data);
        if (response.success) {
          toast({
            title: 'Success',
            description: response.message,
          });
          setServiceDialogOpen(false);
          fetchServices();
        } else {
          toast({
            title: 'Error',
            description: response.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      if (isUserMode) {
        const updatedServices = services.filter((s) => s.id !== selectedService.id);
        await profileApi.createOrUpdateProfile({ services: updatedServices } as any);
        toast({
          title: 'Success',
          description: 'Service removed from your profile.',
        });
        setDeleteDialogOpen(false);
        fetchServices();
      } else {
        const response = await centerManagementService.deleteService(selectedService.id);
        if (response.success) {
          toast({
            title: 'Success',
            description: response.message,
          });
          setDeleteDialogOpen(false);
          fetchServices();
        } else {
          toast({
            title: 'Error',
            description: response.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = (data: z.infer<typeof serviceFormSchema>) => {
    const serviceData: CenterServiceFormData = {
      name: data.name,
      description: data.description,
      duration_minutes: data.duration_minutes,
      price: data.price,
      currency: (data as any).currency,
      is_available: data.is_available,
      requires_appointment: data.requires_appointment,
      category: data.category,
    };

    if (editMode) {
      handleUpdateService(serviceData);
    } else {
      handleCreateService(serviceData);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedAvailability(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Service Management</h2>
      <p className="text-muted-foreground">
        Manage the services offered by your healthcare center.
      </p>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>Add, edit, and manage center services</CardDescription>
            </div>
            <Button onClick={() => handleOpenServiceDialog('create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={selectedCategory || 'all'}
                onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedAvailability !== null ? String(selectedAvailability) : 'all'}
                onValueChange={(value) =>
                  setSelectedAvailability(
                    value === 'all' ? null : value === 'true' ? true : false
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No services found.</p>
              <Button className="mt-4" onClick={() => handleOpenServiceDialog('create')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category || 'Uncategorized'}</TableCell>
                    <TableCell>
                      {service.duration_minutes
                        ? `${service.duration_minutes} mins`
                        : 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {service.price
                        ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: (service as any).currency || 'USD',
                        }).format(service.price)
                        : 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {service.is_available ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          Unavailable
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenServiceDialog('edit', service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleOpenDeleteDialog(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Service Form Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Update the service details below.'
                : 'Fill in the details for the new service offered by your center.'}
            </DialogDescription>
          </DialogHeader>

          {!editMode && (
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block font-medium">Quick Suggestions for {centerType?.replace('-', ' ') || 'General'}:</label>
              <div className="flex flex-wrap gap-2">
                {(centerType && (TYPE_SPECIFIC_SERVICES[centerType as keyof typeof TYPE_SPECIFIC_SERVICES] || DEFAULT_SERVICES) || DEFAULT_SERVICES).map(name => (
                  <Button
                    key={name}
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      form.setValue('name', name);
                    }}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter service name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a description of the service"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Duration"
                            className="pl-8"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseInt(e.target.value)
                                : undefined;
                              field.onChange(value);
                            }}
                            value={field.value || ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseFloat(e.target.value)
                                : undefined;
                              field.onChange(value);
                            }}
                            value={field.value || ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.code} - {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Available</FormLabel>
                        <FormDescription>
                          This service is currently available
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requires_appointment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Requires Appointment</FormLabel>
                        <FormDescription>
                          Patients need to book an appointment
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {editMode ? 'Update Service' : 'Add Service'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteService}>
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 