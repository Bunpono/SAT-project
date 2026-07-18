import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AdminDashboard from "./AdminDashboard"

vi.mock("../services/api", () => ({
  getAdminUsers: vi.fn().mockResolvedValue([
    { id: 7, name: "Mala", email: "mala@example.com", role: "user", created_at: "2026-07-18T08:00:00Z" }
  ]),
  getAdminHistory: vi.fn().mockResolvedValue([
    { id: 1, user_id: 7, sentence: "I love MALA.", sentence_type: "Simple", created_at: "2026-07-18T08:00:00Z", result: {} },
    { id: 2, user_id: null, sentence: "The cat sleeps.", sentence_type: "Simple", created_at: "2026-07-18T08:01:00Z", result: {} }
  ]),
  getAdminReports: vi.fn().mockResolvedValue([]),
  updateErrorReportStatus: vi.fn()
}))

describe("AdminDashboard", () => {
  it("shows the registered user's name and keeps guests labelled as Guest", async () => {
    render(<AdminDashboard />)
    fireEvent.click(await screen.findByRole("button", { name: "Analysis History" }))

    expect(await screen.findByText("Mala")).toBeInTheDocument()
    expect(screen.getByText("Guest")).toBeInTheDocument()
    expect(screen.getByText("mala@example.com")).toBeInTheDocument()
  })
})
