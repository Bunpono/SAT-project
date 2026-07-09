export type SentenceType = "Simple" | "Compound" | "Complex" | "Unknown"

export type SentenceValidationResult = {
  normalizedInput: string
  sentenceType: SentenceType
  isEmpty: boolean
  isEnglishInput: boolean
  hasUnsupportedCharacters: boolean
  isDeclarative: boolean
  isInterrogative: boolean
  isImperative: boolean
  isExclamatory: boolean
  isTooLong: boolean
  canAnalyze: boolean
  errors: string[]
  warnings: string[]
  suggestion?: string
}

const MAX_SENTENCE_LENGTH = 300

const QUESTION_STARTERS = [
  "who",
  "what",
  "where",
  "when",
  "why",
  "how",
  "do",
  "does",
  "did",
  "is",
  "are",
  "am",
  "was",
  "were",
  "can",
  "could",
  "will",
  "would",
  "should",
  "may",
  "might",
  "must",
  "have",
  "has",
  "had"
]

const IMPERATIVE_STARTERS = [
  "add",
  "answer",
  "bring",
  "choose",
  "click",
  "close",
  "come",
  "delete",
  "do",
  "don't",
  "dont",
  "enter",
  "explain",
  "find",
  "give",
  "go",
  "help",
  "listen",
  "look",
  "make",
  "open",
  "please",
  "put",
  "read",
  "remove",
  "run",
  "say",
  "select",
  "send",
  "show",
  "start",
  "stop",
  "submit",
  "take",
  "tell",
  "try",
  "turn",
  "use",
  "wait",
  "write"
]

const SUBORDINATORS = [
  "after",
  "although",
  "as",
  "because",
  "before",
  "even though",
  "if",
  "once",
  "since",
  "though",
  "unless",
  "until",
  "when",
  "whenever",
  "where",
  "whereas",
  "wherever",
  "while"
]

const RELATIVE_MARKERS = ["who", "whom", "whose", "which", "that"]
const COORDINATORS = ["and", "but", "or", "nor", "for", "yet", "so"]

const COMMON_SPELLING_FIXES: Record<string, string> = {
  abotu: "about",
  accomodate: "accommodate",
  becuase: "because",
  beleive: "believe",
  freind: "friend",
  recieve: "receive",
  seperate: "separate",
  teh: "the",
  thier: "their",
  wierd: "weird",
  yuo: "you",
  lvoe: "love"
}

