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
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Production Rules</h2>

        <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {productionRules.length > 0 ? (
            productionRules.map((rule) => (
              <div key={rule} className="rounded-md bg-gray-100 px-4 py-2 text-sm dark:bg-slate-800 dark:text-slate-200">
                {rule}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500">
              Production rules will appear with the syntax tree.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Tree Diagram</h2>

        {analysis?.tree && (
          <div className="mt-5 flex flex-wrap gap-2 rounded-xl bg-gray-100 p-4 dark:bg-slate-800">
            {words.map((word, index) => {
              const active = selectedWords.includes(cleanWord(word))

              return (
                <span
                  key={`${word}-${index}`}
                  className={`rounded-md px-3 py-1 text-sm transition ${
                    active
                      ? "bg-yellow-300 font-semibold text-slate-950 scale-105"
                      : "bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                  }`}
                >
                  {word}
                </span>
              )
            })}
          </div>
        )}

        <div className="mt-5 w-full overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
          {analysis?.tree ? (
            <StaticTree
              data={analysis.tree}
              selectedWords={selectedWords}
              onSelectWords={setSelectedWords}
            />
          ) : (
            <div className="flex h-[430px] items-center justify-center text-gray-400 dark:text-slate-500">
              Tree diagram will appear here.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-gray-500 dark:bg-blue-950/40 dark:text-slate-300">
          💡 Tip: Click on any terminal node to highlight the corresponding word.
        </div>
      </div>
    </section>
  )
}
