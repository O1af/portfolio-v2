import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Portfolio
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
          Basic SPA scaffold
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          This is a clean starting point. Add routes in
          <code className="mx-2 rounded bg-slate-900 px-2 py-1 text-sm text-slate-200">
            src/routes
          </code>
          and build from here.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Pages</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create new routes as files to expand the SPA.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Styles</h2>
            <p className="mt-2 text-sm text-slate-400">
              Tailwind is wired up in
              <code className="mx-2 rounded bg-slate-950 px-2 py-1 text-xs text-slate-300">
                src/styles.css
              </code>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
