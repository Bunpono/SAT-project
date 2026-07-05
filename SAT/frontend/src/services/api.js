const DEFAULT_API_URL = "http://127.0.0.1:8000"
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "")

function toAnalysisResult(data) {
  if (
    !data ||
    typeof data.sentence !== "string" ||
    typeof data.s_expression !== "string" ||
    !data.tree ||
    typeof data.tree !== "object"
  ) {
    throw new Error("The backend returned an invalid analysis result.")
  }

  return {
    sentence: data.sentence,
    s_expression: data.s_expression,
    tree: data.tree
  }
}

export async function analyzeSentence(sentence) {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sentence
    })
  })

  if (!response.ok) {
    let message = `Analysis request failed (${response.status}).`

    try {
      const error = await response.json()
      if (typeof error.detail === "string") {
        message = error.detail
      }
    } catch {
      // Keep the status-based message when the backend does not return JSON.
    }

    throw new Error(message)
  }

  const data = await response.json()
  return toAnalysisResult(data)
}
