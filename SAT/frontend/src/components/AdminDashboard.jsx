import { useEffect, useState } from "react"
import { getAdminHistory, getAdminReports } from "../services/api"

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export default function AdminDashboard() {
  const [history, setHistory] = useState([])
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    let active = true
    Promise.all([getAdminHistory(), getAdminReports()])
      .then(([historyData, reportData]) => {
        if (!active) return
        setHistory(historyData)
        setReports(reportData)
        setStatus("ready")
      })
      .catch(() => {
        if (active) setStatus("error")
      })
    return () => { active = false }
  }, [])

  if (status === "loading") {
    return <section className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">Loading admin data...</section>
  }

  if (status === "error") {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8 text-red-700 shadow-sm dark:border-red-900 dark:bg-slate-900 dark:text-red-300">
        Unable to load admin data.
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-gray-950 dark:text-white">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Review analyses and error reports from all users.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="text-lg font-semibold">All Analysis History ({history.length})</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-slate-700 dark:text-slate-400">
              <tr><th className="px-3 py-3">User</th><th className="px-3 py-3">Sentence</th><th className="px-3 py-3">Date</th></tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-slate-800">
                  <td className="px-3 py-3"><span className="font-medium">{item.user.name}</span><br /><span className="text-xs text-gray-500">{item.user.email}</span></td>
                  <td className="max-w-xl px-3 py-3">{item.sentence}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500 dark:text-slate-400">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="py-8 text-center text-gray-500">No analyses yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Error Reports ({reports.length})</h3>
        <div className="mt-4 space-y-3">
          {reports.map((report) => (
            <article key={report.id} className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <p className="font-medium">{report.user.name} <span className="font-normal text-gray-500">({report.user.email})</span></p>
                <time className="text-sm text-gray-500 dark:text-slate-400">{formatDate(report.created_at)}</time>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">Sentence</p>
              <p>{report.sentence}</p>
              <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">Description</p>
              <p>{report.description}</p>
            </article>
          ))}
          {reports.length === 0 && <p className="py-8 text-center text-gray-500">No error reports yet.</p>}
        </div>
      </div>
    </section>
  )
}
