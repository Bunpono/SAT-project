import { clearAuthToken, getAuthToken } from "../utils/authStorage"

const DEFAULT_API_URL = "http://127.0.0.1:8000"
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "")

async function apiRequest(path, options = {}) {
  const { body, auth = true, headers = {}, ...requestOptions } = options
  const token = getAuthToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  })

  if (response.status === 401 && auth) {
    clearAuthToken()
    window.dispatchEvent(new Event("sat-auth-expired"))
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const error = await response.json()
      if (typeof error.detail === "string") message = error.detail
    } catch {
      // Keep the status-based message when the backend does not return JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

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
  return data
}

export function registerAccount(name, email, password) {
  return apiRequest("/auth/register", {
    method: "POST",
    auth: false,
    body: { name, email, password }
  })
}

export function loginAccount(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password }
  })
}

export function getCurrentUser() {
  return apiRequest("/auth/me")
}

export async function analyzeSentence(sentence) {
  return toAnalysisResult(
    await apiRequest("/analyze", { method: "POST", body: { sentence } })
  )
}

export function getMyHistory() {
  return apiRequest("/history/my")
}

export function deleteMyHistory(id) {
  return apiRequest(`/history/my/${id}`, { method: "DELETE" })
}

export function clearMyHistory() {
  return apiRequest("/history/my", { method: "DELETE" })
}

export function submitErrorReport(sentence, description, analysisResult) {
  return apiRequest("/reports", {
    method: "POST",
    body: {
      sentence,
      description,
      analysis_result: analysisResult
    }
  })
}

export function getAdminHistory() {
  return apiRequest("/admin/history")
}

export function getAdminReports() {
  return apiRequest("/admin/reports")
}
