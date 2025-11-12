import { cn } from "@/lib/utils"
import type { ToastType } from "@/store/useToastStore"

interface ToastProps {
  message: string
  type: ToastType
  onDismiss?: () => void
}

const variantStyles: Record<
  ToastType,
  { accent: string; dot: string; aria: "assertive" | "polite" }
> = {
  success: {
    accent: "border-l-4 border-emerald-500",
    dot: "bg-emerald-500",
    aria: "polite",
  },
  error: {
    accent: "border-l-4 border-rose-500",
    dot: "bg-rose-500",
    aria: "assertive",
  },
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  const { accent, dot, aria } = variantStyles[type]

  return (
    <div
      role="status"
      aria-live={aria}
      className={cn(
        "flex min-w-60 items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm",
        accent
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <p className="flex-1 leading-5">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          aria-label="ปิดการแจ้งเตือน"
          onClick={onDismiss}
          className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
        >
          ปิด
        </button>
      ) : null}
    </div>
  )
}
