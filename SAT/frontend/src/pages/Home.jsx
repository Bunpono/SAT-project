import { useState } from "react"
import Header from "../components/Header"
import InputPanel from "../components/InputPanel"
import ResultTabs from "../components/ResultTabs"
import TreePanel from "../components/TreePanel"

export default function Home() {
  const [analysis, setAnalysis] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Header />

        <div className="mt-8">
          <InputPanel onAnalyzeComplete={setAnalysis} />
        </div>

        {analysis && (
          <>
            <div className="mt-6">
              <ResultTabs analysis={analysis} />
            </div>

            <div className="mt-6">
              <TreePanel analysis={analysis} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}