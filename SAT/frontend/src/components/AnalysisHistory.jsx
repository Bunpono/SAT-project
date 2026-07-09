function formatDate(createdAt) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) return "Unknown date"

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date)
}

export default function AnalysisHistory({ history, onView, onDelete, onClearAll }) {
  const handleClearAll = () => {
    const confirmed = window.confirm(
      "Clear all analysis history? This action cannot be undone."
    )

    if (confirmed) onClearAll()
  }

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Saved to your account
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#111827] transition-colors duration-300 dark:text-white">Analysis History</h2>
          <p className="mt-1 text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
            Previous results from your account, with the newest result first.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="self-start rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-50 active:scale-[0.98] dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F7F8FC] px-6 py-12 text-center transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D]">
          <p className="font-semibold text-[#111827] transition-colors duration-300 dark:text-white">No analysis history yet</p>
          <p className="mt-1 text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
            Analyze a sentence and its result will appear here automatically.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 transition-all duration-300 sm:flex sm:items-center sm:justify-between sm:gap-6 dark:border-[#263042] dark:bg-[#151B2D]"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#111827] transition-colors duration-300 dark:text-white">{entry.sentence}</p>
                <time
                  dateTime={entry.created_at}
                  className="mt-1 block text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]"
                >
                  {formatDate(entry.created_at)}
                </time>
              </div>

              <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => onView(entry)}
                  className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(17,24,39,0.14)] transition-all duration-300 hover:bg-[#374151] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-[#111827] dark:hover:bg-[#D1D5DB]"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] dark:border-[#263042] dark:text-[#D1D5DB] dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
