export interface Employee {
  id: number
  employeeId: string
  name: string
  department: string
}

export interface CreateEmployeeInput {
  employeeId: string
  name: string
  department?: string
}

export interface GetEmployeeInput {
  id: number
}

export interface DeleteEmployeeInput {
  id: number
}
