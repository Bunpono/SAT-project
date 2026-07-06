import { useState } from "react"
import { analyzeSentence } from "../services/api"

export default function InputPanel({ onAnalyzeComplete }) {
  const [sentence, setSentence] = useState("She is talking about her dog.")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

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
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500">
          {isAnalyzing ? "Analyzing..." : "Analyze Syntax"}
        </button>

        <button
          onClick={handleClear}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Clear
        </button>

        <button className="rounded-lg border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 active:scale-95 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/40">
          Report Error
        </button>
      </div>

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
