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
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <h2 className="text-lg font-bold text-[#111827] transition-colors duration-300 dark:text-white">Input Sentence</h2>

      <label className="mt-5 block text-sm font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
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
        placeholder="Type a sentence to analyze..."
        className="mt-2 h-32 w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10 dark:border-[#263042] dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white dark:focus:ring-white/15"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          aria-busy={isAnalyzing}
          className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(17,24,39,0.16)] transition-all duration-300 hover:bg-[#374151] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:opacity-50 dark:bg-white dark:text-[#111827] dark:shadow-[0_12px_28px_rgba(255,255,255,0.1)] dark:hover:bg-[#D1D5DB]">
          {isAnalyzing ? "Analyzing..." : "Analyze Syntax"}
        </button>

        <button
          onClick={handleClear}
          className="rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#374151] transition-all duration-300 hover:border-[#111827] hover:bg-[#F7F8FC] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#263042] dark:text-[#D1D5DB] dark:hover:border-[#D1D5DB] dark:hover:bg-[#151B2D]">
          Clear
        </button>

        <button
          type="button"
          onClick={() => { setShowReportForm((value) => !value); setReportStatus("") }}
          className="rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-600 transition-all duration-300 hover:bg-orange-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/40"
        >
          Report Error
        </button>
      </div>

      {showReportForm && (
        <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm transition-all duration-300 dark:border-orange-900 dark:bg-orange-950/30">
          <label className="block text-sm font-semibold text-orange-900 dark:text-orange-200">
            Describe what looks incorrect
            <textarea
              value={reportDescription}
              onChange={(event) => { setReportDescription(event.target.value); setReportStatus("") }}
              placeholder="Tell us what should be corrected..."
              className="mt-2 h-24 w-full resize-none rounded-xl border border-orange-200 bg-white p-3 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 dark:border-orange-900 dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF]"
            />
          </label>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleReport}
              disabled={reportStatus === "Sending..."}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 transition-all duration-300 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {errorMessage}
        </div>
      )}
    </section>
  )
}
