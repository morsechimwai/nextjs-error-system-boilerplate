// React
import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"

// Utils
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "danger" | "link" | "ghost"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 disabled:opacity-60 disabled:pointer-events-none"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-800",
  secondary: "bg-neutral-200 text-neutral-800 hover:bg-neutral-300",
  danger: "bg-red-500 text-white hover:bg-red-600",
  link: "bg-transparent text-neutral-900 underline-offset-4 hover:underline",
  ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100",
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "primary", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
})

Button.displayName = "Button"

export default Button
