import type { Answer } from "../../../../packages/schema/schemas/answer.schema";

const ANSWERS_KEY_PREFIX = "voksmonitor-answers-";
const EXPIRY_KEY_PREFIX = "voksmonitor-answers-expiry-";
const COMPLETED_KEY_PREFIX = "voksmonitor-completed-";

/** 24 hours in milliseconds */
const ANSWERS_TTL_MS = 24 * 60 * 60 * 1000;

function answersKey(calculatorId: string): string {
  return `${ANSWERS_KEY_PREFIX}${calculatorId}`;
}

function expiryKey(calculatorId: string): string {
  return `${EXPIRY_KEY_PREFIX}${calculatorId}`;
}

function completedKey(calculatorId: string): string {
  return `${COMPLETED_KEY_PREFIX}${calculatorId}`;
}

export function saveAnswersToLocalStorage(calculatorId: string, answers: Answer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(answersKey(calculatorId), JSON.stringify(answers));
    // Reset the expiry every time we save (sliding window)
    localStorage.removeItem(expiryKey(calculatorId));
  } catch {
    // localStorage may be full or disabled — silently ignore
  }
}

export function loadAnswersFromLocalStorage(calculatorId: string): Answer[] {
  if (typeof window === "undefined") return [];
  try {
    // Check if answers have expired
    const expiry = localStorage.getItem(expiryKey(calculatorId));
    if (expiry) {
      const expiresAt = Number(expiry);
      if (Date.now() >= expiresAt) {
        // Expired — clean up
        localStorage.removeItem(answersKey(calculatorId));
        localStorage.removeItem(expiryKey(calculatorId));
        return [];
      }
    }

    const stored = localStorage.getItem(answersKey(calculatorId));
    if (!stored) return [];
    return JSON.parse(stored) as Answer[];
  } catch {
    return [];
  }
}

/**
 * Start the 24-hour expiry countdown for saved answers.
 * Call this after a successful anonymous submission so the answers
 * remain available for review but are automatically cleaned up.
 */
export function setAnswersExpiry(calculatorId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(expiryKey(calculatorId), String(Date.now() + ANSWERS_TTL_MS));
  } catch {
    // silently ignore
  }
}

export function markCalculatorCompleted(calculatorId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(completedKey(calculatorId), "true");
  } catch {
    // silently ignore
  }
}

export function isCalculatorCompleted(calculatorId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(completedKey(calculatorId)) === "true";
  } catch {
    return false;
  }
}
