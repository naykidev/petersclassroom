export function SplashPage() {
  return (
    <main
      role="status"
      aria-label="Loading Axol Work"
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-page"
    >
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 rounded-full animate-pulse"
        aria-hidden="true"
      />
      <p className="text-fg-muted text-sm">Loading…</p>
    </main>
  )
}
