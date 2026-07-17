import { useMemo, useState } from "react"
import { analyzeTree } from "../utils/treeAnalysis"

const tabs = [
  {
    id: "pos",
    title: "POS Analysis",
    description: "Part of Speech Tags",
    dotClass: "bg-blue-500",
    activeClass:
      "border-[#050816] bg-[#050816] text-white shadow-[0_18px_36px_rgba(5,8,22,0.22)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
    panelClass:
      "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/25",
    badgeClass: "bg-blue-600 text-white dark:bg-blue-500"
  },
  {
    id: "phrase",
    title: "Phrase Analysis",
    description: "Noun / Verb Phrases",
    dotClass: "bg-emerald-500",
    activeClass:
      "border-[#050816] bg-[#050816] text-white shadow-[0_18px_36px_rgba(5,8,22,0.22)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
    panelClass:
      "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/25",
    badgeClass: "bg-emerald-600 text-white dark:bg-emerald-500"
  },
  {
    id: "clause",
    title: "Clause Analysis",
    description: "Main & Sub Clauses",
    dotClass: "bg-purple-500",
    activeClass:
      "border-[#050816] bg-[#050816] text-white shadow-[0_18px_36px_rgba(5,8,22,0.22)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
    panelClass:
      "border-purple-200 bg-purple-50/70 dark:border-purple-900 dark:bg-purple-950/25",
    badgeClass: "bg-purple-600 text-white dark:bg-purple-500"
  },
  {
    id: "sentence",
    title: "Sentence Type",
    description: "Simple / Compound / Complex",
    dotClass: "bg-orange-500",
    activeClass:
      "border-[#050816] bg-[#050816] text-white shadow-[0_18px_36px_rgba(5,8,22,0.22)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
    panelClass:
      "border-orange-200 bg-orange-50/70 dark:border-orange-900 dark:bg-orange-950/25",
    badgeClass: "bg-orange-600 text-white dark:bg-orange-500"
  }
]

const idleCardClass =
  "border-[#E5E7EB] bg-white text-[#374151] shadow-sm hover:border-[#111827]/25 hover:bg-[#F7F8FC] hover:text-[#111827] dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB]/50 dark:hover:bg-[#111827] dark:hover:text-white"

