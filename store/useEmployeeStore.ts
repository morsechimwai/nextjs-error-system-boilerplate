"use client"

import { create } from "zustand"
import { Employee } from "@/services/employeeService"

interface EmployeeStore {
  employees: Employee[]
  setEmployees: (employees: Employee[]) => void
  addEmployee: (employee: Employee) => void
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) =>
    set((state) => {
      // Prevent accidental duplicates when the same entry is added twice.
      const exists = state.employees.some((item) => item.id === employee.id)
      return exists ? state : { employees: [...state.employees, employee] }
    }),
}))
