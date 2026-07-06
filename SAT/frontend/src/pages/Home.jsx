import { useState } from "react"
import Header from "../components/Header"
import InputPanel from "../components/InputPanel"
import ResultTabs from "../components/ResultTabs"
import TreePanel from "../components/TreePanel"
import HowToUse from "../components/HowToUse"
import AnalysisHistory from "../components/AnalysisHistory"
import {
  addAnalysisHistory,
  clearAnalysisHistory,
  deleteAnalysisHistory,
  getAnalysisHistory
} from "../utils/analysisHistory"
import { useTheme } from "../hooks/useTheme"

export default function Home() {
  const [analysis, setAnalysis] = useState(null)
  const [activeView, setActiveView] = useState("analysis")
  const [history, setHistory] = useState(() => getAnalysisHistory())
  const { theme, toggleTheme } = useTheme()

  const handleAnalysisComplete = (result) => {
    setAnalysis(result)

    if (result) {
      setHistory(addAnalysisHistory(result))
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

  const handleDeleteHistory = (id) => {
    setHistory(deleteAnalysisHistory(id))
  }

  const handleClearHistory = () => {
    setHistory(clearAnalysisHistory())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-6 text-slate-900 transition-colors duration-200 sm:px-6 lg:px-10 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto w-full max-w-7xl">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <nav
          aria-label="Main navigation"
          className="mt-8 inline-flex rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900"
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
        </nav>

        {activeView === "analysis" && (
          <>
            <div className="mt-6">
              <InputPanel onAnalyzeComplete={handleAnalysisComplete} />
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
      </div>
    </div>
  )
}
