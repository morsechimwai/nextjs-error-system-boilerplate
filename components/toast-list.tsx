"use client"

// React
import { useEffect } from "react"

// Components
import { Toast } from "./toast"

// Stores
import { useToastStore } from "@/store/useToastStore"

export function ToastList() {
  const { toasts, removeToast } = useToastStore()

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => removeToast(t.id), 4000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  )
}
