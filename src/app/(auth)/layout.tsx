export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-glow px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface-secondary/95 p-8 shadow-lg backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-lg font-bold text-white">
            SB
          </div>
          <h1 className="text-2xl font-bold">StudyBuddy</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
