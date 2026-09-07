import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ResultTabs from "./ResultTabs"

const analysis = {
  sentence: "I am thirsty.",
  s_expression: "(S (NP (PRO I)) (VP (V am) (AdjP (Adj thirsty))))",
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
})
