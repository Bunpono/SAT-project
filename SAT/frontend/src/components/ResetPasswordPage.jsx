import { useEffect, useState } from "react"
import { clearAuthToken } from "../utils/authStorage"
import { isSupabaseConfigured, supabase } from "../services/supabaseClient"

export default function ResetPasswordPage({ theme, onToggleTheme }) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setIsSessionReady(true)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || session) && active) {
        setIsSessionReady(true)
        setError("")
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!isSupabaseConfigured || !supabase) {
      setError("Password reset is not configured yet.")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.password
      })

      if (updateError) throw updateError

      clearAuthToken()
      await supabase.auth.signOut()
      setSuccess("Password updated successfully. Please login again.")
      setForm({ password: "", confirmPassword: "" })

      window.setTimeout(() => {
        window.location.assign("/")
      }, 1800)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-surface flex min-h-screen min-w-0 flex-col items-center justify-center overflow-x-hidden px-4 py-5 text-[#111827] transition-colors duration-300 sm:px-6 sm:py-8 dark:text-white">
      <button
        type="button"
        onClick={onToggleTheme}
        className="mb-6 self-end rounded-xl border border-[#E5E7EB] bg-transparent px-4 py-2 text-base font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-[#111827] hover:bg-white active:scale-[0.98] dark:border-[#263042] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB] dark:hover:bg-[#111827]"
      >
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <section className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_24px_70px_rgba(17,24,39,0.1)] transition-all duration-300 sm:p-7 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <div className="flex flex-col items-center text-center">
          <img
            src="/sat-logo.png"
            alt="Syntactic Analysis Tool logo"
            className="h-14 w-14 shrink-0 object-contain brightness-0 transition-all duration-300 sm:h-[72px] sm:w-[72px] dark:invert dark:drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
          />
          <h1 className="mt-4 break-words text-2xl font-bold leading-tight text-[#111827] transition-colors duration-300 dark:text-white">
            Syntactic Analysis Tool
          </h1>
          <p className="mt-1 text-base font-medium text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
            Create a new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-base font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
            New Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
            />
          </label>

          <label className="block text-base font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
            />
          </label>

          {!isSupabaseConfigured && (
            <p role="alert" className="text-base text-red-600 dark:text-red-300">
              Password reset is not configured yet.
            </p>
          )}
          {isSupabaseConfigured && !isSessionReady && !success && (
            <p className="text-base text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
              Open this page from the password reset link in your email.
            </p>
          )}
          {error && <p role="alert" className="text-base text-red-600 dark:text-red-300">{error}</p>}
          {success && <p role="status" className="text-base text-emerald-600 dark:text-emerald-300">{success}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !isSessionReady}
            className="w-full rounded-xl bg-[#111827] px-5 py-3 text-base font-semibold text-white shadow-[0_14px_30px_rgba(17,24,39,0.18)] transition-all duration-300 hover:bg-[#374151] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:opacity-50 dark:bg-white dark:text-[#111827] dark:shadow-[0_14px_30px_rgba(255,255,255,0.12)] dark:hover:bg-[#D1D5DB]"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </main>
  )
}
