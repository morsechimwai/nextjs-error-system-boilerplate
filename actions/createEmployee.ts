"use server"

import { withActionHandler } from "@/lib/errors/withActionHandler"
import { createEmployee } from "@/services/employeeService"
import { CreateEmployeeInput } from "@/types/employee"

export const createEmployeeAction = withActionHandler(async (data: CreateEmployeeInput) => {
  return createEmployee(data)
})
