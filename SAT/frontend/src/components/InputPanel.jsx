export default function InputPanel() {

  const [sentence, setSentence] =
    useState("I love a dog.")

  const handleAnalyze = async () => {

    const result =
      await analyzeSentence(sentence)

    console.log(result)
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Input Sentence</h2>

      <label className="mt-5 block text-sm font-semibold text-gray-700">
        Enter or Paste English Sentence Here
      </label>

      <textarea
        value={sentence}
        onChange={(e) =>
          setSentence(e.target.value)
        }
        className="mt-2 h-32 w-full resize-none rounded-xl bg-gray-100 p-4 outline-none"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleAnalyze}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-white"
        >
          Analyze Syntax
        </button>

        <button className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-700">
          Clear
        </button>

        <button className="rounded-lg border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-500">
          Report Error
        </button>
      </div>
    </section>
  )
}

import { useState } from "react"
import { analyzeSentence } from "../services/api"