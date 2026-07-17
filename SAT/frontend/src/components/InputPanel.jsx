import { useEffect, useMemo, useState } from "react"
import { analyzeSentence, submitErrorReport } from "../services/api"
import { validateSentenceInput } from "../utils/sentenceValidation"

const DEFAULT_SENTENCE = "She is talking about her dog."
const EXAMPLE_SENTENCES = {
  simple: "The boy is reading a book.",
  compound: "I like tea and she likes coffee.",
  complex: "The woman who wears a red skirt looks graceful."
}
const MAX_SENTENCE_LENGTH = 300
const LOADING_STEPS = [
  "Parsing sentence...",
  "Generating syntax tree...",
  "Preparing visualization..."
]

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

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 9v4m0 4h.01M10.3 4.6 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default function InputPanel({
  analysis,
  onAnalyzeComplete,
  initialSentence = DEFAULT_SENTENCE,
  canReport = false
}) {
  const [sentence, setSentence] = useState(initialSentence)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingStep, setLoadingStep] = useState(LOADING_STEPS[0])
  const [errorMessage, setErrorMessage] = useState("")
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportDescription, setReportDescription] = useState("")
  const [reportStatus, setReportStatus] = useState("")
  const validation = useMemo(() => validateSentenceInput(sentence), [sentence])
  const guidanceMessage = !validation.isEmpty ? validation.errors[0] : ""
  const canAnalyze = validation.canAnalyze && !isAnalyzing

  useEffect(() => {
    if (!isAnalyzing) {
      return undefined
    }

    let stepIndex = 0
    const timer = window.setInterval(() => {
      stepIndex = (stepIndex + 1) % LOADING_STEPS.length
      setLoadingStep(LOADING_STEPS[stepIndex])
    }, 850)

    return () => window.clearInterval(timer)
  }, [isAnalyzing])

  const handleAnalyze = async () => {
    if (isAnalyzing) return

    if (!validation.canAnalyze) {
      setErrorMessage(
        validation.errors[0] ||
          "Please enter a supported English declarative sentence before analyzing."
      )
      return
    }

    setIsAnalyzing(true)
    setLoadingStep(LOADING_STEPS[0])
    setErrorMessage("")

    try {
      const result = await analyzeSentence(validation.normalizedInput)
      onAnalyzeComplete(result)
    } catch (error) {
      console.error("Unable to analyze the sentence:", error)
      setErrorMessage(
        error.message ||
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

  const handleExampleSelect = (event) => {
    const nextSentence = EXAMPLE_SENTENCES[event.target.value]
    if (!nextSentence) return

    setSentence(nextSentence)
    setErrorMessage("")
  }

  const handleUseSuggestion = () => {
    if (!validation.suggestion) return
    setSentence(validation.suggestion)
    setErrorMessage("")
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
    <section className="min-w-0 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB]/80 transition-all duration-300 sm:p-7 dark:border-[#263042] dark:bg-[#111827] dark:ring-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <h2 className="text-xl font-medium text-[#111827] transition-colors duration-300 dark:text-white">Input Sentence</h2>

      <label className="mt-5 block text-base font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
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
        className="mt-2 h-40 w-full min-w-0 resize-none rounded-xl border border-transparent bg-[#F3F3F5] p-4 leading-7 text-[#111827] outline-none transition-all duration-300 placeholder:text-[#6B7280] focus:border-[#111827]/20 focus:bg-white focus:ring-4 focus:ring-[#111827]/10 sm:p-5 dark:bg-[#151B2D] dark:text-white dark:placeholder:text-[#9CA3AF] dark:focus:border-white/20 dark:focus:bg-[#0B1120] dark:focus:ring-white/15"
      />

      <div className="mt-2 flex flex-col gap-2 text-base sm:flex-row sm:items-center sm:justify-between">
        <p className={`font-medium transition-colors duration-300 ${
          sentence.length > MAX_SENTENCE_LENGTH ? "text-red-600 dark:text-red-300" : "text-[#6B7280] dark:text-[#9CA3AF]"
        }`}>
          {sentence.length} / {MAX_SENTENCE_LENGTH}
        </p>
        <p className="font-semibold text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
          Detected sentence type:{" "}
          <span className="text-[#111827] dark:text-white">{validation.sentenceType}</span>
        </p>
      </div>
      <p className="mt-3 text-sm leading-5 text-[#6B7280] dark:text-[#9CA3AF]">
        Submitted sentences and analysis results may be stored for system evaluation and administrator review. Sign in to save and view your history.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D]">
          <h3 className="text-base font-bold text-[#111827] transition-colors duration-300 dark:text-white">
            Supported Input
          </h3>
          <div className="mt-3 grid gap-2 text-base font-medium text-[#374151] transition-colors duration-300 sm:grid-cols-3 dark:text-[#D1D5DB]">
            <p>English language</p>
            <p>Declarative sentences only</p>
            <p>Simple, Compound and Complex</p>
          </div>
        </div>

        <select
          value=""
          onChange={handleExampleSelect}
          aria-label="Choose an example sentence"
          className="min-h-12 w-full min-w-0 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base font-bold text-[#111827] outline-none transition-all duration-300 hover:bg-[#F7F8FC] focus:ring-4 focus:ring-[#111827]/10 lg:w-auto dark:border-[#263042] dark:bg-[#111827] dark:text-[#D1D5DB] dark:hover:bg-[#151B2D] dark:focus:ring-white/15"
        >
          <option value="">Example sentences</option>
          <option value="simple">Simple: The boy is reading a book.</option>
          <option value="compound">Compound: I like tea and she likes coffee.</option>
          <option value="complex">Complex: The woman who wears a red skirt looks graceful.</option>
        </select>
      </div>

      {(guidanceMessage || validation.warnings.length > 0 || validation.suggestion) && (
        <div className="mt-4 space-y-3" aria-live="polite">
          {guidanceMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-700 transition-all duration-300 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {guidanceMessage}
            </div>
          )}

          {validation.warnings.map((warning) => (
            <div
              key={warning}
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-medium text-amber-800 transition-all duration-300 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
            >
              {warning}
            </div>
          ))}

          {validation.suggestion && (
            <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base transition-all duration-300 sm:flex-row sm:items-center sm:justify-between dark:border-[#263042] dark:bg-[#0B1120]">
              <p className="font-medium text-[#374151] dark:text-[#D1D5DB]">
                Did you mean:{" "}
                <span className="font-bold text-[#111827] dark:text-white">
                  "{validation.suggestion}"
                </span>
              </p>
              <button
                type="button"
                onClick={handleUseSuggestion}
                className="rounded-lg bg-[#111827] px-4 py-2 text-base font-bold text-white transition-all duration-300 hover:bg-[#374151] active:scale-[0.98] dark:bg-white dark:text-[#111827] dark:hover:bg-[#D1D5DB]"
              >
                Use suggestion
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            aria-busy={isAnalyzing}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#050816] px-5 py-3 text-base font-bold text-white shadow-[0_12px_28px_rgba(17,24,39,0.16)] transition-all duration-300 hover:bg-[#111827] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:opacity-50 sm:w-auto dark:bg-white dark:text-[#111827] dark:shadow-[0_12px_28px_rgba(255,255,255,0.1)] dark:hover:bg-[#D1D5DB]">
            <PlayIcon />
            {isAnalyzing ? loadingStep : "Analyze Syntax"}
          </button>

          <button
            onClick={handleClear}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-base font-bold text-[#111827] transition-all duration-300 hover:bg-[#F7F8FC] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-[#263042] dark:bg-[#111827] dark:text-[#D1D5DB] dark:hover:bg-[#151B2D]">
            <TrashIcon />
            Clear
          </button>

          {canReport && <button
            type="button"
            onClick={() => { setShowReportForm((value) => !value); setReportStatus("") }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3 text-base font-bold text-orange-600 transition-all duration-300 hover:bg-orange-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-orange-800 dark:bg-[#111827] dark:text-orange-300 dark:hover:bg-orange-950/40"
          >
            <AlertIcon />
            Report Error
          </button>}
        </div>

        <label className="flex w-full min-w-0 flex-col gap-2 text-base font-bold text-[#111827] transition-colors duration-300 sm:flex-row sm:items-center lg:w-auto dark:text-white">
          Visualization:
          <select
            defaultValue="tree"
            className="min-h-12 w-full min-w-0 rounded-xl border border-transparent bg-[#F3F3F5] px-4 py-3 font-medium text-[#111827] outline-none transition-all duration-300 focus:ring-4 focus:ring-[#111827]/10 sm:min-w-52 dark:bg-[#151B2D] dark:text-[#D1D5DB] dark:focus:ring-white/15"
          >
            <option value="tree">Tree Diagram</option>
          </select>
        </label>
      </div>

      {canReport && showReportForm && (
        <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm transition-all duration-300 dark:border-orange-900 dark:bg-orange-950/30">
          <label className="block text-base font-semibold text-orange-900 dark:text-orange-200">
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
              className="rounded-xl bg-orange-500 px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Report
            </button>
            {reportStatus && <p className="text-base text-orange-800 dark:text-orange-200">{reportStatus}</p>}
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700 transition-all duration-300 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {errorMessage}
        </div>
      )}
    </section>
  )
}
