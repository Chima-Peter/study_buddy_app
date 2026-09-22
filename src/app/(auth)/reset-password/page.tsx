import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
  searchParams?: { email?: string };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const email = typeof searchParams?.email === "string" ? searchParams.email : "";

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Reset password</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Enter the 6-digit code from your email, then choose a new password
        </p>
      </div>
      {email ? (
        <p className="mb-4 rounded-md bg-primary-500/10 px-3 py-2 text-sm text-primary-800">
          A reset code has been sent. It expires in 5 minutes.
        </p>
      ) : null}
      <ResetPasswordForm initialEmail={email} />
    </div>
  );
}
