import { useEffect, useMemo, useState } from "react"
import {
  getAdminHistory,
  getAdminReports,
  getAdminUsers,
  updateErrorReportStatus
} from "../services/api"

const tabs = [
  { id: "users", label: "Users" },
  { id: "history", label: "Analysis History" },
  { id: "reports", label: "Error Reports" }
]

const reportStatuses = ["open", "reviewing", "resolved"]

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(date)
}

function getUserName(user) {
  return user?.name || user?.full_name || user?.email || "Guest"
}

function getEntryUser(entry, users) {
  if (entry?.user) return entry.user
  return users.find((user) => String(user.id) === String(entry?.user_id)) || null
}

function getUserEmail(user) {
  return user?.email || "—"
}

function getResultPreview(entry) {
  return entry?.result || entry?.analysis_result || {
    s_expression: entry?.s_expression,
    tree: entry?.tree
  }
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
      <p className="text-base font-bold uppercase text-[#6B7280] transition-colors duration-300 dark:text-[#9CA3AF]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-[#111827] transition-colors duration-300 dark:text-white">
        {value}
      </p>
    </div>
  )
}

function EmptyState({ children }) {
  return (
    <p className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] px-5 py-6 text-center text-base text-[#6B7280] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#9CA3AF]">
      {children}
    </p>
  )
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [history, setHistory] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState("users")
  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedResult, setSelectedResult] = useState(null)
  const [updatingReportId, setUpdatingReportId] = useState(null)
  const [historyFilter, setHistoryFilter] = useState("all")

  useEffect(() => {
    let active = true
    Promise.all([getAdminUsers(), getAdminHistory(), getAdminReports()])
      .then(([usersData, historyData, reportData]) => {
        if (!active) return
        setUsers(usersData)
        setHistory(historyData)
        setReports(reportData)
        setStatus("ready")
      })
      .catch((error) => {
        if (!active) return
        setErrorMessage(error.message)
        setStatus(
          error.message?.toLowerCase().includes("admin") ? "access-denied" : "error"
        )
      })
    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => {
    return {
      totalUsers: users.length,
      totalAnalyses: history.length,
      totalReports: reports.length,
      openReports: reports.filter((report) => report.status === "open").length
    }
  }, [users, history, reports])

  const filteredHistory = useMemo(() => {
    if (historyFilter === "guests") {
      return history.filter((entry) => entry.user_id == null)
    }
    if (historyFilter === "registered") {
      return history.filter((entry) => entry.user_id != null)
    }
    return history
  }, [history, historyFilter])

  const handleUpdateStatus = async (reportId, nextStatus) => {
    setUpdatingReportId(reportId)
    try {
      const updatedReport = await updateErrorReportStatus(reportId, nextStatus)
      setReports((current) =>
        current.map((report) =>
          report.id === reportId ? { ...report, ...updatedReport } : report
        )
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setUpdatingReportId(null)
    }
  }

  if (status === "loading") {
    return (
      <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[#374151] shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:text-[#D1D5DB]">
        Loading admin data...
      </section>
    )
  }

  if (status === "access-denied") {
    return (
      <section className="min-w-0 rounded-2xl border border-red-200 bg-white p-6 text-red-700 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 dark:border-red-900 dark:bg-[#111827] dark:text-red-300">
        Access denied
      </section>
    )
  }

  if (status === "error") {
    return (
      <section className="min-w-0 rounded-2xl border border-red-200 bg-white p-6 text-red-700 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 dark:border-red-900 dark:bg-[#111827] dark:text-red-300">
        {errorMessage || "Unable to load admin data."}
      </section>
    )
  }

  return (
    <section className="min-w-0 space-y-5">
      <div className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827]">
        <p className="text-base font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Admin
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#111827] transition-colors duration-300 dark:text-white">
          Admin Dashboard
        </h2>
        <p className="mt-1 text-base text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          Review users, saved analyses, and syntax error reports.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Users" value={summary.totalUsers} />
        <SummaryCard label="Total Analyses" value={summary.totalAnalyses} />
        <SummaryCard label="Total Error Reports" value={summary.totalReports} />
        <SummaryCard label="Open Reports" value={summary.openReports} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2 rounded-2xl bg-[#E8E8ED] p-2 transition-all duration-300 sm:grid-cols-3 dark:bg-[#151B2D]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-12 rounded-[15px] px-3 py-2.5 text-base font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white text-[#111827] shadow-sm dark:bg-white dark:text-[#111827]"
                : "text-[#111827] hover:bg-white/45 dark:text-[#D1D5DB] dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700 transition-all duration-300 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {activeTab === "users" && (
        <div className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <h3 className="text-lg font-bold text-[#111827] dark:text-white">
            Users
          </h3>
          {users.length === 0 ? (
            <div className="mt-4">
              <EmptyState>No users found.</EmptyState>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-base">
                <thead className="border-b border-[#E5E7EB] text-[#6B7280] dark:border-[#263042] dark:text-[#9CA3AF]">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-[#263042]">
                      <td className="break-words px-3 py-3 font-semibold text-[#111827] dark:text-white">{getUserName(item)}</td>
                      <td className="break-all px-3 py-3 text-[#374151] dark:text-[#D1D5DB]">{getUserEmail(item)}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-lg bg-[#E8E8ED] px-3 py-1 text-sm font-bold text-[#111827] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
                          {item.role || "user"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#6B7280] dark:text-[#9CA3AF]">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <h3 className="text-lg font-bold text-[#111827] dark:text-white">
            Analysis History
          </h3>
          <label className="mt-4 flex max-w-sm flex-col gap-2 text-base font-bold text-[#374151] dark:text-[#D1D5DB]">
            Show
            <select
              value={historyFilter}
              onChange={(event) => setHistoryFilter(event.target.value)}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 font-medium text-[#111827] outline-none dark:border-[#263042] dark:bg-[#151B2D] dark:text-white"
            >
              <option value="all">All</option>
              <option value="registered">Registered Users</option>
              <option value="guests">Guests</option>
            </select>
          </label>
          {filteredHistory.length === 0 ? (
            <div className="mt-4">
              <EmptyState>No analyses yet.</EmptyState>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-base">
                <thead className="border-b border-[#E5E7EB] text-[#6B7280] dark:border-[#263042] dark:text-[#9CA3AF]">
                  <tr>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">User</th>
                    <th className="px-3 py-3">Sentence</th>
                    <th className="px-3 py-3">Sentence Type</th>
                    <th className="px-3 py-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-[#263042]">
                      <td className="whitespace-nowrap px-3 py-3 text-[#6B7280] dark:text-[#9CA3AF]">{formatDate(entry.created_at)}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-[#111827] dark:text-white">{getUserName(getEntryUser(entry, users))}</p>
                        <p className="break-all text-sm text-[#6B7280] dark:text-[#9CA3AF]">{getUserEmail(getEntryUser(entry, users))}</p>
                      </td>
                      <td className="max-w-xl break-words px-3 py-3 text-[#374151] dark:text-[#D1D5DB]">{entry.sentence}</td>
                      <td className="px-3 py-3 text-[#374151] dark:text-[#D1D5DB]">{entry.sentence_type || "Unknown"}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedResult(getResultPreview(entry))}
                          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-base font-bold text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#151B2D]"
                        >
                          View Result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <div className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5">
          <h3 className="text-lg font-bold text-[#111827] dark:text-white">
            Error Reports
          </h3>
          {reports.length === 0 ? (
            <div className="mt-4">
              <EmptyState>No error reports yet.</EmptyState>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 text-[#374151] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]"
                >
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">
                        {formatDate(report.created_at)}
                      </p>
                      <p className="mt-1 font-semibold text-[#111827] dark:text-white">
                        {getUserName(report.user)}
                        <span className="ml-2 break-all font-normal text-[#6B7280] dark:text-[#9CA3AF]">
                          {getUserEmail(report.user)}
                        </span>
                      </p>
                      <p className="mt-3 text-sm font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">
                        Sentence
                      </p>
                      <p className="mt-1 break-words">{report.sentence}</p>
                      <p className="mt-3 text-sm font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">
                        Description
                      </p>
                      <p className="mt-1 break-words">{report.description}</p>
                    </div>

                    <div className="min-w-0 lg:w-64">
                      <p className="text-sm font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">
                        Status
                      </p>
                      <p className="mt-1 rounded-lg bg-white px-3 py-2 text-base font-bold capitalize text-[#111827] dark:bg-[#0B1120] dark:text-white">
                        {report.status || "open"}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {reportStatuses.map((nextStatus) => (
                          <button
                            key={`${report.id}-${nextStatus}`}
                            type="button"
                            onClick={() => handleUpdateStatus(report.id, nextStatus)}
                            disabled={updatingReportId === report.id || report.status === nextStatus}
                            className="min-h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-base font-bold capitalize text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#263042] dark:bg-[#111827] dark:text-white dark:hover:bg-[#0B1120]"
                          >
                            {updatingReportId === report.id ? "Updating..." : nextStatus}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/60 px-4 backdrop-blur-sm">
          <section className="w-full max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_24px_70px_rgba(17,24,39,0.18)] transition-all duration-300 sm:p-6 dark:border-[#263042] dark:bg-[#111827]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                Analysis Result
              </h3>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-base font-bold text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] dark:border-[#263042] dark:text-white dark:hover:bg-[#151B2D]"
              >
                Close
              </button>
            </div>
            <pre className="mt-4 max-h-[70vh] overflow-auto rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 text-sm text-[#374151] transition-all duration-300 dark:border-[#263042] dark:bg-[#0B1120] dark:text-[#D1D5DB]">
              {JSON.stringify(selectedResult, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </section>
  )
}
