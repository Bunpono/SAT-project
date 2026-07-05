import { useState } from "react"
import Header from "../components/Header"
import InputPanel from "../components/InputPanel"
import ResultTabs from "../components/ResultTabs"
import TreePanel from "../components/TreePanel"
import HowToUse from "../components/HowToUse"

export default function Home() {
  const [analysis, setAnalysis] = useState(null)
  const [activeView, setActiveView] = useState("analysis")

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Header />

        <nav
          aria-label="Main navigation"
          className="mt-8 inline-flex rounded-xl bg-white p-1 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setActiveView("analysis")}
            aria-pressed={activeView === "analysis"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeView === "analysis"
                ? "bg-slate-950 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Syntax Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveView("guide")}
            aria-pressed={activeView === "guide"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeView === "guide"
                ? "bg-slate-950 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            How to Use
          </button>
        </nav>

        {activeView === "analysis" ? (
          <>
            <div className="mt-6">
              <InputPanel onAnalyzeComplete={setAnalysis} />
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
        ) : (
          <div className="mt-6">
            <HowToUse />
          </div>
        )}
      </div>
    </div>
  )
}
