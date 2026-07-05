const STORAGE_KEY = "sat-analysis-history"

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry.id === "string" &&
    typeof entry.sentence === "string" &&
    typeof entry.s_expression === "string" &&
    entry.tree &&
    typeof entry.tree === "object" &&
    typeof entry.created_at === "string"
  )
}

function writeHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error("Unable to save analysis history:", error)
  }
}

export function getAnalysisHistory() {
  try {
    const storedHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")

    if (!Array.isArray(storedHistory)) return []

    return storedHistory
      .filter(isValidEntry)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error("Unable to read analysis history:", error)
    return []
  }
}

export function addAnalysisHistory(analysis) {
  const entry = {
    id: createId(),
    sentence: analysis.sentence,
    s_expression: analysis.s_expression,
    tree: analysis.tree,
    created_at: new Date().toISOString()
  }
  const entries = [entry, ...getAnalysisHistory()]

  writeHistory(entries)
  return entries
}

export function deleteAnalysisHistory(id) {
  const entries = getAnalysisHistory().filter((entry) => entry.id !== id)

  writeHistory(entries)
  return entries
}

export function clearAnalysisHistory() {
  writeHistory([])
  return []
}
