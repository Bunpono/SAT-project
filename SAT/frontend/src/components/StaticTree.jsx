import { useEffect, useRef, useState } from "react"
import { hierarchy, tree } from "d3-hierarchy"
import { prepareTreeForDisplay } from "../utils/treeRules"

export default function StaticTree({ data, selectedWords = [], onSelectWords, svgRef, isFullscreen = false }) {
  const viewportRef = useRef(null)
  const pointersRef = useRef(new Map())
  const gestureRef = useRef(null)
  const ignoreClickRef = useRef(false)
  const activeTransformRef = useRef({ x: 24, y: 24, scale: 1 })
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [transform, setTransform] = useState(null)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [isInteractionActive, setIsInteractionActive] = useState(false)
  const needsActivation = !isFullscreen && (
    isCoarsePointer || (viewport.width > 0 && viewport.width < 640)
  )
  const interactionEnabled = !needsActivation || isInteractionActive

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

  const fitPadding = 24
  const calculatedFitScale = viewport.width && viewport.height
    ? Math.min(
      (viewport.width - fitPadding * 2) / svgWidth,
      (viewport.height - fitPadding * 2) / svgHeight,
      1
    )
    : 1
  const fitScale = viewport.width > 0 && viewport.width < 640
    ? Math.max(calculatedFitScale, 0.48)
    : calculatedFitScale
  const initialTransform = {
    x: Math.max(fitPadding, (viewport.width - svgWidth * fitScale) / 2),
    y: Math.max(fitPadding, (viewport.height - svgHeight * fitScale) / 2),
    scale: fitScale
  }
  const activeTransform = transform || initialTransform

  useEffect(() => {
    activeTransformRef.current = activeTransform
  }, [activeTransform])

  useEffect(() => {
    const primaryTouch = window.matchMedia("(pointer: coarse)")
    const updatePointerType = () => setIsCoarsePointer(primaryTouch.matches)
    updatePointerType()
    primaryTouch.addEventListener("change", updatePointerType)
    return () => primaryTouch.removeEventListener("change", updatePointerType)
  }, [])

  const commitTransform = (nextTransform) => {
    activeTransformRef.current = nextTransform
    setTransform(nextTransform)
  }

  const zoomAt = (factor, pointerX = viewport.width / 2, pointerY = viewport.height / 2) => {
    const active = activeTransformRef.current
    const nextScale = Math.min(3.5, Math.max(0.25, active.scale * factor))
    const worldX = (pointerX - active.x) / active.scale
    const worldY = (pointerY - active.y) / active.scale

    commitTransform({
      x: pointerX - worldX * nextScale,
      y: pointerY - worldY * nextScale,
      scale: nextScale
    })
  }

  const resetView = () => {
    activeTransformRef.current = initialTransform
    setTransform(null)
  }

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return undefined

    const updateViewport = () => {
      setViewport({ width: element.clientWidth, height: element.clientHeight })
    }

    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return

      event.preventDefault()
      event.stopPropagation()

      const bounds = element.getBoundingClientRect()
      const pointerX = event.clientX - bounds.left
      const pointerY = event.clientY - bounds.top
      const active = activeTransformRef.current
      const zoomFactor = event.deltaY < 0 ? 1.12 : 0.89
      const nextScale = Math.min(3.5, Math.max(0.25, active.scale * zoomFactor))
      const worldX = (pointerX - active.x) / active.scale
      const worldY = (pointerY - active.y) / active.scale
      const nextTransform = {
        x: pointerX - worldX * nextScale,
        y: pointerY - worldY * nextScale,
        scale: nextScale
      }
      activeTransformRef.current = nextTransform
      setTransform(nextTransform)
    }

    updateViewport()
    const observer = new ResizeObserver(updateViewport)
    observer.observe(element)
    element.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      observer.disconnect()
      element.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const handlePointerDown = (event) => {
    if (!interactionEnabled) return
    if (event.pointerType === "mouse" && event.button !== 0) return

    event.currentTarget.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    })

    const pointers = [...pointersRef.current.values()]
    if (pointers.length === 1) {
      const active = activeTransformRef.current
      gestureRef.current = {
        type: "pan",
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: active.x,
        originY: active.y,
        moved: false
      }
      return
    }

    if (pointers.length === 2) {
      const [first, second] = pointers
      const bounds = event.currentTarget.getBoundingClientRect()
      const centerX = (first.x + second.x) / 2 - bounds.left
      const centerY = (first.y + second.y) / 2 - bounds.top
      const active = activeTransformRef.current
      gestureRef.current = {
        type: "pinch",
        startDistance: Math.hypot(second.x - first.x, second.y - first.y),
        startScale: active.scale,
        worldX: (centerX - active.x) / active.scale,
        worldY: (centerY - active.y) / active.scale,
        moved: false
      }
    }
  }

  const handlePointerMove = (event) => {
    if (!interactionEnabled) return
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    })

    const gesture = gestureRef.current
    const pointers = [...pointersRef.current.values()]
    if (!gesture) return

    if (gesture.type === "pinch" && pointers.length >= 2) {
      const [first, second] = pointers
      const bounds = event.currentTarget.getBoundingClientRect()
      const centerX = (first.x + second.x) / 2 - bounds.left
      const centerY = (first.y + second.y) / 2 - bounds.top
      const distance = Math.hypot(second.x - first.x, second.y - first.y)
      const nextScale = Math.min(3.5, Math.max(0.25, gesture.startScale * (distance / Math.max(gesture.startDistance, 1))))
      gesture.moved = true
      ignoreClickRef.current = true
      commitTransform({
        x: centerX - gesture.worldX * nextScale,
        y: centerY - gesture.worldY * nextScale,
        scale: nextScale
      })
      return
    }

    if (gesture.type === "pan" && gesture.pointerId === event.pointerId) {
      const deltaX = event.clientX - gesture.startX
      const deltaY = event.clientY - gesture.startY
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        gesture.moved = true
        ignoreClickRef.current = true
      }
      commitTransform({
        ...activeTransformRef.current,
        x: gesture.originX + deltaX,
        y: gesture.originY + deltaY
      })
    }
  }

  const handlePointerEnd = (event) => {
    if (!interactionEnabled) return
    if (!pointersRef.current.has(event.pointerId)) return
    const moved = gestureRef.current?.moved
    pointersRef.current.delete(event.pointerId)

    const remaining = [...pointersRef.current.values()]
    if (remaining.length === 1) {
      const pointer = remaining[0]
      const active = activeTransformRef.current
      gestureRef.current = {
        type: "pan",
        pointerId: pointer.id,
        startX: pointer.x,
        startY: pointer.y,
        originX: active.x,
        originY: active.y,
        moved: false
      }
    } else if (remaining.length === 0) {
      gestureRef.current = null
    }

    if (moved) {
      window.setTimeout(() => { ignoreClickRef.current = false }, 0)
    }
  }

  if (!data) return null

  return (
    <div className="relative">
      {interactionEnabled && (
        <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-xl border border-[#E5E7EB] bg-white/95 p-1 shadow-md backdrop-blur dark:border-[#263042] dark:bg-[#111827]/95">
          <button type="button" onClick={() => zoomAt(1.25)} aria-label="Zoom in" title="Zoom in" className="flex h-10 w-10 items-center justify-center rounded-lg text-xl font-semibold text-[#111827] hover:bg-[#F3F3F5] dark:text-white dark:hover:bg-[#263042]">+</button>
          <button type="button" onClick={() => zoomAt(0.8)} aria-label="Zoom out" title="Zoom out" className="flex h-10 w-10 items-center justify-center rounded-lg text-xl font-semibold text-[#111827] hover:bg-[#F3F3F5] dark:text-white dark:hover:bg-[#263042]">−</button>
          <button type="button" onClick={resetView} aria-label="Reset tree view" title="Reset view" className="flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-xs font-bold text-[#111827] hover:bg-[#F3F3F5] dark:text-white dark:hover:bg-[#263042]">Reset</button>
        </div>
      )}

      {needsActivation && !isInteractionActive && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/15 dark:bg-[#050816]/10">
          <button
            type="button"
            onClick={() => setIsInteractionActive(true)}
            className="pointer-events-auto flex min-h-16 items-center gap-3 rounded-2xl border-2 border-blue-500 bg-white/95 px-5 py-3 text-left text-[#111827] shadow-[0_14px_35px_rgba(37,99,235,0.25)] backdrop-blur transition-all duration-200 active:scale-[0.97] dark:bg-[#111827]/95 dark:text-white"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10" />
                <path d="M11 10V4.5a1.5 1.5 0 0 1 3 0V10" />
                <path d="M14 10V6a1.5 1.5 0 0 1 3 0v6" />
                <path d="M8 9.5a1.5 1.5 0 0 0-3 0V13c0 4.4 2.7 7 7 7h1c4.4 0 7-2.6 7-7v-2a1.5 1.5 0 0 0-3 0" />
              </svg>
            </span>
            <span>
              <span className="block text-base font-bold">Explore tree</span>
              <span className="mt-0.5 block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Interactive canvas · tap to activate</span>
            </span>
          </button>
        </div>
      )}

      {needsActivation && isInteractionActive && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50/95 p-1.5 pl-3 text-xs font-bold text-blue-800 shadow-md backdrop-blur dark:border-blue-700 dark:bg-blue-950/90 dark:text-blue-200">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Interactive mode</span>
          <button
            type="button"
            onClick={() => setIsInteractionActive(false)}
            className="min-h-9 rounded-lg bg-blue-600 px-3 text-sm font-bold text-white active:scale-[0.97] dark:bg-blue-500"
          >
            Done
          </button>
        </div>
      )}
      <div
        ref={viewportRef}
        className={`${isFullscreen ? "h-[calc(100dvh-9rem)]" : "h-[380px] sm:h-[500px] lg:h-[clamp(560px,62vh,680px)]"} ${interactionEnabled ? "touch-none cursor-grab overscroll-contain active:cursor-grabbing" : "touch-pan-y cursor-default"} w-full select-none`}
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
        aria-label={interactionEnabled ? "Interactive syntax tree. Drag to pan and use Control or Command plus wheel to zoom." : "Syntax tree preview. Activate Explore tree to interact."}
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
