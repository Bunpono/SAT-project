import { hierarchy, tree } from "d3-hierarchy"

export default function StaticTree({ data, selectedWords = [], onSelectWords }) {
  if (!data) return null

  const preparedTree = addBranch(extractVgpBadges(normalizeTree(data)))

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

  return (
    <svg
      width="100%"
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="xMidYMin meet"
    >
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
    </svg>
  )
}

function normalizeTree(tree) {
  if (!tree) return null

  if (tree.name === "ROOT") {
    const children = tree.children || []
    const vpIndex = children.findIndex((child) => child.name === "VP")

    const beforeVP = vpIndex >= 0 ? children.slice(0, vpIndex) : children
    const afterVP = vpIndex >= 0 ? children.slice(vpIndex) : []

    const subject =
      beforeVP.length === 1 && beforeVP[0].name === "EN"
        ? {
            ...beforeVP[0],
            name: "NP",
            children: beforeVP[0].children || [],
          }
        : beforeVP.length > 0
          ? {
              name: "NP",
              children: beforeVP.map((child) =>
                child.name === "EN"
                  ? {
                      ...child,
                      name: "NP",
                      children: child.children || [],
                    }
                  : {
                      ...child,
                      children: child.children || [],
                    }
              ),
            }
          : null

    return {
      name: "S",
      children: [
        ...(subject ? [subject] : []),
        ...afterVP.map(normalizeTree),
      ],
    }
  }

  if (tree.name === "EN") {
    return {
      ...tree,
      name: "NP",
      children: (tree.children || []).map(normalizeTree),
    }
  }

  return {
    ...tree,
    children: tree.children ? tree.children.map(normalizeTree) : undefined,
  }
}

function extractVgpBadges(node) {
  if (!node) return null

  const children = node.children || []
  const badgeChild = children.find((child) =>
    ["[trans]", "[intrans]", "[linking]"].includes(child.name)
  )

  const filteredChildren = children.filter(
    (child) => !["[trans]", "[intrans]", "[linking]"].includes(child.name)
  )

  return {
    ...node,
    badge: node.name === "Vgp" && badgeChild ? badgeChild.name : node.badge,
    children: filteredChildren.length
      ? filteredChildren.map(extractVgpBadges)
      : undefined,
  }
}

function addBranch(node, branch = null) {
  if (!node) return null

  let nextBranch = branch
  if (node.name === "NP") nextBranch = "np"
  if (node.name === "VP") nextBranch = "vp"

  return {
    ...node,
    branch: nextBranch,
    children: node.children
      ? node.children.map((child) => addBranch(child, nextBranch))
      : undefined,
  }
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