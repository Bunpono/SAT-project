import { useEffect, useState } from "react"

const THEME_STORAGE_KEY = "sat-theme"

function getInitialTheme() {
  if (typeof window === "undefined") return "light"

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme
    }
  } catch (error) {
    console.error("Unable to read the saved theme:", error)
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const isDark = theme === "dark"

    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.style.colorScheme = theme

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.error("Unable to save the selected theme:", error)
    }
  }, [theme])

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark"))
  }
}
