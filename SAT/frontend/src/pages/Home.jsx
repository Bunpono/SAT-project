import { useEffect, useState } from "react"
import Header from "../components/Header"
import InputPanel from "../components/InputPanel"
import ResultTabs from "../components/ResultTabs"
import TreePanel from "../components/TreePanel"
import HowToUse from "../components/HowToUse"
import AnalysisHistory from "../components/AnalysisHistory"
import AdminDashboard from "../components/AdminDashboard"
import {
  addAnalysisHistory,
  clearAnalysisHistory,
  getAnalysisHistory
} from "../utils/analysisHistory"
import { clearMyHistory, deleteMyHistory, getMyHistory } from "../services/api"

function SyntaxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 4v5m0 0-5 4m5-4 5 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.5 4h5M5.5 13h3M15.5 13h3M4.5 17.5h5M14.5 17.5h5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12H7.5A2.5 2.5 0 0 1 5 16.5v-12Zm0 12A2.5 2.5 0 0 1 7.5 14H18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3 5 6v5c0 4.4 2.8 8.3 7 9.7 4.2-1.4 7-5.3 7-9.7V6l-7-3Zm0 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-3.5 4a3.8 3.8 0 0 1 7 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="py-10 text-center text-sm font-medium text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
      Powered by WJ & AJ Syntactic Algorithm
    </footer>
  )
}

export default function Home({ user, onLogout, theme, onToggleTheme }) {
  const [analysis, setAnalysis] = useState(null)
  const [activeView, setActiveView] = useState("analysis")
  const [history, setHistory] = useState(() => getAnalysisHistory())

  const loadAccountHistory = async () => {
    try {
      setHistory(await getMyHistory())
    } catch (error) {
      console.error("Unable to load account history; keeping local history:", error)
    }
  }

  useEffect(() => {
    let active = true
    getMyHistory()
      .then((items) => {
        if (active) setHistory(items)
      })
      .catch((error) => {
        console.error("Unable to load account history; keeping local history:", error)
      })
    return () => { active = false }
  }, [])

  const handleAnalysisComplete = (result) => {
    setAnalysis(result)

    if (result) {
      setHistory(addAnalysisHistory(result))
      loadAccountHistory()
    }
  }

  const handleViewHistory = (entry) => {
    setAnalysis({
      sentence: entry.sentence,
      s_expression: entry.s_expression,
      tree: entry.tree
    })
    setActiveView("analysis")
  }

  const handleDeleteHistory = async (id) => {
    try {
      await deleteMyHistory(id)
      setHistory((current) => current.filter((entry) => entry.id !== id))
    } catch (error) {
      console.error("Unable to delete account history:", error)
    }
  }

  const handleClearHistory = async () => {
    try {
      await clearMyHistory()
      setHistory(clearAnalysisHistory())
    } catch (error) {
      console.error("Unable to clear account history:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FC] via-[#F2F5FF] to-[#DBEAFE] px-4 py-10 text-[#111827] transition-colors duration-300 sm:px-8 lg:px-16 dark:from-[#050816] dark:via-[#0B1120] dark:to-[#111827] dark:text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1680px] flex-col">
        <Header
          theme={theme}
          onToggleTheme={onToggleTheme}
          user={user}
          onLogout={onLogout}
        />

        <nav
          aria-label="Main navigation"
          className="mt-10 inline-grid w-full max-w-[840px] grid-cols-3 gap-x-2 rounded-2xl bg-[#E8E8ED] p-2 transition-all duration-300 dark:bg-[#151B2D]"
        >
          <button
            type="button"
            onClick={() => setActiveView("analysis")}
            aria-pressed={activeView === "analysis"}
            className={`flex min-h-12 items-center justify-center gap-2.5 rounded-[15px] px-7 py-3 text-base font-bold transition-all duration-300 ${
              activeView === "analysis"
                ? "bg-white text-[#111827] shadow-sm dark:bg-white dark:text-[#111827]"
                : "text-[#111827] hover:bg-white/45 dark:text-[#D1D5DB] dark:hover:bg-white/10"
            }`}
          >
            <SyntaxIcon />
            Syntax Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveView("history")}
            aria-pressed={activeView === "history"}
            className={`flex min-h-12 items-center justify-center gap-2.5 rounded-[15px] px-7 py-3 text-base font-bold transition-all duration-300 ${
              activeView === "history"
                ? "bg-white text-[#111827] shadow-sm dark:bg-white dark:text-[#111827]"
                : "text-[#111827] hover:bg-white/45 dark:text-[#D1D5DB] dark:hover:bg-white/10"
            }`}
          >
            <HistoryIcon />
            Analysis History
          </button>
          <button
            type="button"
            onClick={() => setActiveView("guide")}
            aria-pressed={activeView === "guide"}
            className={`flex min-h-12 items-center justify-center gap-2.5 rounded-[15px] px-7 py-3 text-base font-bold transition-all duration-300 ${
              activeView === "guide"
                ? "bg-white text-[#111827] shadow-sm dark:bg-white dark:text-[#111827]"
                : "text-[#111827] hover:bg-white/45 dark:text-[#D1D5DB] dark:hover:bg-white/10"
            }`}
          >
            <BookIcon />
            How to Use
          </button>
          {user.role === "admin" && (
            <button
              type="button"
              onClick={() => setActiveView("admin")}
              aria-pressed={activeView === "admin"}
              className={`flex min-h-12 items-center justify-center gap-2.5 rounded-[15px] px-7 py-3 text-base font-bold transition-all duration-300 ${
                activeView === "admin"
                  ? "bg-white text-[#111827] shadow-sm dark:bg-white dark:text-[#111827]"
                  : "text-[#111827] hover:bg-white/45 dark:text-[#D1D5DB] dark:hover:bg-white/10"
              }`}
            >
              <AdminIcon />
              Admin Dashboard
            </button>
          )}
        </nav>

        <main className="flex-1">
          {activeView === "analysis" && (
            <>
            <div className="mt-6">
              <InputPanel
                analysis={analysis}
                onAnalyzeComplete={handleAnalysisComplete}
              />
            </div>

            {analysis && (
              <>
                <div className="mt-6">
                  <ResultTabs analysis={analysis} />
                </div>

                <div className="mt-6">
                  <TreePanel analysis={analysis} />
                </div>
              </>
            )}
            </>
          )}

          {activeView === "history" && (
            <div className="mt-10">
              <AnalysisHistory
                history={history}
                onView={handleViewHistory}
                onDelete={handleDeleteHistory}
                onClearAll={handleClearHistory}
              />
            </div>
          )}

          {activeView === "guide" && (
            <div className="mt-10">
              <HowToUse />
            </div>
          )}

          {activeView === "admin" && user.role === "admin" && (
            <div className="mt-10">
              <AdminDashboard />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
