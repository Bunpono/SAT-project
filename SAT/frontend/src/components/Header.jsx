import { useState } from "react"

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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h12m0 0-3-3m3 3-3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 5h7v6H4V5Zm9 0h7v4h-7V5ZM4 13h7v6H4v-6Zm9-2h7v8h-7v-8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default function Header({
  theme,
  onToggleTheme,
  user,
  onSignIn,
  onLogout,
  onOpenAdmin
}) {
  const isDark = theme === "dark"
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  return (
    <header className="flex min-w-0 flex-col gap-5 transition-colors duration-300 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <img
          src="/sat-logo.png"
          alt="Syntactic Analysis Tool logo"
          className="h-11 w-16 shrink-0 object-contain brightness-0 drop-shadow-[0_10px_16px_rgba(17,24,39,0.18)] transition-all duration-300 sm:h-14 sm:w-20 lg:h-[72px] lg:w-28 dark:invert dark:drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
        />
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold leading-tight tracking-normal text-[#111827] transition-colors duration-300 sm:text-3xl lg:text-4xl dark:text-white">
            Syntactic Analysis Tool
          </h1>
          <p className="mt-1 max-w-2xl text-base font-medium leading-6 text-[#6B7280] transition-colors duration-300 lg:text-lg dark:text-[#D1D5DB]">
            Advanced English Sentence Parser with Interactive Visualization
          </p>
        </div>
      </div>

      <div className="relative flex w-full shrink-0 items-center justify-end gap-3 lg:w-auto lg:self-start">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all duration-300 hover:border-[#111827] hover:bg-[#F7F8FC] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FC] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:shadow-[0_18px_45px_rgba(0,0,0,0.28)] dark:hover:border-[#D1D5DB] dark:hover:bg-[#151B2D] dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#050816]"
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </button>
        {user ? (
          <button
            type="button"
            onClick={() => setIsAccountOpen((value) => !value)}
            aria-expanded={isAccountOpen}
            className="flex h-12 min-w-0 max-w-[calc(100vw-6rem)] items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-base font-bold text-[#111827] shadow-sm transition-all duration-300 hover:bg-[#F7F8FC] active:scale-[0.98] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#151B2D]"
          >
            <UserIcon />
            <span className="truncate">{user.name}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="flex h-12 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-base font-bold text-[#111827] shadow-sm transition-all duration-300 hover:bg-[#F7F8FC] active:scale-[0.98] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#151B2D]"
          >
            <UserIcon />
            Sign in
          </button>
        )}

        {user && isAccountOpen && (
          <div className="absolute right-0 top-14 z-30 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_16px_40px_rgba(17,24,39,0.16)] transition-all duration-300 dark:border-[#263042] dark:bg-[#111827]">
            <div className="border-b border-[#E5E7EB] px-4 py-4 text-base font-bold text-[#111827] dark:border-[#263042] dark:text-white">
              My Account
            </div>
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-4 text-base text-[#6B7280] dark:border-[#263042] dark:text-[#9CA3AF]">
              <UserIcon />
              <span className="truncate">{user.email || user.role}</span>
            </div>
            {user.role === "admin" && (
              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false)
                  onOpenAdmin?.()
                }}
                className="flex w-full items-center gap-3 border-b border-[#E5E7EB] px-4 py-4 text-left text-base font-medium text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] dark:border-[#263042] dark:text-white dark:hover:bg-[#151B2D]"
              >
                <DashboardIcon />
                Admin Dashboard
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-4 text-left text-base font-medium text-red-600 transition-all duration-300 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
