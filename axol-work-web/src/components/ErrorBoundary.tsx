import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/** App-root error boundary — keeps a render crash from blanking the screen. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[axol] render error', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page p-6 text-center">
          <h1 className="text-title-2 text-fg">Something went wrong</h1>
          <p className="text-fg-muted">An unexpected error occurred. Reloading usually fixes it.</p>
          <button
            onClick={() => window.location.reload()}
            className="min-h-touch rounded-btn bg-brand px-6 font-semibold text-brand-fg"
          >
            Reload
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
