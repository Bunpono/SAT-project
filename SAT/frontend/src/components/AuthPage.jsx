import { useState } from "react"
import { loginAccount, registerAccount } from "../services/api"
import { isSupabaseConfigured, supabase } from "../services/supabaseClient"

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function RegisterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M15 19a6 6 0 0 0-12 0M9 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10-8v6m3-3h-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

const authModes = [
  { id: "login", label: "Login", icon: LoginIcon },
  { id: "register", label: "Register", icon: RegisterIcon }
]

export default function AuthPage({ onAuthenticated, theme, onToggleTheme }) {
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetSuccess, setResetSuccess] = useState("")
  const [isResetSubmitting, setIsResetSubmitting] = useState(false)
  const isRegister = mode === "register"

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError("")

    try {
      const result = isRegister
        ? await registerAccount(form.name, form.email, form.password)
        : await loginAccount(form.email, form.password)
      onAuthenticated(result)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openResetDialog = () => {
    setResetEmail(form.email)
    setResetError("")
    setResetSuccess("")
    setIsResetOpen(true)
  }

  const closeResetDialog = () => {
    if (isResetSubmitting) return
    setIsResetOpen(false)
    setResetError("")
    setResetSuccess("")
  }

  const handlePasswordReset = async (event) => {
    event.preventDefault()
    if (isResetSubmitting) return

    if (!isSupabaseConfigured || !supabase) {
      setResetError("Password reset is not configured yet.")
      return
    }

    setIsResetSubmitting(true)
    setResetError("")
    setResetSuccess("")

    try {
      const { error: resetPasswordError } = await supabase.auth.resetPasswordForEmail(
        resetEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (resetPasswordError) throw resetPasswordError

      setResetSuccess("Password reset link has been sent to your email.")
    } catch (submitError) {
      setResetError(submitError.message)
    } finally {
      setIsResetSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen min-w-0 flex-col items-center overflow-x-hidden bg-gradient-to-br from-[#F5F7FC] via-[#F2F5FF] to-[#DBEAFE] px-4 py-5 text-[#111827] transition-colors duration-300 sm:px-6 sm:py-8 dark:from-[#050816] dark:via-[#0B1120] dark:to-[#111827] dark:text-white">
      <button
        type="button"
        onClick={onToggleTheme}
        className="self-end rounded-xl border border-[#E5E7EB] bg-transparent px-4 py-2 text-base font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-[#111827] hover:bg-white active:scale-[0.98] dark:border-[#263042] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB] dark:hover:bg-[#111827]"
      >
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <div className="flex w-full max-w-[560px] min-w-0 flex-1 flex-col items-center justify-center py-6">
        <div className="mb-7 flex min-w-0 flex-col items-center text-center sm:mb-9">
          <img
            src="/sat-logo.png"
            alt="Syntactic Analysis Tool logo"
            className="h-14 w-20 shrink-0 object-contain brightness-0 drop-shadow-[0_10px_16px_rgba(17,24,39,0.18)] transition-all duration-300 sm:h-[72px] sm:w-28 dark:invert dark:drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
          />
          <h1 className="mt-5 break-words text-2xl font-bold leading-tight text-[#111827] transition-colors duration-300 sm:mt-7 sm:text-4xl dark:text-white">
            Syntactic Analysis Tool
          </h1>
          <p className="mt-3 text-base font-medium text-[#6B7280] transition-colors duration-300 sm:text-lg dark:text-[#D1D5DB]">
            Advanced English Sentence Parser with Interactive Visualization
          </p>
        </div>

        <section className="w-full min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_24px_70px_rgba(17,24,39,0.08)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-7 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
          <div>
            <h2 className="text-xl font-bold text-[#111827] transition-colors duration-300 dark:text-white">
              Welcome
            </h2>
            <p className="mt-2 text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
              Login or create an account to start analyzing sentences
            </p>
          </div>

        <div className="mt-8 grid grid-cols-2 gap-1 rounded-2xl bg-[#E8E8ED] p-1.5 transition-all duration-300 dark:bg-[#151B2D]">
          {authModes.map((item) => {
            const Icon = item.icon
            return (
            <button
              key={item.id}
              type="button"
              onClick={() => { setMode(item.id); setError("") }}
              className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-[14px] px-3 py-2.5 text-base font-bold capitalize transition-all duration-300 sm:px-4 ${
                mode === item.id
                  ? "bg-white text-[#111827] shadow-sm dark:bg-white dark:text-[#111827]"
                  : "text-[#111827] hover:bg-white/45 dark:text-[#D1D5DB] dark:hover:bg-white/10"
              }`}
            >
              <Icon />
              {item.label}
            </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <label className="block text-base font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
              Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
                maxLength={120}
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
              />
            </label>
          )}
          <label className="block text-base font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
              autoComplete="email"
              placeholder="your@email.com"
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
            />
          </label>
          <label className="block text-base font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={isRegister ? 8 : 1}
              maxLength={72}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="Password"
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
            />
          </label>

          {!isRegister && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openResetDialog}
                className="text-base font-semibold text-[#374151] transition-colors duration-300 hover:text-[#111827] dark:text-[#D1D5DB] dark:hover:text-white"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && <p role="alert" className="text-base text-red-600 dark:text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#050816] px-5 py-3.5 text-base font-bold text-white shadow-[0_14px_30px_rgba(17,24,39,0.18)] transition-all duration-300 hover:bg-[#111827] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:opacity-50 dark:bg-white dark:text-[#111827] dark:shadow-[0_14px_30px_rgba(255,255,255,0.12)] dark:hover:bg-[#D1D5DB]"
          >
            {isRegister ? <RegisterIcon /> : <LoginIcon />}
            {isSubmitting
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
      </section>
      </div>

      <footer className="pt-8 text-center text-base font-medium text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
        Powered by WJ & AJ Syntactic Algorithm
      </footer>

      {isResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/60 px-4 backdrop-blur-sm transition-all duration-300"
          role="presentation"
        >
          <section
            aria-labelledby="reset-password-title"
            className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_70px_rgba(17,24,39,0.18)] transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_24px_70px_rgba(0,0,0,0.42)]"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="reset-password-title" className="text-xl font-bold text-[#111827] transition-colors duration-300 dark:text-white">
                  Reset Password
                </h2>
                <p className="mt-1 text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
                  Enter your email address and we will send you a password reset link.
                </p>
              </div>
              <button
                type="button"
                onClick={closeResetDialog}
                className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-base font-semibold text-[#374151] transition-all duration-300 hover:border-[#111827] hover:bg-[#F7F8FC] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#263042] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB] dark:hover:bg-[#151B2D]"
                disabled={isResetSubmitting}
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="mt-5 space-y-4">
              <label className="block text-base font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
                Email
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => {
                    setResetEmail(event.target.value)
                    setResetError("")
                    setResetSuccess("")
                  }}
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
                />
              </label>

              {resetError && <p role="alert" className="text-base text-red-600 dark:text-red-300">{resetError}</p>}
              {resetSuccess && <p role="status" className="text-base text-emerald-600 dark:text-emerald-300">{resetSuccess}</p>}

              <button
                type="submit"
                disabled={isResetSubmitting}
                className="w-full rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white shadow-[0_14px_30px_rgba(17,24,39,0.18)] transition-all duration-300 hover:bg-[#374151] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:opacity-50 dark:bg-white dark:text-[#111827] dark:shadow-[0_14px_30px_rgba(255,255,255,0.12)] dark:hover:bg-[#D1D5DB]"
              >
                {isResetSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
