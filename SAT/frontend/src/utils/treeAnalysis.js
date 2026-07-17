import { prepareTreeForDisplay } from "./treeRules"

const PHRASE_LABELS = new Set(["NP", "VP", "PP", "ADJP", "ADVP"])
const NON_POS_LABELS = new Set(["ROOT", "S", "SBAR", ...PHRASE_LABELS])
const COORDINATOR_LABELS = new Set(["CC", "CONJ", "CONJP", "COORD"])
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

function childrenOf(node) {
  return Array.isArray(node?.children) ? node.children : []
}

function normalizeLabel(name) {
  return String(name || "")
    .trim()
    .toUpperCase()
    .split(/[-=]/)[0]
}

function terminalText(node, parentLabel = "") {
  const children = childrenOf(node)

  if (children.length === 0) {
    const text = String(node?.name || "").trim()
    return GRAMMATICAL_FEATURE_LABELS.has(parentLabel) || /^\[.+\]$/.test(text)
      ? ""
      : text
  }

  return children
    .map((child) => terminalText(child, normalizeLabel(node?.name)))
    .filter(Boolean)
    .join(" ")
}

function containsClause(node) {
  if (normalizeLabel(node?.name) === "S") return true
  return childrenOf(node).some(containsClause)
}

function hasCoordinator(node) {
  if (COORDINATOR_LABELS.has(normalizeLabel(node?.name))) return true
  return childrenOf(node).some(hasCoordinator)
}

function hasCoordinatedClauses(node) {
  const children = childrenOf(node)
  const clauseBranches = children.filter(containsClause).length

  if (clauseBranches >= 2 && children.some(hasCoordinator)) {
    return true
  }

  return children.some(hasCoordinatedClauses)
}

export function analyzeTree(tree) {
  const posTags = []
  const phrases = []
  const clauses = []

  function collectPhrases(node) {
    if (!node || typeof node !== "object") return

    const label = normalizeLabel(node.name)
    if (PHRASE_LABELS.has(label)) {
      phrases.push({ type: label, text: terminalText(node) })
    }

    childrenOf(node).forEach(collectPhrases)
  }

  function collectClauses(node, isNestedInClause = false, entries = []) {
    if (!node || typeof node !== "object") return entries

    const label = normalizeLabel(node.name)
    const isClause = label === "S"

    if (isClause) {
      entries.push({
        kind: isNestedInClause ? "dependent" : "independent",
        text: terminalText(node)
      })
    }

    childrenOf(node).forEach((child) =>
      collectClauses(child, isNestedInClause || isClause, entries)
    )

    return entries
  }

  function visit(node, parent = null) {
    if (!node || typeof node !== "object") return

    const children = childrenOf(node)

    if (children.length === 0) {
      const parentLabel = normalizeLabel(parent?.name)
      const word = String(node.name || "").trim()

      if (word && parentLabel && !NON_POS_LABELS.has(parentLabel)) {
        posTags.push({ word, tag: parentLabel })
      }

      return
    }

    children.forEach((child) => visit(child, node))
  }

  const displayTree = prepareTreeForDisplay(tree)
  collectPhrases(displayTree)

  const clauseEntries = collectClauses(tree)
  const normalizedClauseEntries = clauseEntries.length > 0
    ? clauseEntries
    : [{ kind: "independent", text: terminalText(displayTree) }]
  const dependentCount = normalizedClauseEntries.filter((entry) => entry.kind === "dependent").length
  const independentCount = normalizedClauseEntries.length - dependentCount

  normalizedClauseEntries.forEach((entry, index) => {
    const isSingleIndependent = independentCount === 1 && dependentCount === 0
    const number = entry.kind === "independent" && independentCount > 1
      ? ` ${normalizedClauseEntries.slice(0, index + 1).filter((item) => item.kind === "independent").length}`
      : ""

    clauses.push({
      type: isSingleIndependent
        ? "Single Independent Clause"
        : `${entry.kind === "independent" ? "Independent" : "Dependent"} Clause${number}`,
      text: entry.text
    })
  })

  visit(tree)
  const coordinatedClauses = hasCoordinatedClauses(tree)

  let sentenceType = "Simple Sentence"
  let sentenceTypeReason = "The tree contains one independent clause."

  if (dependentCount > 0) {
    sentenceType = "Complex Sentence"
    sentenceTypeReason =
      "A dependent S clause is nested inside an independent clause."
  } else if (independentCount >= 2 && coordinatedClauses) {
    sentenceType = "Compound Sentence"
    sentenceTypeReason =
      "Independent S clauses are coordinated at the same structural level."
  }

  return {
    posTags,
    phrases,
    clauses,
    sentenceType,
    sentenceTypeReason
  }
}
