// HandleError
import { handleError } from "./handleError"

export function withErrorHandling<Args extends unknown[], ReturnType>(
  fn: (...args: Args) => Promise<ReturnType>
) {
  return async (...args: Args): Promise<ReturnType> => {
    try {
      return await fn(...args)
    } catch (err) {
      throw handleError(err)
    }
  }
}
