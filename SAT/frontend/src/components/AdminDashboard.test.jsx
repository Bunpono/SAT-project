import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import AdminDashboard from "./AdminDashboard"

vi.mock("../services/api", () => ({
  getAdminUsers: vi.fn().mockResolvedValue([
    { id: 7, name: "Mala", email: "mala@example.com", role: "user", created_at: "2026-07-18T08:00:00Z" }
  ]),
  getAdminHistory: vi.fn().mockResolvedValue([
    {
      id: 1,
      user_id: 7,
      sentence: "I love MALA.",
      sentence_type: "Simple",
      created_at: "2026-07-18T08:00:00Z",
      result: {
        s_expression: "(S (NP I) (VP love MALA))",
        tree: { name: "S", children: [{ name: "NP", children: [{ name: "I" }] }] }
      }
    },
    { id: 2, user_id: null, sentence: "The cat sleeps.", sentence_type: "Simple", created_at: "2026-07-18T08:01:00Z", result: {} }
  ]),
  getAdminReports: vi.fn().mockResolvedValue([
    {
      id: 9,
      user_id: 7,
      sentence: "I love MALA.",
      description: "The VP branch is incorrect.",
      status: "open",
      created_at: "2026-07-18T08:02:00Z",
      analysis_result: {
        report_type: "tree_diagram",
        s_expression: "(S (NP I) (VP love MALA))",
        tree: { name: "S", children: [{ name: "VP", children: [{ name: "love" }] }] }
      },
      user: { id: 7, name: "Mala", email: "mala@example.com" }
    }
  ]),
  updateErrorReportStatus: vi.fn()
}))

beforeAll(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })))
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  })
})

afterEach(() => cleanup())

describe("AdminDashboard", () => {
  it("shows the registered user's name and keeps guests labelled as Guest", async () => {
    render(<AdminDashboard />)
    fireEvent.click(await screen.findByRole("button", { name: "Analysis History" }))

    expect(await screen.findByText("Mala")).toBeInTheDocument()
    expect(screen.getByText("Guest")).toBeInTheDocument()
    expect(screen.getByText("mala@example.com")).toBeInTheDocument()
  })

  it("opens a tree diagram instead of raw JSON from View Result", async () => {
    render(<AdminDashboard />)
    fireEvent.click(await screen.findByRole("button", { name: "Analysis History" }))
    fireEvent.click((await screen.findAllByRole("button", { name: "View Result" }))[0])

    expect(await screen.findByRole("heading", { name: "Tree Diagram" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Full screen" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save PNG" })).toBeInTheDocument()
    expect(screen.queryByText(/"s_expression"/)).not.toBeInTheDocument()
  })

  it("shows a report category and opens the reported tree", async () => {
    render(<AdminDashboard />)
    fireEvent.click(await screen.findByRole("button", { name: "Error Reports" }))

    expect(await screen.findByText("Tree diagram")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "View reported result" }))
    expect(await screen.findByRole("heading", { name: "Tree Diagram" })).toBeInTheDocument()
  })
})
