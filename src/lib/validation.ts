import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const gameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(200, 'Short description is too long'),
  developer: z.string().min(1, 'Developer is required'),
  publisher: z.string().optional(),
  gameUrl: z.string().url('Invalid URL'),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  gameType: z.enum(['HTML5', 'WebGL', 'Unity', 'Flash', 'Other']),
  technologies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  ageRating: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GameInput = z.infer<typeof gameSchema>;
export type ContactInput = z.infer<typeof contactSchema>;