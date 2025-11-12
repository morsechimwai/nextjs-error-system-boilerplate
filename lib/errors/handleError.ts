// AppError
import { AppError } from "./AppError"

// Handles different types of errors and converts them into AppError instances
export function handleError(error: unknown): AppError {
  // Other error handling logic can be added here

  if (error instanceof AppError) return error
  if (error instanceof Error) {
    console.error("[Unhandled Error]", error)
    return new AppError("INTERNAL_ERROR", error.message, 500)
  }

  // Fallback for unknown error types
  return new AppError("UNKNOWN_ERROR", "Unexpected error", 500)
}
