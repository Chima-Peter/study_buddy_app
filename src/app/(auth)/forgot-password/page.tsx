import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

type ForgotPasswordPageProps = {
  searchParams?: { email?: string };
};

export default function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const email = typeof searchParams?.email === "string" ? searchParams.email : "";

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Forgot password</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Enter your email and we&apos;ll send a reset code
        </p>
      </div>
      <ForgotPasswordForm initialEmail={email} />
    </div>
  );
}
