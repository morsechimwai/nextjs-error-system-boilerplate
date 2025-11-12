// Types
import { CreateEmployeeInput, Employee, GetEmployeeInput } from "@/types/employee"

// AppError
import { AppError } from "@/lib/errors/AppError"

// Warpper to handle errors in service functions
import { withErrorHandling } from "@/lib/errors/withErrorHandling"

// In-memory database simulation
const db: Employee[] = []

// Service functions
export const createEmployee = withErrorHandling(
  async (data: CreateEmployeeInput): Promise<Employee> => {
    if (!data.name) throw new AppError("INVALID_INPUT", "Employee name required")
    if (db.some((e) => e.employeeId === data.employeeId))
      throw new AppError("DUPLICATE_EMPLOYEE_ID", "Employee ID already exists")

    const newEmp: Employee = {
      id: db.length + 1,
      name: data.name,
      employeeId: data.employeeId,
      department: data.department ? data.department : "ทั่วไป",
    }
    db.push(newEmp)
    return newEmp
  }
)

export const getEmployees = withErrorHandling(async (): Promise<Employee[]> => {
  return db
})

export const getEmployeeById = withErrorHandling(
  async (input: GetEmployeeInput): Promise<Employee> => {
    const emp = db.find((e) => e.id === Number(input.id))
    if (!emp) throw new AppError("NOT_FOUND", "Employee not found", 404)
    return emp
  }
)

export const deleteEmployee = withErrorHandling(async (input: GetEmployeeInput): Promise<void> => {
  const index = db.findIndex((e) => e.id === Number(input.id))
  if (index === -1) throw new AppError("NOT_FOUND", "Employee not found", 404)
  db.splice(index, 1)
})
