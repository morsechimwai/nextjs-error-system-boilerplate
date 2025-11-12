"use server"

import { withActionHandler } from "@/lib/errors/withActionHandler"
import { getEmployeeById, getEmployees } from "@/services/employeeService"
import { Employee, GetEmployeeInput } from "@/types/employee"

export const getEmployeeAction = withActionHandler(async (input: GetEmployeeInput) => {
  return getEmployeeById(input)
})

export const getEmployeesAction = withActionHandler(async (): Promise<Employee[]> => {
  return getEmployees()
})
