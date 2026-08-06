import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(3).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(8).optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  university: z.string().optional().or(z.literal("")),
  bio: z.string().max(1500).optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
});

export const uploadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
