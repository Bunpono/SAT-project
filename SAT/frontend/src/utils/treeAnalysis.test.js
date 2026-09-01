import { describe, expect, it } from "vitest"
import { analyzeTree } from "./treeAnalysis"

const leaf = (name) => ({ name })
const node = (name, ...children) => ({ name, children })
const np = (word) => node("NP", node("N", leaf(word)))
const vp = (word) => node("VP", node("Vgp", node("V", leaf(word))))

describe("analyzeTree clause and sentence classification", () => {
  it("classifies an unnumbered S as a simple sentence", () => {
    const result = analyzeTree(node("S", np("Mary"), vp("runs")))

    expect(result.sentenceType).toBe("Simple Sentence")
    expect(result.clauses.map((clause) => clause.type)).toEqual([
      "S — Independent Clause"
    ])
  })

  it("classifies coordinated S1 and S2 branches as compound", () => {
    const tree = node(
      "S",
      node("S1", np("She"), vp("reads")),
      node("COORD", leaf("but")),
      node("S2", np("he"), vp("plays"))
    )
    const result = analyzeTree(tree)

    expect(result.sentenceType).toBe("Compound Sentence")
    expect(result.clauses.map((clause) => clause.type)).toEqual([
      "S1 — Independent Clause",
      "S2 — Independent Clause"
    ])
  })

  it("uses an S2 attached to an NP as a dependent adjective clause", () => {
    const relativeClause = node(
      "S2",
      node("NP", node("PRO", leaf("who"))),
      node("VP", node("Vgp", node("V", leaf("wears"))), np("skirt"))
    )
    const subject = node(
      "NP",
      node("Det", leaf("The")),
      node("NP", node("N", leaf("woman")), relativeClause)
    )
    const result = analyzeTree(node("S1", subject, vp("looks")))

    expect(result.sentenceType).toBe("Complex Sentence")
    expect(result.clauses.map((clause) => clause.type)).toEqual([
      "S1 — Independent Clause",
      "S2 — Dependent Adjective Clause"
    ])
    expect(result.sentenceTypeReason).toContain("S2: Adjective Clause")
  })

  it("uses an S2 in a VP complement as a dependent noun clause", () => {
    const nounClause = node(
      "S2",
      node("CONJ", leaf("that")),
      np("they"),
      vp("left")
    )
    const result = analyzeTree(
      node("S1", np("I"), node("VP", node("Vgp", node("V", leaf("know"))), nounClause))
    )

    expect(result.sentenceType).toBe("Complex Sentence")
    expect(result.clauses[1].type).toBe("S2 — Dependent Noun Clause")
  })

  it("uses an S2 attached directly to S1 as a dependent adverb clause", () => {
    const adverbClause = node(
      "S2",
      node("CONJ", leaf("when")),
      np("it"),
      vp("rains")
    )
    const result = analyzeTree(node("S1", np("We"), vp("leave"), adverbClause))

    expect(result.sentenceType).toBe("Complex Sentence")
    expect(result.clauses[1].type).toBe("S2 — Dependent Adverb Clause")
  })
})
