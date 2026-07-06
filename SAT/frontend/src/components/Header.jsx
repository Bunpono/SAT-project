function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M18.72 5.28 17.3 6.7M6.7 17.3l-1.42 1.42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M20 15.1A8.5 8.5 0 0 1 8.9 4a7.8 7.8 0 1 0 11.1 11.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Header({ theme, onToggleTheme }) {
  const isDark = theme === "dark"

  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex items-center gap-4">
        <img
          src="/sat-logo.png"
          alt="Syntactic Analysis Tool logo"
          className="h-12 w-auto shrink-0 object-contain sm:h-16"
        />
        <div>
          <h1 className="text-4xl font-semibold text-gray-950 dark:text-white">
            Syntactic Analysis Tool
          </h1>
          <p className="mt-1 text-lg font-normal text-gray-500 dark:text-slate-400">
            Advanced English Sentence Parser with Interactive Visualization
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </button>
    </header>
  )
}
