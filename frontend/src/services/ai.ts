import { api } from "./api";
import type { AIResult } from "../types";

export function getStudentInsight(payload: Record<string, unknown>) {
  return api.post<AIResult>("/ai/insight", { role: "student", ...payload });
}

export function getFacultyInsight(payload: Record<string, unknown>) {
  return api.post<AIResult>("/ai/insight", { role: "faculty", ...payload });
}

export function summarizeActivity(text: string) {
  return api.post<AIResult>("/ai/summarize", { text });
}
