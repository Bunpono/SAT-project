import Header from "../components/Header"
import InputPanel from "../components/InputPanel"
import ResultTabs from "../components/ResultTabs"
import TreePanel from "../components/TreePanel"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-10 py-8">
      <div className="mx-auto max-w-7xl">
        <Header />

        <div className="mt-8">
          <InputPanel />
        </div>

        <div className="mt-6">
          <ResultTabs />
        </div>

        <div className="mt-6">
          <TreePanel />
        </div>
      </div>
    </div>
  )
}