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

export default function Header({ theme, onToggleTheme, user, onLogout }) {
  const isDark = theme === "dark"

  return (
    <header className="flex flex-col items-start justify-between gap-6 transition-colors duration-300 sm:flex-row sm:items-center">
      <div className="flex items-center gap-5">
        <img
          src="/sat-logo.png"
          alt="Syntactic Analysis Tool logo"
          className="h-14 w-14 shrink-0 object-contain brightness-0 transition-all duration-300 sm:h-[72px] sm:w-[72px] dark:invert dark:drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
        />
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-normal text-[#111827] transition-colors duration-300 sm:text-4xl dark:text-white">
            Syntactic Analysis Tool
          </h1>
          <p className="mt-1 max-w-2xl text-base font-medium leading-7 text-[#6B7280] transition-colors duration-300 sm:text-lg dark:text-[#D1D5DB]">
            Advanced English Sentence Parser with Interactive Visualization
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-[#111827] transition-colors duration-300 dark:text-white">{user.name}</p>
          <p className="text-xs capitalize text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">{user.role}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border border-[#E5E7EB] bg-transparent px-3 py-2.5 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-[#111827] hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#263042] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB] dark:hover:bg-[#111827]"
        >
          Sign out
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all duration-300 hover:border-[#111827] hover:bg-[#F7F8FC] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FC] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:shadow-[0_18px_45px_rgba(0,0,0,0.28)] dark:hover:border-[#D1D5DB] dark:hover:bg-[#151B2D] dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#050816]"
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  )
}
