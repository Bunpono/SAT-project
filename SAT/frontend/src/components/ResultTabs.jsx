import { useMemo, useState } from "react"
import { analyzeTree } from "../utils/treeAnalysis"

const tabs = [
  {
    id: "pos",
    title: "POS Analysis",
    description: "Part of Speech Tags",
    dotClass: "bg-blue-500",
    activeClass:
      "border-blue-300 bg-blue-50 text-blue-950 ring-2 ring-blue-200 dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-100 dark:ring-blue-800",
    panelClass:
      "border-blue-200 bg-blue-50/70 dark:border-blue-800 dark:bg-blue-950/40",
    badgeClass: "bg-blue-600 text-white dark:bg-blue-500"
  },
  {
    id: "phrase",
    title: "Phrase Analysis",
    description: "Noun / Verb Phrases",
    dotClass: "bg-emerald-500",
    activeClass:
      "border-emerald-300 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-100 dark:ring-emerald-800",
    panelClass:
      "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40",
    badgeClass: "bg-emerald-600 text-white dark:bg-emerald-500"
  },
  {
    id: "clause",
    title: "Clause Analysis",
    description: "Main & Sub Clauses",
    dotClass: "bg-purple-500",
    activeClass:
      "border-purple-300 bg-purple-50 text-purple-950 ring-2 ring-purple-200 dark:border-purple-600 dark:bg-purple-950/60 dark:text-purple-100 dark:ring-purple-800",
    panelClass:
      "border-purple-200 bg-purple-50/70 dark:border-purple-800 dark:bg-purple-950/40",
    badgeClass: "bg-purple-600 text-white dark:bg-purple-500"
  },
  {
    id: "sentence",
    title: "Sentence Type",
    description: "Simple / Compound / Complex",
    dotClass: "bg-orange-500",
    activeClass:
      "border-orange-300 bg-orange-50 text-orange-950 ring-2 ring-orange-200 dark:border-orange-600 dark:bg-orange-950/60 dark:text-orange-100 dark:ring-orange-800",
    panelClass:
      "border-orange-200 bg-orange-50/70 dark:border-orange-800 dark:bg-orange-950/40",
    badgeClass: "bg-orange-600 text-white dark:bg-orange-500"
  }
]

const idleCardClass =
  "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"

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
              className="rounded-lg border border-blue-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-blue-800 dark:bg-slate-900/70 dark:text-slate-200"
            >
              <span className="font-semibold text-slate-950 dark:text-white">{word}</span>
              <span className="ml-2 font-medium text-blue-600 dark:text-blue-300">{tag}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">
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
              className="rounded-lg border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-emerald-800 dark:bg-slate-900/70 dark:text-slate-200"
            >
              <span className="mr-3 inline-block rounded-md bg-emerald-600 px-2 py-1 font-semibold text-white dark:bg-emerald-500">
                {type}
              </span>
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">
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
              className="rounded-lg border border-purple-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-purple-800 dark:bg-slate-900/70 dark:text-slate-200"
            >
              <span className="font-semibold text-purple-800 dark:text-purple-300">{type}:</span>{" "}
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No S clause nodes were found in this tree.
        </p>
      )
    }

    return (
      <div className="rounded-lg border border-orange-200 bg-white/80 px-4 py-3 shadow-sm dark:border-orange-800 dark:bg-slate-900/70">
        <p className="font-semibold text-orange-900 dark:text-orange-200">
          {treeAnalysis.sentenceType}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {treeAnalysis.sentenceTypeReason}
        </p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Analysis Results
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
              className={`relative rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                isActive ? tab.activeClass : idleCardClass
              }`}
            >
              <span className={`mb-3 block h-2.5 w-2.5 rounded-full ${tab.dotClass}`} />
              <span className="block font-semibold">{tab.title}</span>
              <span className="mt-1 block text-sm opacity-70">{tab.description}</span>
              {isActive && (
                <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide opacity-80">
                  Selected
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div
        className={`mt-4 rounded-xl border p-5 transition-colors ${activeTabConfig.panelClass}`}
        aria-live="polite"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-md px-3 py-1 text-sm font-semibold ${activeTabConfig.badgeClass}`}>
            {activeTabConfig.title}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {activeTabConfig.description}
          </span>
        </div>
        {renderActiveResult()}
      </div>

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <span className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white">
          Model Output
        </span>

        <pre className="mt-4 overflow-x-auto rounded-lg bg-white p-4 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">
          {analysis?.s_expression || "No analysis yet."}
        </pre>
      </div>
    </section>
  )
}
