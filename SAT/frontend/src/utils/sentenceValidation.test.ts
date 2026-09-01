import { describe, expect, it } from "vitest"
import { validateSentenceInput } from "./sentenceValidation"

describe("validateSentenceInput", () => {
  it("accepts a simple declarative sentence", () => {
    const result = validateSentenceInput("The cat sleeps.")
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

  it("rejects unsupported sentence types", () => {
    expect(validateSentenceInput("Is the cat sleeping?").canAnalyze).toBe(false)
    expect(validateSentenceInput("Close the door.").canAnalyze).toBe(false)
    expect(validateSentenceInput("What a beautiful day!").canAnalyze).toBe(false)
  })

  it("rejects non-English characters and overly long input", () => {
    expect(validateSentenceInput("ฉันรักแมว").canAnalyze).toBe(false)
    expect(validateSentenceInput(`The cat ${"sleeps ".repeat(50)}.`).canAnalyze).toBe(false)
  })

  it("offers a spelling suggestion", () => {
    expect(validateSentenceInput("I lvoe yuo").suggestion).toBe("I love you.")
  })
})
