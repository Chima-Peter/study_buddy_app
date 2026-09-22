import { api } from "./client";
import type { AuthPayload, User } from "@/types";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  VerifyResetCodeInput,
  ResetPasswordInput,
  ProfileInput,
} from "@/lib/utils/validators";

export function register(input: RegisterInput) {
  return api.post<AuthPayload>("/authentication/register", input, { skipAuth: true });
}

export function login(input: LoginInput) {
  return api.post<AuthPayload>("/authentication/login", input, { skipAuth: true });
}

export function forgotPassword(input: ForgotPasswordInput) {
  return api.post<null>("/authentication/forgot-password", input, { skipAuth: true });
}

export function verifyResetCode(input: VerifyResetCodeInput) {
  return api.post<{ token: string }>("/authentication/verify-reset-code", input, {
    skipAuth: true,
  });
}

export function resetPassword(input: ResetPasswordInput) {
  return api.post<null>("/authentication/reset-password", input, { skipAuth: true });
}

export function logout() {
  return api.post<null>("/authentication/logout");
}

export function getMe() {
  return api.get<User>("/users/me");
}

export function updateMe(input: Partial<ProfileInput>) {
  const body = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined && v !== ""),
  );
  return api.patch<User>("/users/me", body);
}

export function deleteMe() {
  return api.delete<null>("/users/me");
}
