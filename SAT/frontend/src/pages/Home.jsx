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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-6 text-slate-900 transition-colors duration-200 sm:px-6 lg:px-10 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto w-full max-w-7xl">
        <Header
          theme={theme}
          onToggleTheme={onToggleTheme}
          user={user}
          onLogout={onLogout}
        />

        <nav
          aria-label="Main navigation"
          className="mt-8 inline-flex flex-wrap rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={() => setActiveView("analysis")}
            aria-pressed={activeView === "analysis"}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeView === "analysis"
                ? "bg-slate-950 text-white dark:bg-blue-600"
                : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Syntax Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveView("history")}
            aria-pressed={activeView === "history"}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeView === "history"
                ? "bg-slate-950 text-white dark:bg-blue-600"
                : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Analysis History
          </button>
          <button
            type="button"
            onClick={() => setActiveView("guide")}
            aria-pressed={activeView === "guide"}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeView === "guide"
                ? "bg-slate-950 text-white dark:bg-blue-600"
                : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            How to Use
          </button>
          {user.role === "admin" && (
            <button
              type="button"
              onClick={() => setActiveView("admin")}
              aria-pressed={activeView === "admin"}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeView === "admin"
                  ? "bg-slate-950 text-white dark:bg-blue-600"
                  : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
