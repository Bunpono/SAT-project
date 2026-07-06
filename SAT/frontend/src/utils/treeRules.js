function childrenOf(node) {
  return Array.isArray(node?.children) ? node.children : []
}

const GRAMMATICAL_FEATURE_LABELS = new Set([
  "TENSE",
  "ASPECT",
  "MOOD",
  "VOICE",
  "NUMBER",
  "PERSON",
  "CASE",
  "GENDER",
  "DEGREE"
])

export function prepareTreeForDisplay(tree) {
  if (!tree) return null
  return addBranch(extractVgpBadges(normalizeTree(tree)))
}

export function extractProductionRules(
  tree,
  { includeLexicalRules = true } = {}
) {
  const preparedTree = prepareTreeForDisplay(tree)
  const rules = []
  const seenRules = new Set()

  function visit(node) {
    const children = childrenOf(node)
    if (children.length === 0) return

    const parentLabel = String(node.name || "").trim()
    const childLabels = children
      .map((child) => String(child?.name || "").trim())
      .filter(Boolean)
    const isLexicalRule = children.every(
      (child) => childrenOf(child).length === 0
    )
    const isGrammaticalFeatureRule =
      isLexicalRule && GRAMMATICAL_FEATURE_LABELS.has(parentLabel.toUpperCase())

    // When lexical rules are hidden, grammatical features such as
    // "TENSE → pres" remain visible while word mappings such as "N → dog" do not.
    if (
      parentLabel &&
      childLabels.length > 0 &&
      (includeLexicalRules || !isLexicalRule || isGrammaticalFeatureRule)
    ) {
      const rule = `${parentLabel} → ${childLabels.join(" ")}`

      if (!seenRules.has(rule)) {
        seenRules.add(rule)
        rules.push(rule)
      }
    }

    children.forEach(visit)
  }

  visit(preparedTree)
  return rules
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
            children: beforeVP[0].children || []
          }
        : beforeVP.length > 0
          ? {
              name: "NP",
              children: beforeVP.map((child) =>
                child.name === "EN"
                  ? {
                      ...child,
                      name: "NP",
                      children: child.children || []
                    }
                  : {
                      ...child,
                      children: child.children || []
                    }
              )
            }
          : null

    return {
      name: "S",
      children: [
        ...(subject ? [subject] : []),
        ...afterVP.map(normalizeTree)
      ]
    }
  }

  if (tree.name === "EN") {
    return {
      ...tree,
      name: "NP",
      children: (tree.children || []).map(normalizeTree)
    }
  }

  return {
    ...tree,
    children: tree.children ? tree.children.map(normalizeTree) : undefined
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
      : undefined
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
      : undefined
  }
}
