import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ResultTabs from "./ResultTabs"

const analysis = {
  sentence: "I am thirsty.",
  raw_model_output: "(S (NP (PRO I)) (VP (V am) (AdjP (Adj thirsty))))",
  s_expression: "(S (NP (PRO I)) (VP (V am) (AdjP (Adj thirsty))))",
  output_modified: false,
  tree: {
    label: "S",
    children: [
      { label: "NP", children: [{ label: "PRO", children: [{ label: "I" }] }] },
      { label: "VP", children: [{ label: "V", children: [{ label: "am" }] }] }
    ]
  }
}

describe("ResultTabs developer output", () => {
  it("does not expose the model output control to regular users", () => {
    render(<ResultTabs analysis={analysis} />)

    expect(screen.queryByRole("button", { name: /developer output/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/S-expression/i)).not.toBeInTheDocument()
  })

  it("shows the developer output control when explicitly enabled", () => {
    render(<ResultTabs analysis={analysis} showDeveloperOutput />)

    expect(screen.getByRole("button", { name: "Show developer output" })).toBeInTheDocument()
  })

  it("shows raw and final values separately with modification status", async () => {
    const view = render(<ResultTabs analysis={analysis} showDeveloperOutput />)
    fireEvent.click(within(view.container).getByRole("button", { name: "Show developer output" }))

    expect(screen.getByText("Raw model output (unchanged)")).toBeInTheDocument()
    expect(screen.getByText("Final S-expression used by the system")).toBeInTheDocument()
    expect(screen.getByText("No backend repair")).toBeInTheDocument()

    view.rerender(
      <ResultTabs
        analysis={{ ...analysis, s_expression: `${analysis.s_expression})`, output_modified: true }}
        showDeveloperOutput
      />
    )
    expect(screen.getByText("Backend repair applied")).toBeInTheDocument()
  })
})
