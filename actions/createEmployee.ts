"use server"

// Types
import { CreateEmployeeInput } from "@/types/employee"

// Services
import { createEmployee } from "@/services/employeeService"

// Utils
import { withActionHandler } from "@/lib/errors/withActionHandler"

export const createEmployeeAction = withActionHandler(async (data: CreateEmployeeInput) => {
  return createEmployee(data)
})
