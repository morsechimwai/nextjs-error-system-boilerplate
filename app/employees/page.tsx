"use client"

// React
import { useEffect, useCallback } from "react"

// Components
import { ToastList } from "@/components/toast-list"
import EmployeeList from "@/app/employees/_components/employee-list"

// Forms
import { EmployeeForm } from "@/app/employees/form"

// Actions
import { getEmployeesAction } from "@/actions/getEmployee"

// Custom Hooks
import { useEmployeeStore } from "@/store/useEmployeeStore"

// Actions
import { deleteEmployeeAction } from "@/actions/deleteEmployee"
import { Employee } from "@/types/employee"

export default function EmployeesPage() {
  // Custom Hooks
  const employees = useEmployeeStore((state) => state.employees)
  const setEmployees = useEmployeeStore((state) => state.setEmployees)

  // Fetch Employees
  const loadEmployees = useCallback(async () => {
    const response = await getEmployeesAction()
    if (response.ok) {
      setEmployees(response.data)
    } else {
      console.error("Failed to load employees:", response.error)
    }
  }, [setEmployees])

  // Initial Load
  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  // Handlers
  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(`คุณแน่ใจหรือว่าต้องการลบ ${employee.name} ออกจากพนักงาน?`)
    if (!confirmed) return

    const response = await deleteEmployeeAction({ id: employee.id })
    if (response.ok) {
      await loadEmployees()
    } else {
      console.error("Failed to delete employee:", response.error)
    }
  }

  return (
    <main className="p-8 space-y-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <EmployeeList
            employees={employees}
            onDelete={(employee) => {
              handleDelete(employee)
            }}
          />
        </div>
        <div className="col-span-1">
          <EmployeeForm onEmployeeAdded={loadEmployees} />
        </div>
      </div>

      <ToastList />
    </main>
  )
}
