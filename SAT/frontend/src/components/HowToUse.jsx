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
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-8 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          User Guide
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#111827] transition-colors duration-300 dark:text-white">
          How to use the Syntactic Analysis Tool
        </h2>
        <p className="mt-2 text-[#6B7280] transition-colors duration-300 dark:text-[#D1D5DB]">
          Follow these steps to turn an English sentence into an interactive
          syntax tree. No technical knowledge is required.
        </p>
      </div>

      <ol className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-5 transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111827] text-sm font-semibold text-white transition-colors duration-300 dark:bg-white dark:text-[#111827]">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-[#111827] transition-colors duration-300 dark:text-white">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#374151] transition-colors duration-300 dark:text-[#D1D5DB]">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-[#374151] transition-all duration-300 dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
        <span className="font-semibold text-[#111827] dark:text-white">Tip:</span> Start with a
        short, complete sentence such as “I love a dog.” for the clearest
        result.
      </div>
    </section>
  )
}
