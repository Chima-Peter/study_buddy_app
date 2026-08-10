"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/utils/validators";
import { forgotPassword } from "@/lib/api/auth";
import { routes } from "@/config/routes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";

function forgotPasswordErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "Could not send reset code";
  if (err.status === 400) return "No account for that email";
  return err.message;
}

type ForgotPasswordFormProps = {
  initialEmail?: string;
};

export function ForgotPasswordForm({ initialEmail = "" }: ForgotPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await forgotPassword(values);
      const params = new URLSearchParams({ email: values.email });
      router.push(`${routes.resetPassword}?${params.toString()}`);
    } catch (err) {
      setError(forgotPasswordErrorMessage(err));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending code..." : "Send reset code"}
      </Button>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        Remembered your password?{" "}
        <Link href={routes.login} className="text-primary-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
