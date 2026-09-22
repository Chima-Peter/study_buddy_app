"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  newPasswordSchema,
  verifyResetCodeSchema,
  type NewPasswordInput,
  type VerifyResetCodeInput,
} from "@/lib/utils/validators";
import { resetPassword, verifyResetCode } from "@/lib/api/auth";
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
  const [resetToken, setResetToken] = useState<string | null>(null);

  const codeForm = useForm<VerifyResetCodeInput>({
    resolver: zodResolver(verifyResetCodeSchema),
    defaultValues: {
      email: initialEmail,
      code: "",
    },
  });

  const passwordForm = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "" },
  });

  const email = codeForm.watch("email");
  const resendHref = useMemo(() => {
    if (!email) return routes.forgotPassword;
    return `${routes.forgotPassword}?email=${encodeURIComponent(email)}`;
  }, [email]);

  const onVerifyCode = codeForm.handleSubmit(async (values) => {
    setError(null);
    try {
      const { token } = await verifyResetCode(values);
      setResetToken(token);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not verify reset code",
      );
    }
  });

  const onResetPassword = passwordForm.handleSubmit(async (values) => {
    if (!resetToken) return;
    setError(null);
    try {
      await resetPassword({ token: resetToken, password: values.password });
      router.replace(routes.login);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not reset password",
      );
    }
  });

  if (resetToken) {
    return (
      <form onSubmit={onResetPassword} className="space-y-4">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          error={passwordForm.formState.errors.password?.message}
          {...passwordForm.register("password")}
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
        <Button
          type="submit"
          className="w-full"
          disabled={passwordForm.formState.isSubmitting}
        >
          {passwordForm.formState.isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          <Link href={routes.login} className="text-primary-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onVerifyCode} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={codeForm.formState.errors.email?.message}
        {...codeForm.register("email")}
      />
      <Input
        label="Reset code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="6-digit code"
        error={codeForm.formState.errors.code?.message}
        {...codeForm.register("code")}
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
      <Button
        type="submit"
        className="w-full"
        disabled={codeForm.formState.isSubmitting}
      >
        {codeForm.formState.isSubmitting ? "Verifying..." : "Verify code"}
      </Button>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        <Link href={routes.login} className="text-primary-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
