import { useMemo, useState } from "react"
import { analyzeTree } from "../utils/treeAnalysis"

const tabs = [
  { id: "pos", title: "POS Analysis", description: "Part of Speech Tags" },
  { id: "phrase", title: "Phrase Analysis", description: "Noun / Verb Phrases" },
  { id: "clause", title: "Clause Analysis", description: "Main & Sub Clauses" },
  { id: "sentence", title: "Sentence Type", description: "Simple / Compound / Complex" }
]

export default function ResultTabs({ analysis }) {
  const [activeTab, setActiveTab] = useState("pos")
  const treeAnalysis = useMemo(() => analyzeTree(analysis?.tree), [analysis?.tree])

  const renderActiveResult = () => {
    if (activeTab === "pos") {
      return treeAnalysis.posTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {treeAnalysis.posTags.map(({ word, tag }, index) => (
            <span
              key={`${word}-${tag}-${index}`}
              className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-gray-700"
            >
              <span className="font-semibold text-gray-950">{word}</span>
              <span className="ml-2 text-blue-600">{tag}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No POS tags were found in this tree.</p>
      )
    }

    if (activeTab === "phrase") {
      return treeAnalysis.phrases.length > 0 ? (
        <ul className="space-y-2">
          {treeAnalysis.phrases.map(({ type, text }, index) => (
            <li
              key={`${type}-${text}-${index}`}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            >
              <span className="mr-3 rounded-md bg-slate-950 px-2 py-1 font-semibold text-white">
                {type}
              </span>
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No phrase nodes were found in this tree.</p>
      )
    }

    if (activeTab === "clause") {
      return treeAnalysis.clauses.length > 0 ? (
        <ul className="space-y-2">
          {treeAnalysis.clauses.map(({ type, text }, index) => (
            <li
              key={`${type}-${text}-${index}`}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            >
              <span className="font-semibold text-gray-950">{type}:</span> {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No S clause nodes were found in this tree.</p>
      )
    }

    return (
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="font-semibold text-gray-950">{treeAnalysis.sentenceType}</p>
        <p className="mt-1 text-sm text-gray-600">{treeAnalysis.sentenceTypeReason}</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`rounded-xl border p-4 text-left transition ${
                activeTab === tab.id
                  ? "bg-slate-950 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className="font-semibold">{tab.title}</span>
              <span className="mt-1 block text-sm opacity-70">{tab.description}</span>
            </button>
          ))}
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        {renderActiveResult()}
      </div>

      <div className="mt-4 rounded-xl border bg-blue-50 p-4">
        <span className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white">
          Model Output
        </span>

        <pre className="mt-4 overflow-x-auto rounded-lg bg-white p-4 text-sm text-gray-700">
          {analysis?.s_expression || "No analysis yet."}
        </pre>
      </div>
    </section>
  )
}
