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

export default function AnalysisHistory({ history, onView, onDelete, onClearAll }) {
  const handleClearAll = () => {
    const confirmed = window.confirm(
      "Clear all analysis history? This action cannot be undone."
    )

    if (confirmed) onClearAll()
  }

  const latest = history[0]

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/70 bg-white p-8 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-medium text-[#111827] dark:text-white">Total Analyses</p>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]"><DocumentIcon /></span>
          </div>
          <p className="mt-12 text-4xl font-medium text-[#111827] dark:text-white">{history.length}</p>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">Sentences analyzed</p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white p-8 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-medium text-[#111827] dark:text-white">Last Analysis</p>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]"><CalendarIcon /></span>
          </div>
          <p className="mt-12 text-4xl font-medium text-[#111827] dark:text-white">
            {latest ? formatShortDate(latest.created_at) : "-"}
          </p>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {latest ? formatDate(latest.created_at) : "No analyses yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white p-8 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-medium text-[#111827] dark:text-white">Storage Used</p>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]"><DocumentIcon /></span>
          </div>
          <p className="mt-12 text-4xl font-medium text-[#111827] dark:text-white">
            {formatBytes(getStorageSize(history))}
          </p>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">In local storage</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white p-8 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-medium text-[#111827] transition-colors duration-300 dark:text-white">Analysis History</h2>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex self-start items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-rose-700 active:scale-[0.98]"
            >
              <TrashIcon />
              Clear All
            </button>
          )}
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-[#263042]">
          {history.length === 0 ? (
            <p className="px-5 py-6 text-[#6B7280] dark:text-[#9CA3AF]">
              No analysis history yet. Start analyzing sentences in the "Syntax Analysis" tab to see your history here.
            </p>
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#E5E7EB] text-[#111827] dark:border-[#263042] dark:text-white">
                <tr>
                  <th className="px-4 py-4 font-bold">Date & Time</th>
                  <th className="px-4 py-4 font-bold">Sentence</th>
                  <th className="px-4 py-4 font-bold">Constituents</th>
                  <th className="px-4 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#E5E7EB] transition-colors duration-300 last:border-b-0 hover:bg-[#F7F8FC] dark:border-[#263042] dark:hover:bg-[#151B2D]/70">
                    <td className="whitespace-nowrap px-4 py-4 text-[#374151] dark:text-[#D1D5DB]">{formatDate(entry.created_at)}</td>
                    <td className="max-w-xl px-4 py-4 text-[#374151] dark:text-[#D1D5DB]">{entry.sentence}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {getConstituents(entry).map((item) => (
                          <span key={`${entry.id}-${item}`} className="rounded-lg bg-[#E8E8ED] px-3 py-1 text-xs font-bold text-[#111827] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
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
          )}
        </div>
      </section>
    </div>
  )
}
