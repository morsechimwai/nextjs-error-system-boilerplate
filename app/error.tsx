"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useToastStore } from "@/store/useToastStore"
import Button from "@/components/button"
import { Bug, Home, RefreshCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { addToast } = useToastStore()

  useEffect(() => {
    console.error("Client error:", error)
    addToast(error.message || "Unexpected error occurred", "error")
  }, [error, addToast])

  return (
    <main className="min-h-screen bg-linear-to-br from-amber-50 via-white to-white px-4 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="rounded-3xl border border-amber-200 bg-white p-8 shadow-lg shadow-amber-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 text-amber-600">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                  <Bug className="size-6" />
                </span>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide">เกิดข้อผิดพลาด</p>
                  <h2 className="text-2xl font-semibold text-neutral-900">{error.name}</h2>
                </div>
              </div>
              <p className="mt-4 text-base text-neutral-600">
                ระบบไม่สามารถโหลดข้อมูลได้ในตอนนี้
                โปรดลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-neutral-900/95 p-6 text-sm text-neutral-100 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">รายละเอียดเพิ่มเติม</p>
            {error.digest ? (
              <span className="text-xs uppercase tracking-wide text-neutral-400">
                Digest: {error.digest}
              </span>
            ) : null}
          </div>
          <p className="mt-3 rounded-lg bg-neutral-800/70 px-4 py-3 text-neutral-200">
            {error.message}
          </p>
          <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-neutral-800/70 p-4 text-xs text-neutral-300">
            {error.stack ?? "ไม่พบ stack trace"}
          </pre>
        </section>

        <div className="flex flex-col gap-3 sm:w-auto sm:flex-row">
          <Button variant="danger" className="flex-1" onClick={() => reset()}>
            <RefreshCcw className="mr-2 size-4" />
            ลองอีกครั้ง
          </Button>
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-neutral-200 px-4 py-2 font-semibold text-neutral-700 transition hover:border-neutral-300"
          >
            <Home className="mr-2 size-4" />
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </main>
  )
}
