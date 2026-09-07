import { describe, expect, it } from "vitest"
import { validateSentenceInput } from "./sentenceValidation"

describe("validateSentenceInput", () => {
  it("accepts a simple declarative sentence", () => {
    const result = validateSentenceInput("The cat sleeps.")
    expect(result.canAnalyze).toBe(true)
    expect(result.sentenceType).toBe("Simple")
  })

  it("accepts a capitalized noun phrase as the subject", () => {
    const result = validateSentenceInput("Green Curry tastes spicy.")
    expect(result.canAnalyze).toBe(true)
    expect(result.sentenceType).toBe("Simple")
  })

  it("accepts a curly apostrophe used in supported English contractions", () => {
    const result = validateSentenceInput("I’m here for the interview.")
    expect(result.canAnalyze).toBe(true)
    expect(result.sentenceType).toBe("Simple")
  })

  it("detects compound and complex sentences", () => {
    expect(validateSentenceInput("I read, and she writes.").sentenceType).toBe("Compound")
    expect(validateSentenceInput("I stayed home, for it was raining.").sentenceType).toBe("Compound")
    expect(validateSentenceInput("The woman who sings smiles.").sentenceType).toBe("Complex")
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
    expect(validateSentenceInput(`The cat ${"sleeps ".repeat(50)}.`).canAnalyze).toBe(false)
  })

  it("allows an uncertain English input with a warning", () => {
    const result = validateSentenceInput("green curry tastes spicy.")
    expect(result.canAnalyze).toBe(true)
    expect(result.sentenceType).toBe("Unknown")
    expect(result.warnings[0]).toContain("could not confidently detect")
  })

  it("offers a spelling suggestion", () => {
    expect(validateSentenceInput("I lvoe yuo").suggestion).toBe("I love you.")
  })
})
