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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FC] to-[#EEF3FF] px-4 py-7 text-[#111827] transition-colors duration-300 sm:px-6 lg:px-10 dark:from-[#050816] dark:to-[#0B1120] dark:text-white">
      <div className="mx-auto w-full max-w-7xl">
        <Header
          theme={theme}
          onToggleTheme={onToggleTheme}
          user={user}
          onLogout={onLogout}
        />

        <nav
          aria-label="Main navigation"
          className="mt-8 inline-flex flex-wrap rounded-2xl border border-[#E5E7EB] bg-white/80 p-1.5 shadow-[0_16px_40px_rgba(17,24,39,0.08)] backdrop-blur transition-all duration-300 dark:border-[#263042] dark:bg-[#0B1120]/85 dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
        >
          <button
            type="button"
            onClick={() => setActiveView("analysis")}
            aria-pressed={activeView === "analysis"}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              activeView === "analysis"
                ? "bg-[#111827] text-white shadow-sm dark:bg-white dark:text-[#111827]"
                : "text-[#6B7280] hover:bg-[#F7F8FC] hover:text-[#111827] dark:text-[#D1D5DB] dark:hover:bg-[#151B2D] dark:hover:text-white"
            }`}
          >
            Syntax Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveView("history")}
            aria-pressed={activeView === "history"}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              activeView === "history"
                ? "bg-[#111827] text-white shadow-sm dark:bg-white dark:text-[#111827]"
                : "text-[#6B7280] hover:bg-[#F7F8FC] hover:text-[#111827] dark:text-[#D1D5DB] dark:hover:bg-[#151B2D] dark:hover:text-white"
            }`}
          >
            Analysis History
          </button>
          <button
            type="button"
            onClick={() => setActiveView("guide")}
            aria-pressed={activeView === "guide"}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              activeView === "guide"
                ? "bg-[#111827] text-white shadow-sm dark:bg-white dark:text-[#111827]"
                : "text-[#6B7280] hover:bg-[#F7F8FC] hover:text-[#111827] dark:text-[#D1D5DB] dark:hover:bg-[#151B2D] dark:hover:text-white"
            }`}
          >
            How to Use
          </button>
          {user.role === "admin" && (
            <button
              type="button"
              onClick={() => setActiveView("admin")}
              aria-pressed={activeView === "admin"}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeView === "admin"
                  ? "bg-[#111827] text-white shadow-sm dark:bg-white dark:text-[#111827]"
                  : "text-[#6B7280] hover:bg-[#F7F8FC] hover:text-[#111827] dark:text-[#D1D5DB] dark:hover:bg-[#151B2D] dark:hover:text-white"
              }`}
            >
              Admin Dashboard
            </button>
          )}
        </nav>

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
          <div className="mt-6">
            <AnalysisHistory
              history={history}
              onView={handleViewHistory}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearHistory}
            />
          </div>
        )}

        {activeView === "guide" && (
          <div className="mt-6">
            <HowToUse />
          </div>
        )}

        {activeView === "admin" && user.role === "admin" && (
          <div className="mt-6">
            <AdminDashboard />
          </div>
        )}
      </div>
    </div>
  )
}
