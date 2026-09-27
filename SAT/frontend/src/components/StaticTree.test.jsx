import { fireEvent, render } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import StaticTree from "./StaticTree"

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    disconnect() {}
  }

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })

  HTMLElement.prototype.setPointerCapture = vi.fn()
  HTMLElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(false)
})

describe("StaticTree multiword terminals", () => {
  it("renders legacy split V leaves as one V box", () => {
    const data = {
      name: "S",
      children: [
        {
          name: "VP",
          children: [
            {
              name: "V",
              children: [
                { name: "hope" },
                { name: "to" },
                { name: "hear" }
              ]
            }
          ]
        }
      ]
    }

    const onSelectWords = vi.fn()
    const { container } = render(
      <StaticTree data={data} selectedWords={[]} onSelectWords={onSelectWords} />
    )

    expect(container.querySelectorAll("rect")).toHaveLength(3)
    expect(container.querySelectorAll("line")).toHaveLength(2)
    expect(container.querySelector("svg")).toHaveTextContent("Vhopetohear")

    const verbLabel = [...container.querySelectorAll("text")]
      .find((element) => element.textContent === "V")
    const verbNode = verbLabel.closest("g")
    const verbBox = verbNode.querySelector("rect")

    expect(Number(verbBox.getAttribute("height"))).toBeGreaterThan(48)

    const viewport = container.querySelector("svg").parentElement
    HTMLElement.prototype.setPointerCapture.mockClear()
    fireEvent.pointerDown(verbNode, { pointerId: 1, pointerType: "mouse", button: 0 })
    fireEvent.pointerUp(viewport, { pointerId: 1, pointerType: "mouse", button: 0 })
    fireEvent.click(verbNode)

    expect(HTMLElement.prototype.setPointerCapture).not.toHaveBeenCalled()
    expect(onSelectWords).toHaveBeenCalledWith(["hope", "to", "hear"])
  })
})
