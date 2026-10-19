import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email')
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm your password')
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const candidateRegisterSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  experienceYears: z.string().min(1, 'Please select your experience level'),
  primaryRole: z.string().min(2, 'Please select your target role')
});

export const employerRegisterSchema = candidateRegisterSchema.extend({
  companyName: z.string().min(2, 'Company name is required'),
  companySize: z.string().min(1, 'Please select your company size'),
  hiringFocus: z.string().min(2, 'Please choose your hiring focus')
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message is required')
});
