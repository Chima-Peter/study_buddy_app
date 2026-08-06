import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Create your account</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Start studying smarter with AI
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
