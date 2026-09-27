export type SentenceValidationResult = {
  normalizedInput: string
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

function getWords(value: string) {
  return value.toLowerCase().match(/\p{Script=Latin}[\p{Script=Latin}\p{M}]*(?:['’]\p{Script=Latin}[\p{Script=Latin}\p{M}]*)?/gu) ?? []
}

function startsWithQuestionStarter(words: string[]) {
  return words.length > 0 && QUESTION_STARTERS.includes(words[0])
}

function startsWithImperativeStarter(words: string[]) {
  if (words.length === 0) return false
  if (words[0] === "you") return false
  return IMPERATIVE_STARTERS.includes(words[0])
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

function capitalizeSentence(value: string) {
  const trimmed = value.trim()
  return trimmed ? `${trimmed[0].toUpperCase()}${trimmed.slice(1)}` : trimmed
}

function getDeclarativeSuggestion(
  input: string,
  words: string[],
  isInterrogative: boolean,
  isImperative: boolean,
  isExclamatory: boolean
) {
  const content = input.trim().replace(/[.!?]+$/, "").trim()
  if (!content) return undefined

  if (isImperative) {
    return ensurePeriod(`You ${content[0].toLowerCase()}${content.slice(1)}`)
  }

  if (isExclamatory) {
    const whatExclamation = content.match(/^what\s+(a|an)\s+(.+)$/i)
    if (whatExclamation) {
      return ensurePeriod(`It is ${whatExclamation[1].toLowerCase()} ${whatExclamation[2]}`)
    }
    return ensurePeriod(content)
  }

  if (isInterrogative) {
    const auxiliaryQuestion = content.match(
      /^(is|are|am|was|were|can|could|will|would|should|may|might|must|have|has|had|do|does|did)\s+(i|you|he|she|it|we|they|there)\s+(.+)$/i
    )
    if (auxiliaryQuestion) {
      const [, auxiliary, subject, predicate] = auxiliaryQuestion
      return ensurePeriod(
        `${capitalizeSentence(subject)} ${auxiliary.toLowerCase()} ${predicate}`
      )
    }

    const nounPhraseQuestion = content.match(
      /^(is|are|was|were|can|could|will|would|should|may|might|must|have|has|had)\s+((?:the|a|an|this|that|these|those|my|your|his|her|our|their)\s+\p{Script=Latin}[\p{Script=Latin}\p{M}'’-]*)\s+(.+)$/iu
    )
    if (nounPhraseQuestion) {
      const [, auxiliary, subject, predicate] = nounPhraseQuestion
      return ensurePeriod(
        `${capitalizeSentence(subject)} ${auxiliary.toLowerCase()} ${predicate}`
      )
    }

    const subject = words.includes("you") ? "You" : "The answer"
    return `${subject} can be stated as a declarative sentence.`
  }

  return undefined
}

function getSpellingSuggestion(input: string) {
  const trimmed = input.trim()
  const simpleKey = trimmed.toLowerCase().replace(/[.!?]+$/, "")
  if (WHOLE_SENTENCE_SUGGESTIONS[simpleKey]) {
    return WHOLE_SENTENCE_SUGGESTIONS[simpleKey]
  }

  let changed = false
  const corrected = trimmed.replace(/\p{Script=Latin}[\p{Script=Latin}\p{M}]*(?:['’]\p{Script=Latin}[\p{Script=Latin}\p{M}]*)?/gu, (word) => {
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
  const hasLetters = /\p{Script=Latin}/u.test(normalizedInput)
  const hasUnsupportedCharacters = /[^\p{Script=Latin}\p{M}0-9\s.,;:'’"()!?-]/u.test(normalizedInput)
  const isEnglishInput = !isEmpty && hasLetters && !hasUnsupportedCharacters
  const isInterrogative = /\?$/.test(normalizedInput) || startsWithQuestionStarter(words)
  const isExclamatory = /!$/.test(normalizedInput) || normalizedInput.includes("!")
  const isImperative = startsWithImperativeStarter(words)
  const isDeclarative = isEnglishInput && !isInterrogative && !isImperative && !isExclamatory
  const declarativeSuggestion = isEnglishInput
    ? getDeclarativeSuggestion(
        normalizedInput,
        words,
        isInterrogative,
        isImperative,
        isExclamatory
      )
    : undefined

  if (isTooLong) {
    errors.push(`Please keep the sentence within ${MAX_SENTENCE_LENGTH} characters.`)
  }

  if (hasUnsupportedCharacters) {
    errors.push("This tool currently supports Latin-script letters, numbers and standard punctuation only.")
  }

  if (!isEmpty && !hasLetters) {
    errors.push("Please enter an English sentence.")
  }

  if (isEnglishInput && (isInterrogative || isImperative || isExclamatory)) {
    warnings.push(
      "This system currently supports declarative sentences. You can still analyze this sentence, but the result may be inaccurate. Try the suggested declarative sentence below."
    )
  }

  if (isDeclarative && normalizedInput && !/[.]$/.test(normalizedInput)) {
    warnings.push("Tip: Declarative sentences usually end with a period.")
  }

  return {
    normalizedInput,
    isEmpty,
    isEnglishInput,
    hasUnsupportedCharacters,
    isDeclarative,
    isInterrogative,
    isImperative,
    isExclamatory,
    isTooLong,
    canAnalyze: !isEmpty && isEnglishInput && !isTooLong && errors.length === 0,
    errors,
    warnings,
    suggestion:
      declarativeSuggestion ||
      (isEnglishInput ? getSpellingSuggestion(normalizedInput) : undefined)
  }
}

