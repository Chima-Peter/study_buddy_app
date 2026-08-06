import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Welcome back</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Continue your learning journey
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
