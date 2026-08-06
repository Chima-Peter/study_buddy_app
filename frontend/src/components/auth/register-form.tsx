"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/utils/validators";
import { register as registerUser } from "@/lib/api/auth";
import { useSessionStore } from "@/stores/session-store";
import { routes } from "@/config/routes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";

export function RegisterForm() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const data = await registerUser(values);
      setSession(data.token, data.user);
      router.replace(routes.library);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href={routes.login} className="text-primary-400 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
