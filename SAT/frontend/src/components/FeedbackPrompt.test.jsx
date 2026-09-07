import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import FeedbackPrompt, { FEEDBACK_FORM_URL } from "./FeedbackPrompt"

describe("FeedbackPrompt", () => {
  it("links to the public feedback form in a new tab", () => {
    render(<FeedbackPrompt />)

    const link = screen.getByRole("link", { name: /ประเมินระบบหลังทดลองใช้/ })
    expect(link).toHaveAttribute("href", FEEDBACK_FORM_URL)
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"))
  })
})
