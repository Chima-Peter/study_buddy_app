import Link from "next/link";
import { routes } from "@/config/routes";
import { LogoMark } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-glow px-4 py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.2),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(240,196,25,0.12),_transparent_45%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface-secondary/95 p-5 shadow-lg backdrop-blur sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <Link href={routes.home} className="inline-flex flex-col items-center gap-3">
            <LogoMark className="h-12 w-12 rounded-xl" title="StudyBuddy" />
            <span className="text-2xl font-bold tracking-tight">
              Study<span className="text-primary-700">Buddy</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
