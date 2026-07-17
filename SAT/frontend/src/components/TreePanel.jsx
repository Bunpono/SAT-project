import { useMemo, useState } from "react"
import StaticTree from "./StaticTree"
import { extractProductionRules } from "../utils/treeRules"

function cleanWord(word) {
  return String(word || "").replace(/[.,!?]/g, "").toLowerCase()
}

export default function TreePanel({ analysis }) {
  const [selectedWords, setSelectedWords] = useState([])
  const productionRules = useMemo(
    () => extractProductionRules(analysis?.tree, { includeLexicalRules: false }),
    [analysis?.tree]
  )

  const words = analysis?.sentence
    ? analysis.sentence.trim().split(/\s+/)
    : []

  return (
    <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <h2 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">Production Rules</h2>

        <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {productionRules.length > 0 ? (
            productionRules.map((rule) => (
              <div key={rule} className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-2 text-base text-[#374151] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
                {rule}
              </div>
            ))
          ) : (
            <p className="text-base text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
              Production rules will appear with the syntax tree.
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <h2 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">Tree Diagram</h2>

        {analysis?.tree && (
          <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D]">
            {words.map((word, index) => {
              const active = selectedWords.includes(cleanWord(word))

              return (
                <span
                  key={`${word}-${index}`}
                  className={`rounded-lg px-3 py-1 text-base transition-all duration-300 ${
                    active
                      ? "bg-yellow-300 font-semibold text-slate-950 scale-105"
                      : "bg-white text-[#374151] shadow-sm dark:bg-[#0B1120] dark:text-[#D1D5DB]"
                  }`}
                >
                  {word}
                </span>
              )
            })}
          </div>
        )}

        <div className="mt-5 w-full min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-300 dark:border-[#263042] dark:bg-[#0B1120]">
          {analysis?.tree ? (
            <StaticTree
              key={analysis.s_expression || analysis.sentence}
              data={analysis.tree}
              selectedWords={selectedWords}
              onSelectWords={setSelectedWords}
            />
          ) : (
            <div className="flex h-[430px] items-center justify-center text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
              Tree diagram will appear here.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-base text-[#6B7280] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
          Tip: Scroll to zoom, drag to pan, or click a terminal node to highlight the corresponding word.
        </div>
      </div>
    </section>
  )
}
