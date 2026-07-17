import { prepareTreeForDisplay } from "./treeRules"

const PHRASE_LABELS = new Set(["NP", "VP", "PP", "ADJP", "ADVP"])
const NON_POS_LABELS = new Set(["ROOT", "S", "SBAR", ...PHRASE_LABELS])
const COORDINATOR_LABELS = new Set(["CC", "CONJ", "CONJP", "COORD"])
const POS_LABELS = {
  PRO: "Pronoun",
  DET: "Determiner",
  N: "Noun",
  V: "Verb",
  ADJ: "Adjective",
  ADV: "Adverb",
  P: "Preposition",
  AUX: "Auxiliary verb",
  MOD: "Modal verb",
  COORD: "Coordinating conjunction",
  CONJ: "Coordinating conjunction",
  CC: "Coordinating conjunction"
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

function terminalValues(node) {
  const children = childrenOf(node)
  if (children.length === 0) return [String(node?.name || "").trim()]
  return children.flatMap(terminalValues).filter(Boolean)
}

function verbTenseFromGroup(node) {
  const labels = new Set()
  let tenseValue = ""

  function inspect(current) {
    const label = normalizeLabel(current?.name)
    if (label) labels.add(label)
    if (label === "TENSE") tenseValue = terminalValues(current)[0]?.toLowerCase() || ""
    childrenOf(current).forEach(inspect)
  }

  inspect(node)

  const progressive = labels.has("PROG") || labels.has("PROGRESSIVE")
  const perfect = labels.has("PER") || labels.has("PERF") || labels.has("PERFECT")
  const isFuture = labels.has("MOD")
  const base = isFuture ? "future" : tenseValue

  if (base === "pres" || base === "present") {
    if (perfect && progressive) return "Present Perfect Continuous Tense"
    if (perfect) return "Present Perfect Tense"
    if (progressive) return "Present Continuous Tense"
    return "Present Simple Tense"
  }

  if (base === "past") {
    if (perfect && progressive) return "Past Perfect Continuous Tense"
    if (perfect) return "Past Perfect Tense"
    if (progressive) return "Past Continuous Tense"
    return "Past Simple Tense"
  }

  if (base === "future") {
    if (perfect && progressive) return "Future Perfect Continuous Tense"
    if (perfect) return "Future Perfect Tense"
    if (progressive) return "Future Continuous Tense"
    return "Future Simple Tense"
  }

  return "Not specified"
}

function verbTypeFromGroup(node) {
  const marker = childrenOf(node)
    .map((child) => String(child?.name || "").trim().toLowerCase())
    .find((name) => /^\[(trans|intrans|linking)\]$/.test(name))

  if (marker === "[trans]") return "trans"
  if (marker === "[intrans]") return "intrans"
  if (marker === "[linking]") return "linking"
  return "Not specified"
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
    const label = normalizeLabel(node.name)

    if (label === "VGP") {
      const word = terminalText(node)
      if (word) {
        posTags.push({
          word,
          tag: "Verb",
          verbDetails: {
            type: verbTypeFromGroup(node),
            tense: verbTenseFromGroup(node)
          }
        })
      }
      return
    }

    if (children.length === 0) {
      const parentLabel = normalizeLabel(parent?.name)
      const word = String(node.name || "").trim()

      if (
        word &&
        parentLabel &&
        !NON_POS_LABELS.has(parentLabel) &&
        !GRAMMATICAL_FEATURE_LABELS.has(parentLabel) &&
        !/^\[.+\]$/.test(word)
      ) {
        posTags.push({ word, tag: POS_LABELS[parentLabel] || parentLabel.toLowerCase() })
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