const WHOLE_SENTENCE_SUGGESTIONS: Record<string, string> = {
  "i lvoe yuo": "I love you.",
  "i love yuo": "I love you.",
  "i lvoe you": "I love you."
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getWords(value: string) {
  return value.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []
}

function includesPhrase(wordsText: string, phrase: string) {
  return new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i").test(wordsText)
}

function startsWithQuestionStarter(words: string[]) {
  return words.length > 0 && QUESTION_STARTERS.includes(words[0])
}

function startsWithImperativeStarter(words: string[]) {
  if (words.length === 0) return false
  if (words[0] === "you") return false
  return IMPERATIVE_STARTERS.includes(words[0])
}

function hasLikelySubject(words: string[]) {
  const subjectHints = [
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "there",
    "this",
    "that",
    "these",
    "those",
    "the",
    "a",
    "an",
    "my",
    "your",
    "his",
    "her",
    "our",
    "their"
  ]
  return words.some((word, index) => index < 5 && subjectHints.includes(word))
}

function detectSentenceType(input: string, words: string[]): SentenceType {
  if (words.length < 2 || !hasLikelySubject(words)) return "Unknown"

  const wordsText = words.join(" ")
  const hasComplexMarker =
    SUBORDINATORS.some((marker) => includesPhrase(wordsText, marker)) ||
    RELATIVE_MARKERS.some((marker) => includesPhrase(wordsText, marker))

  if (hasComplexMarker) return "Complex"

  const hasCompoundPunctuation = /;/.test(input)
  const hasCompoundConjunction = COORDINATORS.some((coordinator) =>
    new RegExp(`,\\s+${coordinator}\\b|\\b${coordinator}\\b.+\\b(?:i|you|he|she|it|we|they|the|a|an)\\b`, "i").test(input)
  )

  if (hasCompoundPunctuation || hasCompoundConjunction) return "Compound"
  return "Simple"
}

function applyCase(original: string, replacement: string) {
  if (original.toUpperCase() === original) return replacement.toUpperCase()
  if (original[0] === original[0]?.toUpperCase()) {
    return `${replacement[0].toUpperCase()}${replacement.slice(1)}`
  }
  return replacement
}

function ensurePeriod(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function getSuggestion(input: string) {
  const trimmed = input.trim()
  const simpleKey = trimmed.toLowerCase().replace(/[.!?]+$/, "")
  if (WHOLE_SENTENCE_SUGGESTIONS[simpleKey]) {
    return WHOLE_SENTENCE_SUGGESTIONS[simpleKey]
  }

  let changed = false
  const corrected = trimmed.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, (word) => {
    const replacement = COMMON_SPELLING_FIXES[word.toLowerCase()]
    if (!replacement) return word
    changed = true
    return applyCase(word, replacement)
  })

  return changed ? ensurePeriod(corrected) : undefined
}

export function validateSentenceInput(input: string): SentenceValidationResult {
  const normalizedInput = input.trim()
  const words = getWords(normalizedInput)
  const errors: string[] = []
  const warnings: string[] = []
  const isEmpty = normalizedInput.length === 0
  const isTooLong = normalizedInput.length > MAX_SENTENCE_LENGTH
  const hasLetters = /[A-Za-z]/.test(normalizedInput)
  const hasUnsupportedCharacters = /[^A-Za-z0-9\s.,;:'"()!?-]/.test(normalizedInput)
  const isEnglishInput = !isEmpty && hasLetters && !hasUnsupportedCharacters
  const isInterrogative = /\?$/.test(normalizedInput) || startsWithQuestionStarter(words)
  const isExclamatory = /!$/.test(normalizedInput) || normalizedInput.includes("!")
  const isImperative = startsWithImperativeStarter(words)
  const isDeclarative = isEnglishInput && !isInterrogative && !isImperative && !isExclamatory
  const sentenceType = isDeclarative ? detectSentenceType(normalizedInput, words) : "Unknown"

  if (isTooLong) {
    errors.push(`Please keep the sentence within ${MAX_SENTENCE_LENGTH} characters.`)
  }

  if (hasUnsupportedCharacters) {
    errors.push("This tool currently supports English letters, numbers and standard punctuation only.")
  }

  if (!isEmpty && !hasLetters) {
    errors.push("Please enter an English declarative sentence.")
  }

  if (isInterrogative) {
    errors.push("Interrogative sentences are currently not supported.")
  }

  if (isImperative) {
    errors.push("Imperative sentences are currently not supported.")
  }

  if (isExclamatory) {
    errors.push("Exclamatory sentences are currently not supported.")
  }

  if (isDeclarative && sentenceType === "Unknown") {
    errors.push("This sentence does not look like a supported Simple, Compound or Complex declarative sentence.")
  }

  if (isDeclarative && normalizedInput && !/[.]$/.test(normalizedInput)) {
    warnings.push("Tip: Declarative sentences usually end with a period.")
  }

  return {
    normalizedInput,
    sentenceType,
    isEmpty,
    isEnglishInput,
    hasUnsupportedCharacters,
    isDeclarative,
    isInterrogative,
    isImperative,
    isExclamatory,
    isTooLong,
    canAnalyze: !isEmpty && isDeclarative && sentenceType !== "Unknown" && !isTooLong && errors.length === 0,
    errors,
    warnings,
    suggestion: isEnglishInput ? getSuggestion(normalizedInput) : undefined
  }
}

