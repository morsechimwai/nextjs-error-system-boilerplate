"use server"

// Types
import { DeleteEmployeeInput } from "@/types/employee"

// Services
import { deleteEmployee } from "@/services/employeeService"

// Utils
import { withActionHandler } from "@/lib/errors/withActionHandler"

export const deleteEmployeeAction = withActionHandler(async (input: DeleteEmployeeInput) => {
  return deleteEmployee(input)
})
