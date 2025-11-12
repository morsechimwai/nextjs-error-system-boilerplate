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

// Stores
import { useEmployeeStore } from "@/store/useEmployeeStore"

// Errors
import { withErrorHandling } from "@/lib/errors/withErrorHandling"
import { deleteEmployeeAction } from "@/actions/deleteEmployee"
import { Employee } from "@/types/employee"

export default function EmployeesPage() {
  const employees = useEmployeeStore((state) => state.employees)
  const setEmployees = useEmployeeStore((state) => state.setEmployees)

  const loadEmployees = useCallback(() => {
    const loadData = withErrorHandling(async () => {
      const response = await getEmployeesAction()
      if (response.ok) {
        setEmployees(response.data)
      }
    })
    loadData()
  }, [setEmployees])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleDelete = withErrorHandling(async (employee: Employee) => {
    const confirmed = window.confirm(`คุณแน่ใจหรือว่าต้องการลบ ${employee.name} พนักงานคนนี้?`)
    if (!confirmed) return

    const response = await deleteEmployeeAction({ id: employee.id })
    if (response.ok) {
      loadEmployees()
    }
  })

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
          <EmployeeForm />
        </div>
      </div>

      <ToastList />
    </main>
  )
}
