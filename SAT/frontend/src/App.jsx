import { useEffect, useState } from "react"
import AuthPage from "./components/AuthPage"
import ResetPasswordPage from "./components/ResetPasswordPage"
import Home from "./pages/Home"
import { getCurrentUser } from "./services/api"
import { clearAuthToken, getAuthToken, setAuthToken } from "./utils/authStorage"
import { useTheme } from "./hooks/useTheme"

export default function App() {
  const isResetPasswordRoute =
    typeof window !== "undefined" && window.location.pathname === "/reset-password"
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(
    !isResetPasswordRoute && Boolean(getAuthToken())
  )
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (isResetPasswordRoute) return

    const token = getAuthToken()
    if (!token) return

    getCurrentUser()
      .then(setUser)
      .catch(() => clearAuthToken())
      .finally(() => setIsLoading(false))
  }, [isResetPasswordRoute])

  useEffect(() => {
    const handleExpired = () => { setUser(null); setIsLoading(false) }
    window.addEventListener("sat-auth-expired", handleExpired)
    return () => window.removeEventListener("sat-auth-expired", handleExpired)
  }, [])

  const handleAuthenticated = ({ access_token, user: authenticatedUser }) => {
    setAuthToken(access_token)
    setUser(authenticatedUser)
  }

  const handleLogout = () => {
    clearAuthToken()
    setUser(null)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FC] text-[#111827] transition-colors duration-300 dark:bg-[#050816] dark:text-white">
        Loading...
      </div>
    )
  }

  if (isResetPasswordRoute) {
    return <ResetPasswordPage theme={theme} onToggleTheme={toggleTheme} />
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} theme={theme} onToggleTheme={toggleTheme} />
  }

  return <Home user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
}
