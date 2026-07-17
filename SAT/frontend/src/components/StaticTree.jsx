import { useEffect, useRef, useState } from "react"
import { hierarchy, tree } from "d3-hierarchy"
import { prepareTreeForDisplay } from "../utils/treeRules"

export default function StaticTree({ data, selectedWords = [], onSelectWords, svgRef }) {
  const viewportRef = useRef(null)
  const dragRef = useRef(null)
  const ignoreClickRef = useRef(false)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [transform, setTransform] = useState(null)

  const preparedTree = prepareTreeForDisplay(data || { name: "ROOT" })

  const NODE_W = 96
  const NODE_H = 48
  const LEVEL_H = 95
  const NODE_GAP = 150
  const PADDING_X = 90
  const PADDING_Y = 70

  function cleanWord(word) {
    return String(word || "").replace(/[.,!?]/g, "").toLowerCase()
  }

  function isTerminalPair(node) {
    return (
      node.children &&
      node.children.length === 1 &&
      (!node.children[0].children || node.children[0].children.length === 0)
    )
  }

  function getWordsFromNode(node) {
    if (isTerminalPair(node)) return [cleanWord(node.children[0].name)]

    if (!node.children || node.children.length === 0) {
      if (isGrammarLabel(node.name)) return []
      return [cleanWord(node.name)]
    }

    return node.children.flatMap(getWordsFromNode).filter(Boolean)
  }

  function countLeaves(node) {
    if (isTerminalPair(node)) return 1
    if (!node.children || node.children.length === 0) return 1
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0)
  }

  function getDepth(node) {
    if (isTerminalPair(node)) return 1
    if (!node.children || node.children.length === 0) return 1
    return 1 + Math.max(...node.children.map(getDepth))
  }

