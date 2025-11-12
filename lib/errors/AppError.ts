// AppError class to standardize error handling across the application
export class AppError extends Error {
  readonly code: string // Unique error code identifier
  readonly status: number // HTTP status code associated with the error
  readonly meta?: Record<string, unknown> // Optional metadata for additional error context

  // Initialize the AppError with code, message, status, and optional metadata
  constructor(code: string, message?: string, status = 400, meta?: Record<string, unknown>) {
    super(message ?? code)
    this.code = code
    this.status = status
    this.meta = meta
  }
}
