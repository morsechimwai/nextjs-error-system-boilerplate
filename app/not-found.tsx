// Next.js
import Link from "next/link"

// Icons
import { ArrowLeft, Compass, Home } from "lucide-react"

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-100 px-6 py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-500 shadow-sm">
          <Compass className="size-4" />
          เส้นทางนี้ยังไม่มีข้อมูล
        </span>
        <h1 className="mt-6 text-6xl font-semibold text-neutral-900">404</h1>
        <p className="mt-4 text-lg text-neutral-600">
          ไม่พบหน้าที่คุณกำลังค้นหา อาจถูกย้าย ลบไปแล้ว หรือคุณอาจสะกดลิงก์ผิดเล็กน้อย
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-800"
          >
            <Home className="size-4" />
            กลับหน้าแรก
          </Link>
          <Link
            href="/employees"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-3 font-semibold text-neutral-700 transition hover:border-neutral-300"
          >
            <ArrowLeft className="size-4" />
            ไปยังหน้ารายชื่อพนักงาน
          </Link>
        </div>

        <div className="mt-12 w-full rounded-2xl border border-dashed border-neutral-200 bg-white/60 p-6 text-left">
          <p className="text-sm font-semibold text-neutral-800">ลองขั้นตอนต่อไปนี้</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>• ตรวจสอบ URL อีกครั้งว่าสะกดถูกต้อง</li>
            <li>• ใช้เมนูนำทางด้านบนเพื่อค้นหาหน้าที่ต้องการ</li>
            <li>• หากคิดว่านี่คือข้อผิดพลาด แจ้งผู้ดูแลระบบได้เลย</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