function getNodeStyle(node, depth) {
  if (["S", "S1", "S2", "ROOT"].includes(node.name)) {
    return { fill: "#dcecf7", stroke: "#94a3b8" }
  }

  if (["COORD", "CONJ"].includes(node.name)) {
    return { fill: "#fff4bf", stroke: "#c9b65d" }
  }

  if (node.branch === "np") {
    if (depth <= 2) return { fill: "#b7daf5", stroke: "#8fa8bd" }
    return { fill: "#8ec5f0", stroke: "#7aa6d9" }
  }

  if (node.branch === "vp") {
    if (depth <= 2) return { fill: "#c8e6c9", stroke: "#8fae94" }
    return { fill: "#a8ddb5", stroke: "#83b78f" }
  }

  return { fill: "#f8fafc", stroke: "#cbd5e1" }
}

  const leafCount = countLeaves(preparedTree)
  const depth = getDepth(preparedTree)

  const svgWidth = Math.max(1000, leafCount * NODE_GAP + PADDING_X * 2)
  const svgHeight = Math.max(440, depth * LEVEL_H + PADDING_Y * 2)

  const root = hierarchy(preparedTree, (node) => {
    if (isTerminalPair(node)) return null
    return node.children || null
  })

  const layout = tree()
    .size([svgWidth - PADDING_X * 2, svgHeight - PADDING_Y * 2])
    .separation((a, b) => {
      return a.parent === b.parent ? 1.15 : 1.45
    })

  const treeRoot = layout(root)

  const nodes = treeRoot.descendants()
  const links = treeRoot.links()

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return undefined

    const updateViewport = () => {
      setViewport({ width: element.clientWidth, height: element.clientHeight })
    }

    updateViewport()
    const observer = new ResizeObserver(updateViewport)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const fitPadding = 24
  const fitScale = viewport.width && viewport.height
    ? Math.min(
      (viewport.width - fitPadding * 2) / svgWidth,
      (viewport.height - fitPadding * 2) / svgHeight,
      1
    )
    : 1
  const initialTransform = {
    x: Math.max(fitPadding, (viewport.width - svgWidth * fitScale) / 2),
    y: Math.max(fitPadding, (viewport.height - svgHeight * fitScale) / 2),
    scale: fitScale
  }
  const activeTransform = transform || initialTransform

  const handleWheel = (event) => {
    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = event.clientX - bounds.left
    const pointerY = event.clientY - bounds.top
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.89

    setTransform((current) => {
      const active = current || initialTransform
      const nextScale = Math.min(2.5, Math.max(0.35, active.scale * zoomFactor))
      const worldX = (pointerX - active.x) / active.scale
      const worldY = (pointerY - active.y) / active.scale

      return {
        x: pointerX - worldX * nextScale,
        y: pointerY - worldY * nextScale,
        scale: nextScale
      }
    })
  }

  const handlePointerDown = (event) => {
    if (event.button !== 0) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: activeTransform.x,
      originY: activeTransform.y,
      moved: false
    }
  }

  const handlePointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) drag.moved = true

    setTransform((current) => ({
      ...current,
      x: drag.originX + deltaX,
      y: drag.originY + deltaY
    }))
  }

  const handlePointerEnd = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (drag.moved) ignoreClickRef.current = true
    dragRef.current = null
  }

  if (!data) return null

  return (
    <div
      ref={viewportRef}
      className="h-[440px] w-full touch-none cursor-grab select-none sm:h-[520px] active:cursor-grabbing"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${Math.max(viewport.width, 1)} ${Math.max(viewport.height, 1)}`}
        className="block h-full w-full"
        role="img"
        aria-label="Interactive syntax tree. Scroll to zoom and drag to pan."
      >
      <g transform={`translate(${activeTransform.x}, ${activeTransform.y}) scale(${activeTransform.scale})`}>
      <g transform={`translate(${PADDING_X}, ${PADDING_Y})`}>
        {links.map((link, index) => {
          const sourceX = link.source.x
          const sourceY = link.source.y
          const targetX = link.target.x
          const targetY = link.target.y

          return (
            <line
              key={`line-${index}`}
              x1={sourceX}
              y1={sourceY + NODE_H / 2}
              x2={targetX}
              y2={targetY - NODE_H / 2}
              stroke="#9ca3af"
              strokeWidth="2"
            />
          )
        })}

        {nodes.map((item, index) => {
          const node = item.data
          const x = item.x
          const y = item.y
          const word = isTerminalPair(node) ? node.children[0].name : null
          const nodeWords = getWordsFromNode(node)

          const isSelected =
            nodeWords.length > 0 &&
            nodeWords.every((word) => selectedWords.includes(word))

          const style = getNodeStyle(node, item.depth)

          return (
            <g
              key={`node-${node.name}-${index}`}
              onClick={() => {
                if (ignoreClickRef.current) {
                  ignoreClickRef.current = false
                  return
                }
                if (nodeWords.length > 0) {
                  const same =
                    selectedWords.length === nodeWords.length &&
                    nodeWords.every((word) => selectedWords.includes(word))

                  onSelectWords(same ? [] : nodeWords)
                }
              }}
              className={nodeWords.length > 0 ? "cursor-pointer" : ""}
            >
              <rect
                x={x - NODE_W / 2}
                y={y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx="9"
                fill={isSelected ? "#fef3c7" : style.fill}
                stroke={isSelected ? "#facc15" : style.stroke}
                strokeWidth={isSelected ? "3" : "2"}
              />

              <text
                x={x}
                y={word ? y - 6 : y + 4}
                textAnchor="middle"
                fontSize="15"
                fontWeight="600"
                fill="#0f172a"
                className="select-none"
              >
                {node.name}
              </text>

              {word && (
                <text
                  x={x}
                  y={y + 14}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#0f172a"
                  className="select-none"
                >
                  {word}
                </text>
              )}

              {node.badge && (
                <g>
                  <rect
                    x={x - 34}
                    y={y + NODE_H / 2 + 8}
                    width="68"
                    height="22"
                    rx="11"
                    fill="#f8fafc"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={y + NODE_H / 2 + 23}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#475569"
                    className="select-none"
                  >
                    {node.badge}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </g>
      </g>
      </svg>
    </div>
  )
}

function isGrammarLabel(name) {
  return [
    "S", "S1", "S2", "ROOT",
    "NP", "VP", "PP", "Vgp",
    "AUX", "TENSE", "PRO",
    "Det", "N", "V", "Adj", "Adv", "AdvP", "AdjP",
    "Conj", "P",
    "[trans]", "[intrans]", "[linking]",
  ].includes(name)
}
