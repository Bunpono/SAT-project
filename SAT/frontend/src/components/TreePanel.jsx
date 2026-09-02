import { useEffect, useMemo, useRef, useState } from "react"
import StaticTree from "./StaticTree"
import { extractProductionRules } from "../utils/treeRules"

function cleanWord(word) {
  return String(word || "").replace(/[.,!?]/g, "").toLowerCase()
}

export default function TreePanel({ analysis }) {
  const [selectedWords, setSelectedWords] = useState([])
  const [saveError, setSaveError] = useState("")
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const treeSvgRef = useRef(null)
  const productionRules = useMemo(
    () => extractProductionRules(analysis?.tree, { includeLexicalRules: false }),
    [analysis?.tree]
  )

  const words = analysis?.sentence
    ? analysis.sentence.trim().split(/\s+/)
    : []

  useEffect(() => {
    if (!isFullscreen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsFullscreen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen])

  const handleSaveTree = async () => {
    const svg = treeSvgRef.current
    if (!svg) return

    try {
      const width = Math.max(svg.clientWidth, 1)
      const height = Math.max(svg.clientHeight, 1)
      const exportScale = 2
      const copy = svg.cloneNode(true)
      copy.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      copy.setAttribute("width", String(width * exportScale))
      copy.setAttribute("height", String(height * exportScale))

      const source = new Blob([new XMLSerializer().serializeToString(copy)], {
        type: "image/svg+xml;charset=utf-8"
      })
      const sourceUrl = URL.createObjectURL(source)
      const image = new Image()

      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = sourceUrl
      })

      const canvas = document.createElement("canvas")
      canvas.width = width * exportScale
      canvas.height = height * exportScale
      const context = canvas.getContext("2d")
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(sourceUrl)
      const downloadUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = "syntactic-tree-diagram.png"
      link.click()
      setSaveError("")
    } catch {
      setSaveError("Unable to save the tree image. Please try again.")
    }
  }

  return (
    <section className="min-w-0">
      <div
        className={`${isFullscreen ? "fixed inset-0 z-50 overflow-y-auto rounded-none p-3 sm:p-5" : "min-w-0 rounded-2xl p-4 sm:p-6"} border border-white/70 bg-white shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]`}
        role={isFullscreen ? "dialog" : undefined}
        aria-modal={isFullscreen ? "true" : undefined}
        aria-label={isFullscreen ? "Fullscreen syntax tree" : undefined}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">Tree Diagram</h2>
          {analysis?.tree && (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen((value) => !value)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB] dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
              >
                {isFullscreen ? "Close" : "Full screen"}
              </button>
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={handleSaveTree}
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB] dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                >
                  Save PNG
                </button>
              )}
            </div>
          )}
        </div>

        {analysis?.tree && !isFullscreen && (
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
              svgRef={treeSvgRef}
              data={analysis.tree}
              selectedWords={selectedWords}
              onSelectWords={setSelectedWords}
              isFullscreen={isFullscreen}
            />
          ) : (
            <div className="flex h-[430px] items-center justify-center text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
              Tree diagram will appear here.
            </div>
          )}
        </div>

        {!isFullscreen && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-base text-[#6B7280] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
            Tip: Drag to pan, pinch or use +/− to zoom, and tap a terminal node to highlight its word.
          </div>
        )}

        {!isFullscreen && <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsRulesOpen((value) => !value)}
            aria-expanded={isRulesOpen}
            aria-controls="production-rules"
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-base font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB] dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
          >
            {isRulesOpen ? "Hide production rules" : "Show production rules"}
          </button>
        </div>}

        {isRulesOpen && !isFullscreen && (
          <div
            id="production-rules"
            className="mt-3 min-w-0 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 transition-all duration-300 dark:border-[#263042] dark:bg-[#0B1120]"
          >
            <p className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              Production rules
            </p>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
              {productionRules.length > 0 ? (
                productionRules.map((rule) => (
                  <div key={rule} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-base text-[#374151] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
                    {rule}
                  </div>
                ))
              ) : (
                <p className="text-base text-[#6B7280] dark:text-[#9CA3AF]">
                  No production rules are available.
                </p>
              )}
            </div>
          </div>
        )}
        {saveError && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{saveError}</p>
        )}
      </div>
    </section>
  )
}
