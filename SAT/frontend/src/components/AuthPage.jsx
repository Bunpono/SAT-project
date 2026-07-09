import { useState } from "react"
import { loginAccount, registerAccount } from "../services/api"

export default function AuthPage({ onAuthenticated, theme, onToggleTheme }) {
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F7FC] to-[#EEF3FF] px-4 py-8 text-[#111827] transition-colors duration-300 dark:from-[#050816] dark:to-[#0B1120] dark:text-white">
      <button
        type="button"
        onClick={onToggleTheme}
        className="absolute right-6 top-6 rounded-xl border border-[#E5E7EB] bg-transparent px-4 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-[#111827] hover:bg-white active:scale-[0.98] dark:border-[#263042] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB] dark:hover:bg-[#111827]"
      >
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <section className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-[0_24px_70px_rgba(17,24,39,0.1)] transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-center gap-4">
          <img
            src="/sat-logo.png"
            alt="Syntactic Analysis Tool logo"
            className="h-16 w-16 shrink-0 object-contain brightness-0 transition-all duration-300 sm:h-[72px] sm:w-[72px] dark:invert dark:drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
          />
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#111827] transition-colors duration-300 dark:text-white">
              Syntactic Analysis Tool
            </h1>
            <p className="text-sm font-medium text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
              {isRegister ? "Create your account" : "Sign in to continue"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-1.5 transition-all duration-300 dark:border-[#263042] dark:bg-[#0B1120]">
          {["login", "register"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setMode(item); setError("") }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all duration-300 ${
                mode === item
                  ? "bg-white text-[#111827] shadow-sm dark:bg-[#151B2D] dark:text-white"
                  : "text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <label className="block text-sm font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
              Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
                maxLength={120}
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
              />
            </label>
          )}
          <label className="block text-sm font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
            />
          </label>
          <label className="block text-sm font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
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
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
            />
          </label>

          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(17,24,39,0.18)] transition-all duration-300 hover:bg-[#374151] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:opacity-50 dark:bg-white dark:text-[#111827] dark:shadow-[0_14px_30px_rgba(255,255,255,0.12)] dark:hover:bg-[#D1D5DB]"
          >
            {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  )
}
