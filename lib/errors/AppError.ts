// AppError class to standardize error handling across the application
export class AppError extends Error {
  readonly code: string
  readonly status: number
  readonly meta?: Record<string, unknown>

  constructor(code: string, message?: string, status = 400, meta?: Record<string, unknown>) {
    super(message ?? code)
    this.code = code
    this.status = status
    this.meta = meta
  }
}
