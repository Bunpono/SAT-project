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
    return <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[#374151] shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:text-[#D1D5DB] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">Loading admin data...</section>
  }

  if (status === "error") {
    return (
      <section className="min-w-0 rounded-2xl border border-red-200 bg-white p-4 text-red-700 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-8 dark:border-red-900 dark:bg-[#111827] dark:text-red-300 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        Unable to load admin data.
      </section>
    )
  }

  return (
    <section className="min-w-0 space-y-6">
      <div className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <h2 className="text-2xl font-bold text-[#111827] transition-colors duration-300 dark:text-white">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          Review analyses and error reports from all users.
        </p>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <h3 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">All Analysis History ({history.length})</h3>
        <div className="mt-4 max-w-full overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#E5E7EB] text-[#6B7280] transition-colors duration-300 dark:border-[#263042] dark:text-[#9CA3AF]">
              <tr><th className="px-3 py-3">User</th><th className="px-3 py-3">Sentence</th><th className="px-3 py-3">Date</th></tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-[#E5E7EB] text-[#374151] transition-colors duration-300 dark:border-[#263042] dark:text-[#D1D5DB]">
                  <td className="px-3 py-3"><span className="font-semibold text-[#111827] dark:text-white">{item.user.name}</span><br /><span className="break-all text-xs text-[#6B7280] dark:text-[#9CA3AF]">{item.user.email}</span></td>
                  <td className="max-w-xl break-words px-3 py-3">{item.sentence}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-[#6B7280] dark:text-[#9CA3AF]">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">No analyses yet.</p>}
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <h3 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">Error Reports ({reports.length})</h3>
        <div className="mt-4 space-y-3">
          {reports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 text-[#374151] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <p className="break-words font-semibold text-[#111827] dark:text-white">{report.user.name} <span className="break-all font-normal text-[#6B7280] dark:text-[#9CA3AF]">({report.user.email})</span></p>
                <time className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{formatDate(report.created_at)}</time>
              </div>
              <p className="mt-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">Sentence</p>
              <p className="break-words">{report.sentence}</p>
              <p className="mt-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">Description</p>
              <p className="break-words">{report.description}</p>
            </article>
          ))}
          {reports.length === 0 && <p className="py-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">No error reports yet.</p>}
        </div>
      </div>
    </section>
  )
}
