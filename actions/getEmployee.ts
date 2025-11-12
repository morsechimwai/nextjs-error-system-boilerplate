"use server"

// Types
import { Employee, GetEmployeeInput } from "@/types/employee"

// Services
import { getEmployeeById, getEmployees } from "@/services/employeeService"

// Utils
import { withActionHandler } from "@/lib/errors/withActionHandler"

export const getEmployeeAction = withActionHandler(async (input: GetEmployeeInput) => {
  return getEmployeeById(input)
})

export const getEmployeesAction = withActionHandler(async (): Promise<Employee[]> => {
  return getEmployees()
})
