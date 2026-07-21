export function SplashPage() {
  return (
    <main
      role="status"
      aria-label="Loading Axol Work"
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-page"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-card bg-brand text-brand-fg text-3xl font-bold animate-pulse">
        A
      </div>
      <p className="text-fg-muted text-sm">Loading…</p>
    </main>
  )
}
