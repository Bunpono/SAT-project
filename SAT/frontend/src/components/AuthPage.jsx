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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-8 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <button
        type="button"
        onClick={onToggleTheme}
        className="absolute right-6 top-6 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <img src="/sat-logo.png" alt="Syntactic Analysis Tool logo" className="h-14 w-auto" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-950 dark:text-white">
              Syntactic Analysis Tool
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {isRegister ? "Create your account" : "Sign in to continue"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
          {["login", "register"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setMode(item); setError("") }}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                mode === item
                  ? "bg-white text-slate-950 shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-gray-500 dark:text-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
                maxLength={120}
                className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 dark:bg-slate-800 dark:focus:ring-blue-500"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 dark:bg-slate-800 dark:focus:ring-blue-500"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
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
              className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 dark:bg-slate-800 dark:focus:ring-blue-500"
            />
          </label>

          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  )
}
