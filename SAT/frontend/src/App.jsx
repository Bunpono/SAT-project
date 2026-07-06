import { useEffect, useState } from "react"
import AuthPage from "./components/AuthPage"
import Home from "./pages/Home"
import { getCurrentUser } from "./services/api"
import { clearAuthToken, getAuthToken, setAuthToken } from "./utils/authStorage"
import { useTheme } from "./hooks/useTheme"

export default function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(getAuthToken()))
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return

    getCurrentUser()
      .then(setUser)
      .catch(() => clearAuthToken())
      .finally(() => setIsLoading(false))
  }, [])

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
    return <div className="flex min-h-screen items-center justify-center bg-indigo-50 dark:bg-slate-950 dark:text-white">Loading...</div>
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} theme={theme} onToggleTheme={toggleTheme} />
  }

  return <Home user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
}
