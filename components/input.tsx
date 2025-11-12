// React
import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"

// Utils
import { cn } from "@/lib/utils"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const baseClasses =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  return <input ref={ref} type={type} className={cn(baseClasses, className)} {...props} />
})

Input.displayName = "Input"

export default Input
