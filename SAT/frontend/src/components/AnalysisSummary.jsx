import { useMemo } from "react"
import { validateSentenceInput } from "../utils/sentenceValidation"

function getMainStructure(tree) {
  const rootName = tree?.name || "S"
  const children = Array.isArray(tree?.children) ? tree.children : []
  const childNames = children
    .map((child) => child?.name)
    .filter(Boolean)
    .slice(0, 4)

  if (childNames.length === 0) return rootName
  return `${rootName} -> ${childNames.join(" ")}`
}

function getWordCount(sentence) {
  return String(sentence || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export default function AnalysisSummary({ analysis }) {
  const summary = useMemo(() => {
    const validation = validateSentenceInput(analysis?.sentence || "")

    return {
      sentenceType: validation.sentenceType,
      mainStructure: getMainStructure(analysis?.tree),
      wordCount: getWordCount(analysis?.sentence),
      status: analysis?.tree ? "Parsed Successfully" : "Not Parsed"
    }
  }, [analysis])

  const items = [
    ["Sentence Type", summary.sentenceType],
    ["Main Structure", summary.mainStructure],
    ["Word Count", summary.wordCount],
    ["Status", summary.status]
  ]

  return (
    <section className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-5 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D]"
          >
            <p className="text-sm font-bold uppercase text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
              {label}
            </p>
            <p className="mt-1 break-words text-base font-bold text-[#111827] transition-colors duration-300 sm:text-lg dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
