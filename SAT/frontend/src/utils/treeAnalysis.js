import { prepareTreeForDisplay } from "./treeRules"

const PHRASE_LABELS = new Set(["NP", "VP", "PP", "ADJP", "ADVP"])
const NON_POS_LABELS = new Set(["ROOT", "S", "SBAR", ...PHRASE_LABELS])
const COORDINATOR_LABELS = new Set(["CC", "CONJ", "CONJP", "COORD"])
const RELATIVE_CLAUSE_LABELS = new Set(["RC", "RRC", "RELCL", "SBAR"])
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
  const clauseNodes = []
  let hasRelativeClause = false

  function collectPhrases(node) {
    if (!node || typeof node !== "object") return

    const label = normalizeLabel(node.name)
    if (PHRASE_LABELS.has(label)) {
      phrases.push({ type: label, text: terminalText(node) })
    }

    childrenOf(node).forEach(collectPhrases)
  }

  function visit(node, parent = null, sDepth = 0) {
    if (!node || typeof node !== "object") return

    const children = childrenOf(node)
    const label = normalizeLabel(node.name)

    if (RELATIVE_CLAUSE_LABELS.has(label)) {
      hasRelativeClause = true
    }

    if (children.length === 0) {
      const parentLabel = normalizeLabel(parent?.name)
      const word = String(node.name || "").trim()

      if (word && parentLabel && !NON_POS_LABELS.has(parentLabel)) {
        posTags.push({ word, tag: parentLabel })
      }

      return
    }

    const nextSDepth = label === "S" ? sDepth + 1 : sDepth

    if (label === "S") {
      const clause = {
        type: sDepth === 0 ? "Main Clause" : "Embedded Clause",
        text: terminalText(node)
      }

      clauses.push(clause)
      clauseNodes.push({ node, isEmbedded: sDepth > 0 })
    }

    children.forEach((child) => visit(child, node, nextSDepth))
  }

  collectPhrases(prepareTreeForDisplay(tree))
  visit(tree)

  const mainClauseCount = clauseNodes.filter((clause) => !clause.isEmbedded).length
  const hasEmbeddedClause = clauseNodes.some((clause) => clause.isEmbedded)
  const coordinatedClauses = hasCoordinatedClauses(tree)

  let sentenceType = "Simple Sentence"
  let sentenceTypeReason = "The tree contains one main S node."

  if (clauseNodes.length === 0) {
    sentenceType = "Sentence Type Unavailable"
    sentenceTypeReason = "The returned tree does not contain an S node."
  } else if (hasEmbeddedClause || hasRelativeClause) {
    sentenceType = "Complex Sentence"
    sentenceTypeReason =
      "The tree contains an embedded S node or a relative-clause structure."
  } else if (coordinatedClauses || mainClauseCount > 1) {
    sentenceType = "Compound Sentence"
    sentenceTypeReason =
      "The tree contains multiple main S nodes joined at the same structural level."
  }

  return {
    posTags,
    phrases,
    clauses,
    sentenceType,
    sentenceTypeReason
  }
}
