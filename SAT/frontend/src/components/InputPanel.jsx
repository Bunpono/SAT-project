import { useState } from "react"
import { analyzeSentence, submitErrorReport } from "../services/api"

export default function InputPanel({ analysis, onAnalyzeComplete }) {
  const [sentence, setSentence] = useState("She is talking about her dog.")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportDescription, setReportDescription] = useState("")
  const [reportStatus, setReportStatus] = useState("")

  const handleAnalyze = async () => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    setErrorMessage("")

    try {
      const result = await analyzeSentence(sentence)
      onAnalyzeComplete(result)
    } catch (error) {
      console.error("Unable to analyze the sentence:", error)
      setErrorMessage(
        "The analysis service is temporarily unavailable. Please try again later."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSentence("")
    setErrorMessage("")
    onAnalyzeComplete(null)
  }

  const handleReport = async () => {
    if (!reportDescription.trim()) {
      setReportStatus("Please describe the problem first.")
      return
    }

    setReportStatus("Sending...")
    try {
      await submitErrorReport(sentence, reportDescription.trim(), analysis)
      setReportDescription("")
      setReportStatus("Report sent successfully.")
    } catch (error) {
      setReportStatus(error.message)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Input Sentence</h2>

      <label className="mt-5 block text-sm font-semibold text-gray-700 dark:text-slate-300">
        Enter or Paste English Sentence Here
      </label>

      <textarea
        value={sentence}
        onChange={(e) => {
          setSentence(e.target.value)
          setErrorMessage("")
        }}
        onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleAnalyze()
        }
        }}
        className="mt-2 h-32 w-full resize-none rounded-xl bg-gray-100 p-4 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          aria-busy={isAnalyzing}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500">
          {isAnalyzing ? "Analyzing..." : "Analyze Syntax"}
        </button>

        <button
          onClick={handleClear}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Clear
        </button>

        <button
          type="button"
          onClick={() => { setShowReportForm((value) => !value); setReportStatus("") }}
          className="rounded-lg border border-orange-200 px-5 py-2.5 text-sm font-medium text-orange-500 transition hover:bg-orange-50 active:scale-95 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/40"
        >
          Report Error
        </button>
      </div>

      {showReportForm && (
        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
          <label className="block text-sm font-medium text-orange-900 dark:text-orange-200">
            Describe what looks incorrect
            <textarea
              value={reportDescription}
              onChange={(event) => { setReportDescription(event.target.value); setReportStatus("") }}
              className="mt-2 h-24 w-full resize-none rounded-lg border border-orange-200 bg-white p-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-400 dark:border-orange-900 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleReport}
              disabled={reportStatus === "Sending..."}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send Report
            </button>
            {reportStatus && <p className="text-sm text-orange-800 dark:text-orange-200">{reportStatus}</p>}
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {errorMessage}
        </div>
      )}
    </section>
  )
}
