import { useMemo, useState } from "react"

function formatDate(createdAt) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) return "Unknown date"

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date)
}

function formatShortDate(createdAt) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(date)
}

function formatBytes(value) {
  if (!value) return "0.0 KB"
  const kb = value / 1024
  return `${kb.toFixed(1)} KB`
}

function getStorageSize(history) {
  return new Blob([JSON.stringify(history)]).size
}

function getConstituents(entry) {
  const children = entry?.tree?.children
  if (!Array.isArray(children) || children.length === 0) return ["S"]

  return children
    .map((child) => child?.name)
    .filter(Boolean)
    .slice(0, 4)
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l4 4v14H7V3Zm7 0v5h5M10 13h6m-6 4h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="m8 5 11 7-11 7V5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default function AnalysisHistory({
  history,
  onView,
  onDelete,
  onClearAll,
  onAnalyzeAgain
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return history

    return history.filter((entry) =>
      String(entry.sentence || "").toLowerCase().includes(query)
    )
  }, [history, searchTerm])

  const handleClearAll = () => {
    const confirmed = window.confirm(
      "Clear all analysis history? This action cannot be undone."
    )

    if (confirmed) onClearAll()
  }

  const latest = history[0]

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-medium text-[#111827] dark:text-white">Total Analyses</p>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]"><DocumentIcon /></span>
          </div>
          <p className="mt-8 text-3xl font-medium text-[#111827] sm:mt-12 sm:text-4xl dark:text-white">{history.length}</p>
          <p className="mt-2 text-base text-[#6B7280] dark:text-[#9CA3AF]">Sentences analyzed</p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-medium text-[#111827] dark:text-white">Last Analysis</p>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]"><CalendarIcon /></span>
          </div>
          <p className="mt-8 text-3xl font-medium text-[#111827] sm:mt-12 sm:text-4xl dark:text-white">
            {latest ? formatShortDate(latest.created_at) : "-"}
          </p>
          <p className="mt-2 text-base text-[#6B7280] dark:text-[#9CA3AF]">
            {latest ? formatDate(latest.created_at) : "No analyses yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-medium text-[#111827] dark:text-white">Storage Used</p>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]"><DocumentIcon /></span>
          </div>
          <p className="mt-8 text-3xl font-medium text-[#111827] sm:mt-12 sm:text-4xl dark:text-white">
            {formatBytes(getStorageSize(history))}
          </p>
          <p className="mt-2 text-base text-[#6B7280] dark:text-[#9CA3AF]">In local storage</p>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-2xl font-medium text-[#111827] transition-colors duration-300 dark:text-white">Analysis History</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search sentence history..."
              className="min-h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 text-base font-medium text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:bg-white focus:ring-4 focus:ring-[#111827]/10 sm:w-80 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:bg-[#0B1120] dark:focus:ring-white/15"
            />

            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-base font-bold text-white shadow-sm transition-all duration-300 hover:bg-rose-700 active:scale-[0.98] sm:w-auto"
              >
                <TrashIcon />
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 min-w-0 sm:mt-8">
          {history.length === 0 ? (
            <p className="px-5 py-6 text-[#6B7280] dark:text-[#9CA3AF]">
              No analysis history yet. Start analyzing sentences in the "Syntax Analysis" tab to see your history here.
            </p>
          ) : filteredHistory.length === 0 ? (
            <p className="px-5 py-6 text-[#6B7280] dark:text-[#9CA3AF]">
              No history records match your search.
            </p>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {filteredHistory.map((entry) => (
                  <article
                    key={`card-${entry.id}`}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">
                        Date
                      </span>
                      <p className="text-base font-semibold text-[#111827] dark:text-white">
                        {formatDate(entry.created_at)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">
                        Sentence
                      </span>
                      <p className="mt-1 break-words text-base leading-7 text-[#374151] dark:text-[#D1D5DB]">
                        {entry.sentence}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">
                        Constituents
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getConstituents(entry).map((item) => (
                          <span
                            key={`card-${entry.id}-${item}`}
                            className="rounded-lg bg-[#E8E8ED] px-3 py-1 text-sm font-bold text-[#111827] dark:bg-[#0B1120] dark:text-[#D1D5DB]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <button
                        type="button"
                        onClick={() => onAnalyzeAgain(entry)}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-base font-bold text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#0B1120]"
                      >
                        <PlayIcon />
                        Analyze Again
                      </button>
                      <button
                        type="button"
                        onClick={() => onView(entry)}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-base font-bold text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#0B1120]"
                      >
                        <EyeIcon />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-base font-bold text-red-600 transition-all duration-300 hover:bg-red-50 dark:border-red-900 dark:bg-[#111827] dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        <TrashIcon />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-[#263042] lg:block">
                <table className="w-full min-w-[940px] text-left text-base">
                  <thead className="border-b border-[#E5E7EB] text-[#111827] dark:border-[#263042] dark:text-white">
                    <tr>
                      <th className="px-4 py-4 font-bold">Date & Time</th>
                      <th className="px-4 py-4 font-bold">Sentence</th>
                      <th className="px-4 py-4 font-bold">Constituents</th>
                      <th className="px-4 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((entry) => (
                      <tr key={entry.id} className="border-b border-[#E5E7EB] transition-colors duration-300 last:border-b-0 hover:bg-[#F7F8FC] dark:border-[#263042] dark:hover:bg-[#151B2D]/70">
                        <td className="whitespace-nowrap px-4 py-4 text-[#374151] dark:text-[#D1D5DB]">{formatDate(entry.created_at)}</td>
                        <td className="max-w-xl break-words px-4 py-4 text-[#374151] dark:text-[#D1D5DB]">{entry.sentence}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {getConstituents(entry).map((item) => (
                              <span key={`${entry.id}-${item}`} className="rounded-lg bg-[#E8E8ED] px-3 py-1 text-sm font-bold text-[#111827] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
                                {item}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onAnalyzeAgain(entry)}
                              className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-bold text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#151B2D]"
                            >
                              <PlayIcon />
                              Analyze Again
                            </button>
                            <button
                              type="button"
                              onClick={() => onView(entry)}
                              className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-bold text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#151B2D]"
                            >
                              <EyeIcon />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(entry.id)}
                              className="rounded-xl p-2 text-[#111827] transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:text-[#D1D5DB] dark:hover:bg-red-950/40 dark:hover:text-red-300"
                              aria-label={`Delete ${entry.sentence}`}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
