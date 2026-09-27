import { describe, expect, it } from "vitest"
import { validateSentenceInput } from "./sentenceValidation"

describe("validateSentenceInput", () => {
  it("accepts a simple declarative sentence", () => {
    const result = validateSentenceInput("The cat sleeps.")
    expect(result.canAnalyze).toBe(true)
  })

  it("accepts a capitalized noun phrase as the subject", () => {
    const result = validateSentenceInput("Green Curry tastes spicy.")
    expect(result.canAnalyze).toBe(true)
  })

  it("accepts a curly apostrophe used in supported English contractions", () => {
    const result = validateSentenceInput("I’m here for the interview.")
    expect(result.canAnalyze).toBe(true)
  })

  it("accepts foreign names and loanwords written with Latin diacritics", () => {
    const examples = [
      "He opened a small food stand in his hometown of Cancún.",
      "Beyoncé ordered a café au lait in São Paulo.",
      "Her re\u0301sume\u0301 describes a naïve approach."
    ]

    examples.forEach((sentence) => {
      const result = validateSentenceInput(sentence)
      expect(result.canAnalyze).toBe(true)
      expect(result.hasUnsupportedCharacters).toBe(false)
    })
  })

  it("allows non-declarative English with a warning and declarative suggestion", () => {
    const question = validateSentenceInput("Is the cat sleeping?")
    expect(question.canAnalyze).toBe(true)
    expect(question.warnings[0]).toContain("supports declarative sentences")
    expect(question.suggestion).toBe("The cat is sleeping.")

    const imperative = validateSentenceInput("Close the door.")
    expect(imperative.canAnalyze).toBe(true)
    expect(imperative.suggestion).toBe("You close the door.")

    const exclamation = validateSentenceInput("What a beautiful day!")
    expect(exclamation.canAnalyze).toBe(true)
    expect(exclamation.suggestion).toBe("It is a beautiful day.")
  })

  it("rejects non-English characters and overly long input", () => {
    expect(validateSentenceInput("ฉันรักแมว").canAnalyze).toBe(false)
    expect(validateSentenceInput("Он любит кошек.").canAnalyze).toBe(false)
    expect(validateSentenceInput(`The cat ${"sleeps ".repeat(50)}.`).canAnalyze).toBe(false)
  })

  it("allows valid English input without guessing its sentence type", () => {
    const result = validateSentenceInput("green curry tastes spicy.")
    expect(result.canAnalyze).toBe(true)
    expect(result).not.toHaveProperty("sentenceType")
  })

  it("offers a spelling suggestion", () => {
    expect(validateSentenceInput("I lvoe yuo").suggestion).toBe("I love you.")
  })
})
