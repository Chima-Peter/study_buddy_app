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

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z
    .string()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(3).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  university: z.string().optional().or(z.literal("")),
  bio: z.string().max(1500).optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
});

export const uploadSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
