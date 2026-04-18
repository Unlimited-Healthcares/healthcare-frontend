import { Center } from '@/types/discovery';
import { HealthcareCenter } from '@/types/healthcare-centers';

/**
 * Maps a Center (from discovery service) to HealthcareCenter (expected by CenterCard)
 * Handles the differences in data structure between the two types
 */
export const centerToHealthcareCenter = (center: Center): HealthcareCenter => {
  return {
    id: center.id,
    displayId: center.publicId || center.id,
    name: center.name,
    type: center.type || 'Unknown',
    address: center.address || '',
    latitude: center.latitude,
    longitude: center.longitude,
    city: center.city,
    state: center.state,
    country: center.generalLocation?.country,
    postalCode: center.zipCode,
    phone: center.phone,
    email: center.email,
    hours: center.hours,
    businessRegistrationNumber: center.businessRegistrationNumber,
    businessRegistrationDocUrl: center.businessRegistrationDocUrl,
    locationMetadata: center.locationMetadata,
    isActive: center.isActive,
    createdAt: center.createdAt || new Date().toISOString(),
    updatedAt: center.createdAt || new Date().toISOString()
  };
};

/**
 * Maps an array of Centers to HealthcareCenters
 */
export const centersToHealthcareCenters = (centers: Center[]): HealthcareCenter[] => {
  return centers.map(centerToHealthcareCenter);
};
