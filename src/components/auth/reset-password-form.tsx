"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/utils/validators";
import { resetPassword } from "@/lib/api/auth";
import { routes } from "@/config/routes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";

type ResetPasswordFormProps = {
  initialEmail?: string;
};

export function ResetPasswordForm({ initialEmail = "" }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      code: "",
      password: "",
    },
  });

  const email = watch("email");
  const resendHref = useMemo(() => {
    if (!email) return routes.forgotPassword;
    return `${routes.forgotPassword}?email=${encodeURIComponent(email)}`;
  }, [email]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await resetPassword(values);
      router.replace(routes.login);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not reset password",
      );
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
      <Input
        label="Reset code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="6-digit code"
        error={errors.code?.message}
        {...register("code")}
      />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {error && (
        <div
          className="space-y-2 rounded-md bg-error/10 px-3 py-2 text-sm text-error"
          role="alert"
        >
          <p>{error}</p>
          <Link
            href={resendHref}
            className="inline-block font-medium text-primary-700 hover:underline"
          >
            Resend reset code
          </Link>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset password"}
      </Button>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        <Link href={routes.login} className="text-primary-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
