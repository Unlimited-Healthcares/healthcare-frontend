
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a formatted unique ID for users and centers
 * Format: MED-[TYPE]-[RANDOM]-[TIMESTAMP]
 * Where TYPE is:
 * - P: Patient
 * - D: Doctor
 * - C: Center
 * - A: Admin
 */
export function generateUniqueId(type: 'patient' | 'doctor' | 'center' | 'admin'): string {
  const typeCode = type === 'patient' ? 'P' :
    type === 'doctor' ? 'D' :
      type === 'center' ? 'C' : 'A';

  // Generate a random alphanumeric string (4 characters)
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  // Use current timestamp (last 6 digits)
  const timestampPart = Date.now().toString().slice(-6);

  return `MED-${typeCode}-${randomPart}-${timestampPart}`;
}

export function getLicenseStatus(expiryDate: string | Date | undefined): {
  status: 'good' | 'warning' | 'expired',
  color: string,
  bg: string,
  border: string,
  text: string,
  message: string
} {
  if (!expiryDate) return {
    status: 'expired',
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    message: 'No License'
  };

  const expiry = new Date(expiryDate);
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  if (expiry < now) {
    return {
      status: 'expired',
      color: 'red',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      message: 'License Expired'
    };
  } else if (expiry < threeMonthsFromNow) {
    return {
      status: 'warning',
      color: 'yellow',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      message: 'Expiring Soon'
    };
  } else {
    return {
      status: 'good',
      color: 'green',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      message: 'License Valid'
    };
  }
}
