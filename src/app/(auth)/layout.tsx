import Link from "next/link";
import { routes } from "@/config/routes";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-glow px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.2),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(240,196,25,0.12),_transparent_45%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface-secondary/95 p-8 shadow-lg backdrop-blur">
        <div className="mb-8 text-center">
          <Link href={routes.home} className="inline-block">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-lg font-bold text-white">
              SB
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Study<span className="text-primary-700">Buddy</span>
            </h1>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
