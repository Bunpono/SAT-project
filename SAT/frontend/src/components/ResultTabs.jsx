import { useMemo, useState } from "react"
import { analyzeTree } from "../utils/treeAnalysis"

const tabs = [
  {
    id: "pos",
    title: "POS Analysis",
    description: "Part of Speech Tags",
    dotClass: "bg-blue-500",
    activeClass:
      "border-[#111827] bg-[#111827] text-white shadow-[0_16px_34px_rgba(17,24,39,0.18)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
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
      "border-[#111827] bg-[#111827] text-white shadow-[0_16px_34px_rgba(17,24,39,0.18)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
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
      "border-[#111827] bg-[#111827] text-white shadow-[0_16px_34px_rgba(17,24,39,0.18)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
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
      "border-[#111827] bg-[#111827] text-white shadow-[0_16px_34px_rgba(17,24,39,0.18)] dark:border-white dark:bg-white dark:text-[#111827] dark:shadow-[0_16px_34px_rgba(255,255,255,0.12)]",
    panelClass:
      "border-orange-200 bg-orange-50/70 dark:border-orange-900 dark:bg-orange-950/25",
    badgeClass: "bg-orange-600 text-white dark:bg-orange-500"
  }
]

const idleCardClass =
  "border-[#E5E7EB] bg-[#F7F8FC] text-[#374151] hover:border-[#111827]/30 hover:bg-white hover:text-[#111827] dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB]/50 dark:hover:bg-[#111827] dark:hover:text-white"

export default function ResultTabs({ analysis }) {
  const [activeTab, setActiveTab] = useState("pos")
  const treeAnalysis = useMemo(() => analyzeTree(analysis?.tree), [analysis?.tree])
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0]

  const renderActiveResult = () => {
    if (activeTab === "pos") {
      return treeAnalysis.posTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {treeAnalysis.posTags.map(({ word, tag }, index) => (
            <span
              key={`${word}-${tag}-${index}`}
              className="rounded-xl border border-blue-200 bg-white/90 px-3 py-2 text-sm text-[#374151] shadow-sm transition-all duration-300 dark:border-blue-900 dark:bg-[#151B2D]/80 dark:text-[#D1D5DB]"
            >
              <span className="font-semibold text-[#111827] dark:text-white">{word}</span>
              <span className="ml-2 font-medium text-blue-600 dark:text-blue-300">{tag}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
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
              className="rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-[#374151] shadow-sm transition-all duration-300 dark:border-emerald-900 dark:bg-[#151B2D]/80 dark:text-[#D1D5DB]"
            >
              <span className="mr-3 inline-block rounded-md bg-emerald-600 px-2 py-1 font-semibold text-white dark:bg-emerald-500">
                {type}
              </span>
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
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
              className="rounded-xl border border-purple-200 bg-white/90 px-4 py-3 text-sm text-[#374151] shadow-sm transition-all duration-300 dark:border-purple-900 dark:bg-[#151B2D]/80 dark:text-[#D1D5DB]"
            >
              <span className="font-semibold text-purple-800 dark:text-purple-300">{type}:</span>{" "}
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          No S clause nodes were found in this tree.
        </p>
      )
    }

    return (
      <div className="rounded-xl border border-orange-200 bg-white/90 px-4 py-3 shadow-sm transition-all duration-300 dark:border-orange-900 dark:bg-[#151B2D]/80">
        <p className="font-semibold text-orange-900 dark:text-orange-200">
          {treeAnalysis.sentenceType}
        </p>
        <p className="mt-1 text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          {treeAnalysis.sentenceTypeReason}
        </p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div>
        <h2 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">
          Analysis Results
        </h2>
        <p className="mt-1 text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          Select a category to inspect the result extracted from the syntax tree.
        </p>
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
              className={`relative rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#111827]/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/15 dark:focus-visible:ring-offset-[#111827] ${
                isActive ? tab.activeClass : idleCardClass
              }`}
            >
              <span className={`mb-3 block h-2.5 w-2.5 rounded-full ${tab.dotClass}`} />
              <span className="block font-medium">{tab.title}</span>
              <span className="mt-1 block text-sm opacity-70">{tab.description}</span>
              {isActive && (
                <span className="mt-3 inline-block text-xs font-medium uppercase tracking-wide opacity-80">
                  Selected
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div
        className={`mt-4 rounded-2xl border p-5 transition-all duration-300 ${activeTabConfig.panelClass}`}
        aria-live="polite"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-md px-3 py-1 text-sm font-semibold ${activeTabConfig.badgeClass}`}>
            {activeTabConfig.title}
          </span>
          <span className="text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
            {activeTabConfig.description}
          </span>
        </div>
        {renderActiveResult()}
      </div>

      <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 transition-all duration-300 dark:border-[#263042] dark:bg-[#0B1120]">
        <span className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white">
          Model Output
        </span>

        <pre className="mt-4 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#374151] transition-colors duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
          {analysis?.s_expression || "No analysis yet."}
        </pre>
      </div>
    </section>
  )
}
