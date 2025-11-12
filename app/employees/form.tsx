"use client"

// React
import { useState, useTransition } from "react"

// Components
import Input from "@/components/input"
import Button from "@/components/button"

// Icons
import { UserPlus } from "lucide-react"

// Actions
import { createEmployeeAction } from "@/actions/createEmployee"

// Stores
import { useToastStore } from "@/store/useToastStore"
import { useEmployeeStore } from "@/store/useEmployeeStore"

// Types
import { Employee } from "@/types/employee"

const defaultEmployee: Employee = {
  id: 0,
  employeeId: "",
  name: "",
  department: "",
}

export function EmployeeForm() {
  const [employee, setEmployee] = useState<Employee>(defaultEmployee)
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToastStore()
  const addEmployee = useEmployeeStore((state) => state.addEmployee)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      const res = await createEmployeeAction(employee)
      if (res.ok) {
        addEmployee(res.data)
        addToast(`เพิ่ม ${res.data.name} สำเร็จ`, "success")
        setEmployee(defaultEmployee)
      } else {
        addToast(`เกิดข้อผิดพลาด: ${res.error.message}`, "error")
      }
    })
  }

  return (
    <section className="rounded-lg bg-white shadow-md sticky top-6">
      <h2 className="px-4 py-4 font-semibold border-b border-neutral-200 flex items-center">
        <UserPlus className="inline mb-1 mr-2 size-5 text-neutral-600" />
        <span className="text-neutral-600 text-lg">เพิ่มพนักงานใหม่</span>
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-6">
        <Input
          type="text"
          placeholder="รหัสพนักงาน"
          value={employee.employeeId}
          onChange={(e) => setEmployee({ ...employee, employeeId: e.target.value })}
          disabled={isPending}
        />
        <Input
          type="text"
          placeholder="ชื่อพนักงาน"
          value={employee.name}
          onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
          disabled={isPending}
        />
        <Input
          type="text"
          placeholder="แผนก"
          value={employee.department}
          onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
          disabled={isPending}
        />
        <Button
          type="submit"
          disabled={isPending || employee.name.trim() === "" || employee.employeeId.trim() === ""}
          variant="primary"
        >
          {isPending ? "กำลังเพิ่ม..." : "เพิ่มพนักงาน"}
        </Button>
      </form>
    </section>
  )
}
