import { useState } from "react"
import StaticTree from "./StaticTree"

function cleanWord(word) {
  return String(word || "").replace(/[.,!?]/g, "").toLowerCase()
}

export default function TreePanel({ analysis }) {
  const [selectedWords, setSelectedWords] = useState([])

  const words = analysis?.sentence
    ? analysis.sentence.trim().split(/\s+/)
    : []

  return (
    <section className="grid grid-cols-[360px_1fr] gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Production Rules</h2>

        <div className="mt-5 space-y-3">
          {["S → NP VP", "NP → Det N | PRO | N", "VP → Vgp NP | Vgp PP", "PP → P NP"].map((rule) => (
            <div key={rule} className="rounded-md bg-gray-100 px-4 py-2 text-sm">
              {rule}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Tree Diagram</h2>

        {analysis?.tree && (
          <div className="mt-5 flex flex-wrap gap-2 rounded-xl bg-gray-100 p-4">
            {words.map((word, index) => {
              const active = selectedWords.includes(cleanWord(word))

              return (
                <span
                  key={`${word}-${index}`}
                  className={`rounded-md px-3 py-1 text-sm transition ${
                    active
                      ? "bg-yellow-300 font-semibold text-slate-950 scale-105"
                      : "bg-white text-slate-700"
                  }`}
                >
                  {word}
                </span>
              )
            })}
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-xl border bg-white">
          {analysis?.tree ? (
            <StaticTree
              data={analysis.tree}
              selectedWords={selectedWords}
              onSelectWords={setSelectedWords}
            />
          ) : (
            <div className="flex h-[430px] items-center justify-center text-gray-400">
              Tree diagram will appear here.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-gray-500">
          💡 Tip: Click on any terminal node to highlight the corresponding word.
        </div>
      </div>
    </section>
  )
}