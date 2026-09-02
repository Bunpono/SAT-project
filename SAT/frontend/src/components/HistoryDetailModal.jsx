import { useEffect, useRef } from "react"
import ResultTabs from "./ResultTabs"
import TreePanel from "./TreePanel"

function formatDate(createdAt) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date)
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function HistoryDetailModal({ entry, onClose, onAnalyzeAgain }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!entry) return undefined

    const previousOverflow = document.body.style.overflow
    previousFocusRef.current = document.activeElement
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose()
      if (event.key !== "Tab") return

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [entry, onClose])

  if (!entry) return null

  const analysis = {
    sentence: entry.sentence,
    s_expression: entry.s_expression,
    tree: entry.tree
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-detail-title"
        className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl border border-white/70 bg-[#F7F8FC] shadow-2xl sm:max-h-[90vh] sm:rounded-3xl dark:border-[#263042] dark:bg-[#080D19]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E7EB] bg-white px-4 py-4 sm:px-6 dark:border-[#263042] dark:bg-[#111827]">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">Saved analysis</p>
            <h2 id="history-detail-title" className="mt-1 text-xl font-bold text-[#111827] sm:text-2xl dark:text-white">
              Analysis result
            </h2>
            <p className="mt-1 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{formatDate(entry.created_at)}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close saved analysis"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="overflow-y-auto overscroll-contain p-4 pb-8 sm:p-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/25">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Sentence</p>
            <p className="mt-2 break-words text-lg font-semibold leading-7 text-[#111827] dark:text-white">{entry.sentence}</p>
          </div>

          <div className="mt-5">
            <TreePanel analysis={analysis} />
          </div>
          <div className="mt-5">
            <ResultTabs analysis={analysis} />
          </div>
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#E5E7EB] bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6 dark:border-[#263042] dark:bg-[#111827]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-[#E5E7EB] bg-white px-5 text-base font-bold text-[#374151] hover:bg-[#F7F8FC] dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:hover:bg-[#0B1120]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onAnalyzeAgain(entry)}
            className="min-h-11 rounded-xl bg-blue-600 px-5 text-base font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98]"
          >
            Analyze again
          </button>
        </footer>
      </section>
    </div>
  )
}
