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
    <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Saved to your account
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">Analysis History</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Previous results from your account, with the newest result first.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="self-start rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/60">
          <p className="font-semibold text-gray-800 dark:text-slate-100">No analysis history yet</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Analyze a sentence and its result will appear here automatically.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-gray-200 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 dark:border-slate-700 dark:bg-slate-800/40"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900 dark:text-slate-100">{entry.sentence}</p>
                <time
                  dateTime={entry.created_at}
                  className="mt-1 block text-sm text-gray-500 dark:text-slate-400"
                >
                  {formatDate(entry.created_at)}
                </time>
              </div>

              <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => onView(entry)}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-300"
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
