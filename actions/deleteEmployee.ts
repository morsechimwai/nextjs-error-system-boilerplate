"use server"

import { withActionHandler } from "@/lib/errors/withActionHandler"
import { deleteEmployee } from "@/services/employeeService"
import { DeleteEmployeeInput } from "@/types/employee"

export const deleteEmployeeAction = withActionHandler(async (input: DeleteEmployeeInput) => {
  return deleteEmployee(input)
})
