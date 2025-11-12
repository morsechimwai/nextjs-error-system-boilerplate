"use client"

// Components
import Button from "@/components/button"

// Icons
import { Trash2, Users } from "lucide-react"

// Types
import { Employee } from "@/types/employee"

interface EmployeeListProps {
  employees: Employee[]
  onDelete: (employee: Employee) => void
}

export default function EmployeeList({ employees, onDelete }: EmployeeListProps) {
  const hasEmployees = employees.length > 0

  return (
    <section className="min-h-[50vh] rounded-lg border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-neutral-300 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
            <Users className="size-5" />
          </span>
          <div>
            <p className="text-sm text-neutral-500">รายการพนักงานทั้งหมด</p>
            <p className="text-lg font-semibold text-neutral-900">{employees.length} รายการ</p>
          </div>
        </div>
      </header>

      {hasEmployees ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-separate border-spacing-0 text-sm py-2">
            <thead>
              <tr className="bg-neutral-50 text-left text-neutral-600">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">รหัส</th>
                <th className="px-6 py-3 font-medium">ชื่อพนักงาน</th>
                <th className="px-6 py-3 font-medium">แผนก</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr
                  key={employee.id}
                  className="border-t border-neutral-100 text-neutral-800 even:bg-neutral-50/50"
                >
                  <td className="px-6 py-3 align-middle text-neutral-500">{index + 1}</td>
                  <td className="px-6 py-3 align-middle text-neutral-500">{employee.employeeId}</td>
                  <td className="px-6 py-3 align-middle font-semibold">{employee.name}</td>
                  <td className="px-6 py-3 align-middle font-semibold">{employee.department}</td>
                  <td className="px-6 py-3 align-middle font-semibold text-right">
                    <Button
                      onClick={() => onDelete(employee)}
                      variant="ghost"
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      <Trash2 className="size-5 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-neutral-500">
          <Users className="size-10 text-neutral-300" />
          <p className="text-base font-medium text-neutral-700">ยังไม่มีพนักงานในระบบ</p>
          <p className="text-sm text-neutral-500">เพิ่มพนักงานใหม่ผ่านฟอร์มด้านบนเพื่อเริ่มต้น</p>
        </div>
      )}
    </section>
  )
}
