export default function TreePanel({ analysis }) {
  return (
    <section className="grid grid-cols-[360px_1fr] gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Production Rules</h2>

        <div className="mt-5 space-y-3">
          {["S → NP VP", "NP → Det N | PRO | N", "VP → Vgp NP | Vgp PP", "PP → P NP"].map(
            (rule) => (
              <div key={rule} className="rounded-md bg-gray-100 px-4 py-2 text-sm">
                {rule}
              </div>
            )
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Tree Diagram</h2>

        <div className="mt-5 rounded-xl border bg-gray-50 p-6">
          <pre className="h-72 overflow-auto rounded-xl border bg-white p-4 text-xs text-gray-700">
            {analysis?.tree
              ? JSON.stringify(analysis.tree, null, 2)
              : "Tree JSON will appear here."}
          </pre>
        </div>

        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-gray-500">
          💡 Tip: Click on any node in the tree to highlight the corresponding word(s).
        </div>
      </div>
    </section>
  )
}