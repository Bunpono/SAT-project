const steps = [
  {
    title: "Enter an English sentence",
    description:
      "Type or paste the sentence you want to examine into the Input Sentence box."
  },
  {
    title: "Click Analyze Syntax",
    description:
      "Select Analyze Syntax and wait briefly while the sentence is processed."
  },
  {
    title: "View the analysis",
    description:
      "Read the S-expression in Analysis Results, then explore the syntax tree below it."
  },
  {
    title: "Explore the tree",
    description:
      "Click a tree node to highlight the word or phrase connected to that part of the sentence."
  },
  {
    title: "Review previous results",
    description:
      "Open Analysis History to revisit results saved in your current browser."
  }
]

export default function HowToUse() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8 dark:bg-slate-900">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          User Guide
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">
          How to use the Syntactic Analysis Tool
        </h2>
        <p className="mt-2 text-gray-500 dark:text-slate-400">
          Follow these steps to turn an English sentence into an interactive
          syntax tree. No technical knowledge is required.
        </p>
      </div>

      <ol className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-gray-600 dark:border-blue-900 dark:bg-blue-950/40 dark:text-slate-300">
        <span className="font-semibold text-gray-900 dark:text-slate-100">Tip:</span> Start with a
        short, complete sentence such as “I love a dog.” for the clearest
        result.
      </div>
    </section>
  )
}
