export default function InputPanel() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Input Sentence</h2>

      <label className="mt-5 block text-sm font-semibold text-gray-700">
        Enter or Paste English Sentence Here
      </label>

      <textarea
        className="mt-2 h-32 w-full resize-none rounded-xl bg-gray-100 p-4 outline-none focus:ring-2 focus:ring-slate-900"
        defaultValue="I love a dog."
      />

      <div className="mt-4 flex gap-3">
        <button className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
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