// Error
import { handleError } from "./handleError"

// Define the shape of the action response
export type ActionResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

/**
 * Wrap a server action to normalize errors and responses.
 * Must be used inside a file that includes `"use server"` at top-level.
 */
export const withActionHandler = <Args extends unknown[], ReturnType>(
  fn: (...args: Args) => Promise<ReturnType>
) => {
  return async (...args: Args): Promise<ActionResponse<ReturnType>> => {
    try {
      const data = await fn(...args)
      return { ok: true, data }
    } catch (err) {
      const error = handleError(err)
      return { ok: false, error: { code: error.code, message: error.message } }
    }
  }
}