export default function ResultTabs({ analysis }) {
  const [activeTab, setActiveTab] = useState("pos")
  const [isModelOutputOpen, setIsModelOutputOpen] = useState(false)
  const treeAnalysis = useMemo(() => analyzeTree(analysis?.tree), [analysis?.tree])
  const wordCount = useMemo(
    () => String(analysis?.sentence || "").trim().split(/\s+/).filter(Boolean).length,
    [analysis?.sentence]
  )
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0]

  const renderActiveResult = () => {
    if (activeTab === "pos") {
      return treeAnalysis.posTags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {treeAnalysis.posTags.map(({ word, tag, verbDetails }, index) => (
            <span
              key={`${word}-${tag}-${index}`}
              className="inline-flex min-w-24 flex-col items-center rounded-xl border border-blue-200 bg-white/90 px-3 py-3 text-center text-[#374151] shadow-sm transition-all duration-300 dark:border-blue-900 dark:bg-[#151B2D]/80 dark:text-[#D1D5DB]"
            >
              <span className="font-semibold text-[#111827] dark:text-white">{word}</span>
              <span className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-300">{tag}</span>
              {verbDetails && (
                <span className="mt-2 w-full border-t border-blue-100 pt-2 text-left text-xs leading-5 text-[#4B5563] dark:border-blue-900/70 dark:text-[#9CA3AF]">
                  <span className="block"><strong className="font-semibold text-[#374151] dark:text-[#D1D5DB]">Verb type:</strong> {verbDetails.type}</span>
                  <span className="block"><strong className="font-semibold text-[#374151] dark:text-[#D1D5DB]">Verb tense:</strong> {verbDetails.tense}</span>
                </span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          No POS tags were found in this tree.
        </p>
      )
    }

    if (activeTab === "phrase") {
      return treeAnalysis.phrases.length > 0 ? (
        <ul className="space-y-2">
          {treeAnalysis.phrases.map(({ type, text }, index) => (
            <li
              key={`${type}-${text}-${index}`}
              className="rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-base text-[#374151] shadow-sm transition-all duration-300 dark:border-emerald-900 dark:bg-[#151B2D]/80 dark:text-[#D1D5DB]"
            >
              <span className="mr-3 inline-block rounded-md bg-emerald-600 px-2 py-1 font-semibold text-white dark:bg-emerald-500">
                {type}
              </span>
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          No phrase nodes were found in this tree.
        </p>
      )
    }

    if (activeTab === "clause") {
      return treeAnalysis.clauses.length > 0 ? (
        <ul className="space-y-2">
          {treeAnalysis.clauses.map(({ type, text }, index) => (
            <li
              key={`${type}-${text}-${index}`}
              className="rounded-xl border border-purple-200 bg-white/90 px-4 py-3 text-base text-[#374151] shadow-sm transition-all duration-300 dark:border-purple-900 dark:bg-[#151B2D]/80 dark:text-[#D1D5DB]"
            >
              <span className="font-semibold text-purple-800 dark:text-purple-300">{type}:</span>{" "}
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          No S clause nodes were found in this tree.
        </p>
      )
    }

    return (
      <div className="rounded-xl border border-orange-200 bg-white/90 px-4 py-3 shadow-sm transition-all duration-300 dark:border-orange-900 dark:bg-[#151B2D]/80">
        <p className="font-semibold text-orange-900 dark:text-orange-200">
          {treeAnalysis.sentenceType}
        </p>
        <p className="mt-1 text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          {treeAnalysis.sentenceTypeReason}
        </p>
      </div>
    )
  }

  return (
    <section className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.07)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-7 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">
            Analysis Results
          </h2>
          <p className="mt-1 text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
            Select a category to inspect the result extracted from the syntax tree.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800 transition-colors duration-300 dark:bg-orange-950/30 dark:text-orange-200">
            Sentence type: <span className="font-bold">{treeAnalysis.sentenceType}</span>
          </p>
          <p className="rounded-lg bg-[#F7F8FC] px-3 py-1.5 text-sm font-medium text-[#6B7280] transition-colors duration-300 dark:bg-[#151B2D] dark:text-[#9CA3AF]">
            Word count: <span className="font-bold text-[#111827] dark:text-white">{wordCount}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={isActive}
              className={`relative min-w-0 rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#111827]/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/15 dark:focus-visible:ring-offset-[#111827] ${
                isActive ? tab.activeClass : idleCardClass
              }`}
            >
              <span className={`mb-3 block h-2.5 w-2.5 rounded-full ${tab.dotClass}`} />
              <span className="block break-words font-medium">{tab.title}</span>
              <span className="mt-1 block break-words text-base opacity-75">
                {tab.id === "sentence" ? treeAnalysis.sentenceType : tab.description}
              </span>
            </button>
          )
        })}
      </div>

      <div
        className={`mt-4 min-w-0 rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${activeTabConfig.panelClass}`}
        aria-live="polite"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-md px-3 py-1 text-base font-semibold ${activeTabConfig.badgeClass}`}>
            {activeTabConfig.title}
          </span>
          <span className="text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
            {activeTab === "sentence" ? treeAnalysis.sentenceType : activeTabConfig.description}
          </span>
        </div>
        {renderActiveResult()}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsModelOutputOpen((value) => !value)}
          aria-expanded={isModelOutputOpen}
          aria-controls="model-output"
          className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-base font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB] dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
        >
          {isModelOutputOpen ? "Hide model output" : "Show model output"}
        </button>
      </div>

      {isModelOutputOpen && (
        <div id="model-output" className="mt-3 min-w-0 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 transition-all duration-300 dark:border-[#263042] dark:bg-[#0B1120]">
          <p className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            Model output (S-expression)
          </p>
          <pre className="mt-3 max-w-full overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white p-4 text-base text-[#374151] transition-colors duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
            {analysis?.s_expression || "No analysis yet."}
          </pre>
        </div>
      )}
    </section>
  )
}
