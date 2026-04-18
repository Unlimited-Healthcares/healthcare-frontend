
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateUniqueId } from '@/lib/utils';

const centerSchema = z.object({
  name: z.string().min(2, "Center name must be at least 2 characters"),
  type: z.enum([
    "general_hospital",
    "pharmacy",
    "diagnostic",
    "eye_center",
    "virology_center",
    "incubation_center",
    "ambulance_service",
    "morgue",
    "fitness_center",
    "psychiatric",
    "care_home",
    "hospice",
    "equipment_vendor",
    "funeral_service"
  ]),
  address: z.string().min(5, "Please enter a valid address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  hours: z.string().optional(),
  description: z.string().optional(),
  services: z.string().optional(),
  practice_number: z.string().optional(),
  business_registration_number: z.string().min(1, "Business Registration Number is required"),
  business_registration_doc: z.any().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  emergency_contact: z.string().optional(),
});

type CenterFormValues = z.infer<typeof centerSchema>;

interface CenterRegistrationFormProps {
  userId?: string;
  onComplete?: () => void;
}

export function CenterRegistrationForm({ userId, onComplete }: CenterRegistrationFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Determine the default center type based on the user's primary role
  const getDefaultType = () => {
    const primaryRole = user?.roles?.[0];
    if (primaryRole === 'diagnostic') return 'diagnostic';
    if (primaryRole === 'pharmacy') return 'pharmacy';
    if (primaryRole === 'fitness_center') return 'fitness_center';
    if (primaryRole === 'ambulance_service') return 'ambulance_service';
    if (primaryRole === 'mortuary') return 'morgue';
    return "general_hospital";
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CenterFormValues>({
    resolver: zodResolver(centerSchema),
    defaultValues: {
      name: "",
      type: getDefaultType(),
      address: "",
      phone: "",
      email: user?.email || "",
      hours: "",
      description: "",
      services: "",
      practice_number: "",
      business_registration_number: "",
      business_registration_doc: null,
      website: "",
      emergency_contact: "",
    },
  });

  const centerType = watch("type");

  const onSubmit = async (data: CenterFormValues) => {
    try {
      setLoading(true);

      // Use the authenticated user's ID or the provided userId
      const ownerId = userId || user?.id;

      if (!ownerId) {
        toast.error("User authentication required");
        return;
      }

      // Generate a unique display ID for the center
      const displayId = generateUniqueId('center');

      // Insert the center data into the healthcare_centers table
      const { error } = await supabase
        .from("healthcare_centers")
        .insert({
          name: data.name,
          type: data.type,
          address: data.address,
          phone: data.phone,
          email: data.email,
          hours: data.hours,
          description: data.description,
          services: data.services,
          practice_number: data.practice_number,
          business_registration_number: data.business_registration_number,
          website: data.website || null,
          emergency_contact: data.emergency_contact,
          owner_id: ownerId,
          display_id: displayId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Healthcare center registered successfully!");

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Otherwise navigate to the dashboard
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to register healthcare center";
      toast.error(errorMessage);
      console.error("Center registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render type-specific fields
  const renderTypeSpecificFields = () => {
    switch (centerType) {
      case "general_hospital":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="practice_number">Hospital Practice Number</Label>
              <Input
                id="practice_number"
                placeholder="Practice Number"
                {...register("practice_number")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                placeholder="Emergency Contact Number"
                {...register("emergency_contact")}
              />
            </div>
          </>
        );

      case "pharmacy":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="practice_number">Pharmacy Practice Number</Label>
              <Input
                id="practice_number"
                placeholder="Practice Number"
                {...register("practice_number")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="services">Services Offered</Label>
              <Textarea
                id="services"
                placeholder="Prescription filling, OTC medications, etc."
                {...register("services")}
              />
            </div>
          </>
        );

      case "diagnostic":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="services">Imaging & Lab Services</Label>
              <Textarea
                id="services"
                placeholder="X-ray, MRI, CT scan, blood tests, etc."
                {...register("services")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practice_number">Diagnostic Center License Number</Label>
              <Input
                id="practice_number"
                placeholder="Practice Number"
                {...register("practice_number")}
              />
            </div>
          </>
        );

      case "ambulance_service":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact Number</Label>
              <Input
                id="emergency_contact"
                placeholder="24/7 Emergency Contact"
                {...register("emergency_contact")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="services">Service Coverage Area</Label>
              <Textarea
                id="services"
                placeholder="List areas/regions covered"
                {...register("services")}
              />
            </div>
          </>
        );

      // Add more cases for other center types as needed

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold">Register Healthcare Center</CardTitle>
        <CardDescription>
          Enter your healthcare center's information
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Center Name</Label>
            <Input
              id="name"
              placeholder="Medical Center Name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Center Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select center type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_hospital">General Hospital</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic Center</SelectItem>
                    <SelectItem value="eye_center">Eye Center</SelectItem>
                    <SelectItem value="virology_center">Virology Center</SelectItem>
                    <SelectItem value="incubation_center">Incubation Center</SelectItem>
                    <SelectItem value="ambulance_service">Ambulance Drivers / Medical Transport</SelectItem>
                    <SelectItem value="morgue">Morgue</SelectItem>
                    <SelectItem value="fitness_center">Fitness Center</SelectItem>
                    <SelectItem value="psychiatric">Psychiatric Center</SelectItem>
                    <SelectItem value="care_home">Care Home</SelectItem>
                    <SelectItem value="hospice">Hospice</SelectItem>
                    <SelectItem value="equipment_vendor">Medical Equipment Vendor</SelectItem>
                    <SelectItem value="funeral_service">Funeral Service</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Full address"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="center@example.com"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Operating Hours</Label>
            <Input
              id="hours"
              placeholder="Mon-Fri: 9am-5pm, Sat: 10am-2pm"
              {...register("hours")}
            />
            {errors.hours && (
              <p className="text-sm text-red-500">{errors.hours.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_registration_number">Business Registration Number *</Label>
            <Input
              id="business_registration_number"
              placeholder="RC1234567"
              {...register("business_registration_number")}
            />
            {errors.business_registration_number && (
              <p className="text-sm text-red-500">{errors.business_registration_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_registration_doc">Upload Registration Document *</Label>
            <Input
              id="business_registration_doc"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // You would typically handle the file upload here or on submit
                  // For now we set it to the form state
                }
              }}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              {...register("website")}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your healthcare center"
              {...register("description")}
            />
          </div>

          {/* Render type-specific fields */}
          {renderTypeSpecificFields()}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering Center..." : "Register Center"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 