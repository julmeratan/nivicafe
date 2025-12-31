import { z } from 'zod';

// Phone number validation: 10-15 digits, optionally starting with +
export const phoneSchema = z
  .string()
  .trim()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be at most 15 digits')
  .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits)');

// Email validation (optional field)
export const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .optional()
  .or(z.literal(''));

// Address validation
export const addressSchema = z
  .string()
  .trim()
  .min(10, 'Address must be at least 10 characters')
  .max(500, 'Address must be less than 500 characters');

// Special instructions validation
export const specialInstructionsSchema = z
  .string()
  .trim()
  .max(500, 'Special instructions must be less than 500 characters')
  .optional()
  .or(z.literal(''));

// Table number validation
export const tableNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+$/, 'Please enter a valid table number')
  .refine((val) => parseInt(val) > 0 && parseInt(val) <= 999, 'Table number must be between 1 and 999');

// Checkout form validation schema
export const checkoutFormSchema = z.object({
  phone: phoneSchema,
  deliveryType: z.enum(['dine_in', 'takeaway', 'delivery']),
  tableNumber: z.string().optional(),
  address: z.string().optional(),
  specialRequests: specialInstructionsSchema,
}).refine(
  (data) => {
    if (data.deliveryType === 'dine_in') {
      return data.tableNumber && /^[0-9]+$/.test(data.tableNumber.trim()) && parseInt(data.tableNumber) > 0;
    }
    return true;
  },
  { message: 'Please enter a valid table number', path: ['tableNumber'] }
).refine(
  (data) => {
    if (data.deliveryType === 'delivery') {
      return data.address && data.address.trim().length >= 10;
    }
    return true;
  },
  { message: 'Please enter a valid delivery address (at least 10 characters)', path: ['address'] }
);

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Sanitize text for safe display (prevent XSS)
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  // Remove any HTML tags and encode special characters
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Validate and sanitize phone number
export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  const sanitized = phone.replace(/[^\d+]/g, '');
  // Ensure + is only at the start
  if (sanitized.includes('+') && !sanitized.startsWith('+')) {
    return sanitized.replace(/\+/g, '');
  }
  return sanitized;
}
