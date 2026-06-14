export default function ResultTabs() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {["POS Analysis", "Phrase Analysis", "Clause Analysis", "Sentence Type"].map(
          (item, index) => (
            <div
              key={item}
              className={`rounded-xl border p-4 ${
                index === 0 ? "bg-slate-950 text-white" : "bg-white text-gray-800"
              }`}
            >
              <p className="font-semibold">{item}</p>
              <p className="mt-1 text-sm opacity-70">
                {index === 0 && "Part of Speech Tags"}
                {index === 1 && "Noun / Verb Phrases"}
                {index === 2 && "Main & Sub Clauses"}
                {index === 3 && "Simple / Compound / Complex"}
              </p>
            </div>
          )
        )}
      </div>

      <div className="mt-4 rounded-xl border bg-blue-50 p-4">
        <span className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white">
          POS Analysis
        </span>

        <div className="mt-4 flex gap-2">
          {[
            ["I", "PRO"],
            ["love", "V"],
            ["a", "Det"],
            ["dog.", "N"],
          ].map(([word, tag]) => (
            <div key={word} className="rounded-lg border bg-white px-4 py-2 text-center">
              <div>{word}</div>
              <div className="text-xs text-gray-500">{tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}