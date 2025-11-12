# Next.js Layered Error System Boilerplate

โปรเจคตัวอย่างการใช้งาน **Layered Error System** ในแอปพลิเคชัน Next.js เพื่อจัดการข้อผิดพลาดอย่างมีระบบและคาดเดาได้

## 🎯 แนวคิดหลักของ Layered Error System

ระบบจัดการข้อผิดพลาดแบบชั้น (Layered) ช่วยให้เราสามารถควบคุมและจัดการ error ได้อย่างเป็นระบบ โดยแบ่งออกเป็น 4 ชั้นหลัก:

```
Client/API Layer → withActionHandler() → AppError() → handleError() → withErrorHandling() → Service Layer
```

### 🔧 องค์ประกอบหลัก

1. **`AppError()`** - คลาสสำหรับสร้าง custom error ที่เราควบคุมได้
2. **`handleError()`** - ฟังก์ชันแปลงทุก error ให้เป็นรูปแบบเดียวกัน
3. **`withErrorHandling()`** - wrapper สำหรับ service/function ให้จัดการ error อัตโนมัติ
4. **`withActionHandler()`** - wrapper สำหรับ Server Actions ให้คืน response ที่ปลอดภัย

## 📁 โครงสร้างโปรเจค

```
├── lib/errors/           # ระบบจัดการ error หลัก
│   ├── AppError.ts       # คลาส custom error
│   ├── handleError.ts    # ฟังก์ชันแปลง error
│   ├── withErrorHandling.ts # wrapper สำหรับ services
│   └── withActionHandler.ts # wrapper สำหรับ actions
├── services/             # Business logic layer
│   └── employeeService.ts
├── actions/              # Server Actions layer
│   ├── createEmployee.ts
│   ├── getEmployee.ts
│   └── deleteEmployee.ts
└── components/           # UI Components
    └── toast-list.tsx    # แสดงข้อความ error
```

## 🏗️ วิธีการทำงานของแต่ละชั้นอย่างละเอียด

### 1. AppError Class (`lib/errors/AppError.ts`)

คลาสสำหรับสร้าง error ที่เราควบคุมได้ พร้อมกับ code, status และ metadata

```typescript
export class AppError extends Error {
  code: string
  status: number
  meta?: any

  constructor(
    code: string,
    message: string,
    status: number = 400,
    meta?: any
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.meta = meta
  }
}
```

**การใช้งาน:**
```typescript
// Error พื้นฐาน
throw new AppError("EMPLOYEE_NOT_FOUND", "ไม่พบพนักงาน", 404)

// Error พร้อมข้อมูลเพิ่มเติม
throw new AppError("INVALID_INPUT", "ข้อมูลไม่ถูกต้อง", 400, {
  field: "name",
  value: "",
  required: true
})

// Validation error
throw new AppError("VALIDATION_ERROR", "รูปแบบอีเมลไม่ถูกต้อง", 422, {
  field: "email",
  pattern: "user@domain.com"
})
```

**คุณสมบัติ:**
- `code`: รหัส error ที่กำหนดเอง (เช่น "EMPLOYEE_NOT_FOUND") - ใช้สำหรับการจัดการใน code
- `message`: ข้อความอธิบาย error ที่แสดงให้ผู้ใช้ดู
- `status`: HTTP status code (default: 400) - ใช้กำหนด response status
- `meta`: ข้อมูลเพิ่มเติม (optional) - เก็บ context หรือ debugging info

**ประโยชน์:**
- สร้าง error ที่มีโครงสร้างเดียวกันทั่วทั้งแอป
- ง่ายต่อการ serialize เป็น JSON
- รองรับ metadata สำหรับ debugging
- Type-safe กับ TypeScript

### 2. handleError Function (`lib/errors/handleError.ts`)

ฟังก์ชันที่แปลงทุก error (AppError, Error, หรืออื่นๆ) ให้เป็น AppError เสมอ เพื่อให้การจัดการ error มีความสม่ำเสมอ

```typescript
export function handleError(error: unknown): AppError {
  // ถ้าเป็น AppError อยู่แล้ว ส่งผ่านไปเลย
  if (error instanceof AppError) {
    return error
  }

  // ถ้าเป็น Error ปกติ
  if (error instanceof Error) {
    console.error('Unhandled Error:', error)
    return new AppError(
      'INTERNAL_ERROR',
      error.message || 'เกิดข้อผิดพลาดภายในระบบ',
      500
    )
  }

  // ถ้าเป็นอย่างอื่น (string, object, etc.)
  console.error('Unknown Error:', error)
  return new AppError(
    'UNKNOWN_ERROR',
    'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    500
  )
}
```

**การใช้งาน:**
```typescript
try {
  // โค้ดที่อาจเกิด error
  await someRiskyOperation()
} catch (error) {
  const normalizedError = handleError(error) // ได้ AppError เสมอ
  throw normalizedError
}
```

**หน้าที่และการทำงาน:**
1. **AppError Passthrough**: ถ้าเป็น AppError แล้ว → ส่งผ่านไปเลย (ไม่แปลง)
2. **Error Normalization**: ถ้าเป็น Error ทั่วไป → แปลงเป็น AppError พร้อม log
3. **Unknown Error Handling**: ถ้าเป็นอย่างอื่น → สร้าง AppError ใหม่
4. **Logging**: บันทึก error ที่ไม่คาดคิดเพื่อ debugging

**ประโยชน์:**
- รับประกันว่าทุก error จะเป็น AppError
- มี logging อัตโนมัติสำหรับ unexpected errors
- ป้องกัน sensitive information leak
- ทำให้ error handling ที่ layer บนง่ายขึ้น

### 3. withErrorHandling Wrapper (`lib/errors/withErrorHandling.ts`)

Higher-Order Function ที่ห่อ service functions ให้จัดการ error อัตโนมัติ โดยจับทุก error และแปลงให้เป็น AppError

```typescript
export function withErrorHandling<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw handleError(error)
    }
  }
}
```

**การใช้งาน:**
```typescript
// Service ที่ไม่มี error handling
async function rawCreateEmployee(data: CreateEmployeeData) {
  if (!data.name) throw new Error("Name is required") // อาจเป็น Error ปกติ
  if (!data.employeeId) throw new AppError("INVALID_ID", "รหัสพนักงานไม่ถูกต้อง")

  // Database operation ที่อาจ throw error
  return await db.employee.create({ data })
}

// Wrap ด้วย withErrorHandling
export const createEmployee = withErrorHandling(rawCreateEmployee)

// ตอนใช้งาน
try {
  const employee = await createEmployee(data)
  // สำเร็จ
} catch (error) {
  // รับประกันว่าเป็น AppError เสมอ
  console.log(error.code)    // INVALID_ID หรือ INTERNAL_ERROR
  console.log(error.message) // ข้อความที่เหมาะสม
}
```

**ตัวอย่างการใช้งานจริง:**
```typescript
// services/employeeService.ts
export const getEmployeeById = withErrorHandling(async (id: number) => {
  if (!id || id <= 0) {
    throw new AppError("INVALID_ID", "รหัสพนักงานไม่ถูกต้อง", 400)
  }

  const employee = await db.employee.findUnique({ where: { id } })

  if (!employee) {
    throw new AppError("EMPLOYEE_NOT_FOUND", "ไม่พบพนักงาน", 404)
  }

  return employee
})

export const updateEmployee = withErrorHandling(async (id: number, data: UpdateData) => {
  // Validation
  if (!data.name?.trim()) {
    throw new AppError("INVALID_NAME", "ชื่อไม่ถูกต้อง", 400)
  }

  // Check existence
  await getEmployeeById(id) // จะ throw AppError ถ้าไม่เจอ

  // Update (อาจ throw database error)
  return await db.employee.update({ where: { id }, data })
})
```

**ประโยชน์:**
- **Auto Error Normalization**: จับ error ทุกตัวและแปลงเป็น AppError อัตโนมัติ
- **Cleaner Service Code**: ไม่ต้องเขียน try-catch ซ้ำๆ ในทุก service
- **Consistent Error Format**: รับประกันว่าทุก service จะ throw AppError เสมอ
- **Easy to Debug**: มี error logging อัตโนมัติ
- **Type Safety**: รักษา type signature ของฟังก์ชันเดิม

### 4. withActionHandler Wrapper (`lib/errors/withActionHandler.ts`)

Higher-Order Function สำหรับ Server Actions ที่แปลง error เป็น Result Pattern แทนการ throw exception เพื่อให้ client จัดการได้ง่าย

```typescript
// Type definitions
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; status: number } }

export function withActionHandler<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<ActionResult<TReturn>> => {
    try {
      const data = await fn(...args)
      return { ok: true, data }
    } catch (error) {
      const appError = handleError(error)
      return {
        ok: false,
        error: {
          code: appError.code,
          message: appError.message,
          status: appError.status
        }
      }
    }
  }
}
```

**การใช้งาน:**
```typescript
// actions/createEmployee.ts
"use server"

import { withActionHandler } from "@/lib/errors/withActionHandler"
import { createEmployee } from "@/services/employeeService"
import { CreateEmployeeData } from "@/types/employee"

// Wrap service ด้วย withActionHandler
export const createEmployeeAction = withActionHandler(async (data: CreateEmployeeData) => {
  return createEmployee(data) // service อาจ throw AppError
})

// actions/getEmployee.ts
export const getEmployeesAction = withActionHandler(async () => {
  return getAllEmployees()
})

export const getEmployeeByIdAction = withActionHandler(async (id: number) => {
  return getEmployeeById(id)
})
```

**การใช้งานใน Client Component:**
```typescript
// components/EmployeeForm.tsx
"use client"

import { createEmployeeAction } from "@/actions/createEmployee"

export function EmployeeForm() {
  const handleSubmit = async (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      employeeId: formData.get("employeeId") as string,
      department: formData.get("department") as string
    }

    const result = await createEmployeeAction(data)

    if (result.ok) {
      // สำเร็จ - มี type safety
      console.log("Created employee:", result.data.name)
      addToast(`เพิ่ม ${result.data.name} สำเร็จ`, "success")
      setEmployee(defaultEmployee) // reset form
    } else {
      // มี error - ไม่ต้องกลัว exception
      console.error("Error code:", result.error.code)
      console.error("Error message:", result.error.message)

      // แสดง error ตาม code
      switch (result.error.code) {
        case "DUPLICATE_EMPLOYEE_ID":
          addToast("รหัสพนักงานนี้มีอยู่แล้ว", "error")
          break
        case "INVALID_INPUT":
          addToast(`ข้อมูลไม่ถูกต้อง: ${result.error.message}`, "error")
          break
        default:
          addToast(result.error.message, "error")
      }
    }
  }

  // ... JSX
}
```

**Response Format:**
```typescript
// Success Response
{
  ok: true,
  data: {
    id: 1,
    name: "สมชาย ใจดี",
    employeeId: "EMP001",
    department: "IT"
  }
}

// Error Response
{
  ok: false,
  error: {
    code: "DUPLICATE_EMPLOYEE_ID",
    message: "รหัสพนักงานนี้มีอยู่แล้ว",
    status: 409
  }
}
```

**ประโยชน์:**
- **Result Pattern**: ไม่ throw exception ทำให้ client ปลอดภัย
- **Type Safety**: TypeScript รู้ว่า response จะเป็น success หรือ error
- **Predictable Response**: รูปแบบ response เดียวกันทุก action
- **Easy Error Handling**: client จัดการ error ได้ง่าย
- **No Try-Catch on Client**: client ไม่ต้องเขียน try-catch
- **Serializable**: response เป็น plain object ส่งผ่าน network ได้

## 🌊 Flow การทำงานของระบบอย่างละเอียด

### Success Flow (กรณีสำเร็จ)
```mermaid
graph TD
    A[User กรอกข้อมูล] --> B[Submit Form]
    B --> C[Client เรียก Server Action]
    C --> D[withActionHandler เรียก Service]
    D --> E[withErrorHandling เรียก Business Logic]
    E --> F[Service ทำงานสำเร็จ]
    F --> G[คืนค่า data]
    G --> H[withErrorHandling ส่งผ่าน data]
    H --> I[withActionHandler wrap เป็น {ok: true, data}]
    I --> J[Client ได้ response สำเร็จ]
    J --> K[แสดง success message ใน UI]
```

### Error Flow (กรณีมี error)
```mermaid
graph TD
    A[User กรอกข้อมูลผิด] --> B[Submit Form]
    B --> C[Client เรียก Server Action]
    C --> D[withActionHandler เรียก Service]
    D --> E[withErrorHandling เรียก Business Logic]
    E --> F[Service throw AppError/Error]
    F --> G[withErrorHandling จับ error]
    G --> H[เรียก handleError() normalize error]
    H --> I[handleError คืน AppError]
    I --> J[withErrorHandling throw AppError]
    J --> K[withActionHandler จับ AppError]
    K --> L[wrap เป็น {ok: false, error}]
    L --> M[Client ได้ response error]
    M --> N[แสดง error message ใน UI]
```

### ตัวอย่างการทำงานแบบ Step-by-Step

**Scenario: User พยายามสร้างพนักงานที่มีรหัสซ้ำ**

```typescript
// 1. User Submit Form
const formData = {
  name: "สมชาย ใจดี",
  employeeId: "EMP001", // รหัสที่มีอยู่แล้ว
  department: "IT"
}

// 2. Client เรียก Action
const result = await createEmployeeAction(formData)

// 3. withActionHandler เรียก Service
export const createEmployeeAction = withActionHandler(async (data) => {
  return createEmployee(data) // เรียก service
})

// 4. withErrorHandling เรียก Business Logic
export const createEmployee = withErrorHandling(async (data) => {
  // 5. Validation ใน Service
  if (!data.name) throw new AppError("INVALID_NAME", "ต้องระบุชื่อ")

  // 6. Check duplicate
  const existing = await db.employee.findUnique({
    where: { employeeId: data.employeeId }
  })

  if (existing) {
    // 7. Service throw AppError
    throw new AppError("DUPLICATE_EMPLOYEE_ID", "รหัสพนักงานนี้มีอยู่แล้ว", 409)
  }
})

// 8. withErrorHandling จับ AppError
catch (error) {
  throw handleError(error) // ส่งต่อ AppError (ไม่แปลงเพราะเป็น AppError แล้ว)
}

// 9. withActionHandler จับ AppError
catch (error) {
  const appError = handleError(error)
  return {
    ok: false,
    error: {
      code: "DUPLICATE_EMPLOYEE_ID",
      message: "รหัสพนักงานนี้มีอยู่แล้ว",
      status: 409
    }
  }
}

// 10. Client ได้ response
if (result.ok) {
  // ไม่เข้าเพราะ ok = false
} else {
  // 11. แสดง error ใน UI
  addToast(result.error.message, "error") // "รหัสพนักงานนี้มีอยู่แล้ว"
}
```

## 🚀 วิธีการติดตั้งและรัน

```bash
# Clone โปรเจค
git clone <repository-url>
cd nextjs-error-system-boilerplate

# ติดตั้ง dependencies
pnpm install

# รันโปรเจค
pnpm dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000) เพื่อดูตัวอย่างการทำงาน

## 📝 ตัวอย่างการใช้งานแบบ Step-by-Step

### 1. การสร้าง Service ใหม่

```typescript
// services/userService.ts
import { AppError } from "@/lib/errors/AppError"
import { withErrorHandling } from "@/lib/errors/withErrorHandling"

// Raw function (ไม่มี error handling)
async function rawCreateUser(userData: CreateUserData) {
  // Input validation
  if (!userData.email?.trim()) {
    throw new AppError("INVALID_EMAIL", "กรุณาระบุอีเมล", 400)
  }

  if (!userData.email.includes("@")) {
    throw new AppError("INVALID_EMAIL_FORMAT", "รูปแบบอีเมลไม่ถูกต้อง", 400)
  }

  if (!userData.name?.trim()) {
    throw new AppError("INVALID_NAME", "กรุณาระบุชื่อ", 400)
  }

  // Business validation
  const existingUser = await db.user.findUnique({
    where: { email: userData.email }
  })

  if (existingUser) {
    throw new AppError("USER_EXISTS", "อีเมลนี้ถูกใช้งานแล้ว", 409)
  }

  // Database operation (อาจ throw database error)
  try {
    return await db.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        createdAt: new Date()
      }
    })
  } catch (dbError) {
    // Database constraint violation หรือ connection error
    throw new AppError("DATABASE_ERROR", "ไม่สามารถสร้างผู้ใช้ได้", 500)
  }
}

// Wrap ด้วย withErrorHandling
export const createUser = withErrorHandling(rawCreateUser)

// Services อื่นๆ
export const getUserById = withErrorHandling(async (id: number) => {
  if (!id || id <= 0) {
    throw new AppError("INVALID_USER_ID", "รหัสผู้ใช้ไม่ถูกต้อง", 400)
  }

  const user = await db.user.findUnique({ where: { id } })

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "ไม่พบผู้ใช้", 404)
  }

  return user
})

export const updateUserProfile = withErrorHandling(async (id: number, data: UpdateUserData) => {
  // ตรวจสอบว่า user มีอยู่จริง (จะ throw error ถ้าไม่เจอ)
  await getUserById(id)

  // Validation
  if (data.name && !data.name.trim()) {
    throw new AppError("INVALID_NAME", "ชื่อไม่ถูกต้อง", 400)
  }

  if (data.email && !data.email.includes("@")) {
    throw new AppError("INVALID_EMAIL_FORMAT", "รูปแบบอีเมลไม่ถูกต้อง", 400)
  }

  // Check email uniqueness (ถ้ามีการเปลี่ยน email)
  if (data.email) {
    const existingUser = await db.user.findFirst({
      where: {
        email: data.email,
        id: { not: id } // ยกเว้น user ปัจจุบัน
      }
    })

    if (existingUser) {
      throw new AppError("EMAIL_TAKEN", "อีเมลนี้ถูกใช้งานแล้ว", 409)
    }
  }

  return await db.user.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  })
})
```

### 2. การสร้าง Action ใหม่

```typescript
// actions/userActions.ts
"use server"

import { withActionHandler } from "@/lib/errors/withActionHandler"
import { createUser, getUserById, updateUserProfile } from "@/services/userService"
import { CreateUserData, UpdateUserData } from "@/types/user"

// Create User Action
export const createUserAction = withActionHandler(async (formData: FormData) => {
  const userData: CreateUserData = {
    email: formData.get("email") as string,
    name: formData.get("name") as string
  }

  return createUser(userData)
})

// Alternative: รับ object แทน FormData
export const createUserFromObjectAction = withActionHandler(async (userData: CreateUserData) => {
  return createUser(userData)
})

// Get User Action
export const getUserAction = withActionHandler(async (id: number) => {
  return getUserById(id)
})

// Update User Action
export const updateUserAction = withActionHandler(async (id: number, updateData: UpdateUserData) => {
  return updateUserProfile(id, updateData)
})

// Get All Users Action
export const getAllUsersAction = withActionHandler(async () => {
  return getAllUsers()
})

// Delete User Action
export const deleteUserAction = withActionHandler(async (id: number) => {
  // ตรวจสอบ permission ก่อน (ถ้ามี)
  const currentUser = await getCurrentUser()
  if (!currentUser.isAdmin) {
    throw new AppError("PERMISSION_DENIED", "คุณไม่มีสิทธิ์ลบผู้ใช้", 403)
  }

  return deleteUser(id)
})

// Search Users Action
export const searchUsersAction = withActionHandler(async (query: string) => {
  if (!query?.trim()) {
    throw new AppError("INVALID_SEARCH_QUERY", "กรุณาระบุคำค้นหา", 400)
  }

  return searchUsers(query)
})
```

**การใช้งาน Action แบบต่างๆ:**

```typescript
// ใน Client Component
"use client"

// 1. การใช้งานกับ Form
export function CreateUserForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await createUserAction(formData)

    if (result.ok) {
      console.log("User created:", result.data)
    } else {
      console.error("Error:", result.error.message)
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <input name="name" type="text" required />
      <button type="submit">สร้างผู้ใช้</button>
    </form>
  )
}

// 2. การใช้งานกับ Object
export function UserManager() {
  const [users, setUsers] = useState([])

  const handleCreateUser = async (userData: CreateUserData) => {
    const result = await createUserFromObjectAction(userData)

    if (result.ok) {
      setUsers(prev => [...prev, result.data])
      addToast(`สร้างผู้ใช้ ${result.data.name} สำเร็จ`, "success")
    } else {
      addToast(result.error.message, "error")
    }
  }

  const handleUpdateUser = async (id: number, updateData: UpdateUserData) => {
    const result = await updateUserAction(id, updateData)

    if (result.ok) {
      setUsers(prev => prev.map(user =>
        user.id === id ? result.data : user
      ))
      addToast("อัพเดทข้อมูลสำเร็จ", "success")
    } else {
      addToast(result.error.message, "error")
    }
  }

  return (
    <div>
      {/* User list และ forms */}
    </div>
  )
}
```

### 3. การใช้งานใน Component (Frontend)

```typescript
// components/UserForm.tsx
"use client"

import { useState, useTransition } from "react"
import { createUserAction, updateUserAction } from "@/actions/userActions"
import { useToastStore } from "@/store/useToastStore"
import { CreateUserData, UpdateUserData } from "@/types/user"

export default function UserForm({
  user,
  onSuccess
}: {
  user?: User
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: user?.email || "",
    name: user?.name || ""
  })
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToastStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      let result

      if (user) {
        // Update existing user
        result = await updateUserAction(user.id, formData as UpdateUserData)
      } else {
        // Create new user
        result = await createUserAction(formData)
      }

      if (result.ok) {
        // สำเร็จ
        const action = user ? "อัพเดท" : "สร้าง"
        addToast(`${action}ผู้ใช้ ${result.data.name} สำเร็จ`, "success")

        if (!user) {
          // Reset form for new user creation
          setFormData({ email: "", name: "" })
        }

        onSuccess?.()
      } else {
        // จัดการ error ตาม code
        switch (result.error.code) {
          case "USER_EXISTS":
          case "EMAIL_TAKEN":
            addToast("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น", "error")
            break

          case "INVALID_EMAIL_FORMAT":
            addToast("กรุณาตรวจสอบรูปแบบอีเมล", "error")
            break

          case "INVALID_NAME":
          case "INVALID_EMAIL":
            addToast(`ข้อมูลไม่ถูกต้อง: ${result.error.message}`, "error")
            break

          case "DATABASE_ERROR":
            addToast("เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง", "error")
            break

          default:
            addToast(result.error.message, "error")
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">อีเมล</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          disabled={isPending}
          required
        />
      </div>

      <div>
        <label htmlFor="name">ชื่อ</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          disabled={isPending}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !formData.email?.trim() || !formData.name?.trim()}
      >
        {isPending ? "กำลังบันทึก..." : (user ? "อัพเดท" : "สร้างผู้ใช้")}
      </button>
    </form>
  )
}
```

### 4. การจัดการ Error แบบ Advanced

```typescript
// components/UserList.tsx
"use client"

import { useEffect, useState } from "react"
import { getAllUsersAction, deleteUserAction } from "@/actions/userActions"
import { User } from "@/types/user"

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load users with error handling
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      setError(null)

      const result = await getAllUsersAction()

      if (result.ok) {
        setUsers(result.data)
      } else {
        // จัดการ error ในการโหลดข้อมูล
        switch (result.error.code) {
          case "DATABASE_ERROR":
            setError("ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
            break
          case "PERMISSION_DENIED":
            setError("คุณไม่มีสิทธิ์ดูรายการผู้ใช้")
            break
          default:
            setError(result.error.message)
        }
      }

      setLoading(false)
    }

    loadUsers()
  }, [])

  const handleDelete = async (user: User) => {
    const confirmed = confirm(`คุณแน่ใจหรือว่าต้องการลบ ${user.name}?`)
    if (!confirmed) return

    const result = await deleteUserAction(user.id)

    if (result.ok) {
      setUsers(prev => prev.filter(u => u.id !== user.id))
      addToast(`ลบ ${user.name} สำเร็จ`, "success")
    } else {
      // จัดการ error ในการลบ
      switch (result.error.code) {
        case "USER_NOT_FOUND":
          addToast("ไม่พบผู้ใช้ที่ต้องการลบ", "error")
          // รีโหลดรายการเพื่อ sync กับฐานข้อมูล
          loadUsers()
          break
        case "PERMISSION_DENIED":
          addToast("คุณไม่มีสิทธิ์ลบผู้ใช้", "error")
          break
        default:
          addToast(`ไม่สามารถลบผู้ใช้ได้: ${result.error.message}`, "error")
      }
    }
  }

  if (loading) return <div>กำลังโหลด...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div>
      {users.map(user => (
        <div key={user.id} className="user-item">
          <span>{user.name} ({user.email})</span>
          <button onClick={() => handleDelete(user)}>
            ลบ
          </button>
        </div>
      ))}
    </div>
  )
}
```

## 🎁 ประโยชน์ของระบบนี้

### ✅ ข้อดี

1. **Centralized Error Handling** - จัดการ error ในจุดเดียว
2. **Type Safety** - รองรับ TypeScript เต็มรูปแบบ
3. **Predictable Response** - response มีรูปแบบที่คาดเดาได้
4. **Easy Debugging** - ง่ายต่อการ debug และ logging
5. **Consistent UX** - แสดง error แบบเดียวกันทั่วทั้งแอป
6. **Separation of Concerns** - แยกการจัดการ error ออกจาก business logic

### 📊 เปรียบเทียบกับวิธีแบบเดิม

| แบบเดิม | Layered Error System |
|---------|---------------------|
| try-catch กระจายทุกที่ | Error handling รวมศูนย์ |
| Response ไม่สม่ำเสมอ | Response รูปแบบเดียว |
| Hard to debug | Easy debugging |
| ไม่ Type-safe | Full TypeScript support |
| Error UX ไม่เป็นมาตรฐาน | Consistent error UX |

## 🧪 การทดสอบ Layered Error System

### ทดสอบ Error Handling ในแต่ละชั้น

```typescript
// tests/errors/AppError.test.ts
import { AppError } from "@/lib/errors/AppError"

describe("AppError", () => {
  it("should create AppError with default status", () => {
    const error = new AppError("TEST_CODE", "Test message")

    expect(error.code).toBe("TEST_CODE")
    expect(error.message).toBe("Test message")
    expect(error.status).toBe(400) // default
    expect(error.name).toBe("AppError")
  })

  it("should create AppError with custom status and meta", () => {
    const error = new AppError("NOT_FOUND", "Resource not found", 404, { id: 123 })

    expect(error.status).toBe(404)
    expect(error.meta).toEqual({ id: 123 })
  })
})

// tests/errors/handleError.test.ts
import { handleError } from "@/lib/errors/handleError"
import { AppError } from "@/lib/errors/AppError"

describe("handleError", () => {
  it("should pass through AppError unchanged", () => {
    const originalError = new AppError("TEST_CODE", "Test message", 404)
    const result = handleError(originalError)

    expect(result).toBe(originalError) // same instance
  })

  it("should convert Error to AppError", () => {
    const originalError = new Error("Database connection failed")
    const result = handleError(originalError)

    expect(result).toBeInstanceOf(AppError)
    expect(result.code).toBe("INTERNAL_ERROR")
    expect(result.message).toBe("Database connection failed")
    expect(result.status).toBe(500)
  })

  it("should handle unknown error types", () => {
    const result = handleError("string error")

    expect(result).toBeInstanceOf(AppError)
    expect(result.code).toBe("UNKNOWN_ERROR")
    expect(result.status).toBe(500)
  })
})
```

### ตัวอย่าง Integration Test

```typescript
// tests/integration/employee.test.ts
import { createEmployeeAction, deleteEmployeeAction } from "@/actions/createEmployee"

describe("Employee Actions Integration", () => {
  it("should create employee successfully", async () => {
    const employeeData = {
      name: "Test Employee",
      employeeId: "TEST001",
      department: "IT"
    }

    const result = await createEmployeeAction(employeeData)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe("Test Employee")
      expect(result.data.employeeId).toBe("TEST001")
    }
  })

  it("should return error for duplicate employee ID", async () => {
    // สร้างพนักงานคนแรก
    await createEmployeeAction({
      name: "First Employee",
      employeeId: "DUP001",
      department: "IT"
    })

    // พยายามสร้างพนักงานที่มี ID ซ้ำ
    const result = await createEmployeeAction({
      name: "Second Employee",
      employeeId: "DUP001", // ซ้ำ
      department: "HR"
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe("DUPLICATE_EMPLOYEE_ID")
      expect(result.error.status).toBe(409)
    }
  })
})
```

## 🔧 เทคโนโลยีและ Dependencies

### Core Technologies
- **Next.js 15** - React framework พร้อม App Router และ Server Actions
- **TypeScript** - Type safety และ better developer experience
- **React 18** - UI library พร้อม concurrent features

### State Management & UI
- **Zustand** - Lightweight state management สำหรับ toast notifications
- **Tailwind CSS** - Utility-first CSS framework สำหรับ styling
- **Lucide React** - Icon library

### Development & Build Tools
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting และ quality checking
- **PostCSS** - CSS processing

### Error System Dependencies
ระบบ Layered Error System ไม่ต้องพึ่งพา external libraries เพิ่มเติม ใช้เฉพาะ:
- **TypeScript** - สำหรับ type definitions
- **Next.js Server Actions** - สำหรับ API layer

### Optional Testing Stack (สำหรับ production)
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5"
  }
}
```

## 📚 Best Practices และแนวทางการพัฒนา

### 1. การตั้งชื่อ Error Codes

```typescript
// ✅ ดี - ชัดเจน สื่อความหมาย
"USER_NOT_FOUND"           // 404 - ไม่พบผู้ใช้
"DUPLICATE_EMAIL"          // 409 - อีเมลซ้ำ
"INVALID_PASSWORD_FORMAT"  // 400 - รูปแบบรหัสผ่านไม่ถูกต้อง
"PERMISSION_DENIED"        // 403 - ไม่มีสิทธิ์
"DATABASE_CONNECTION_FAILED" // 500 - เชื่อมต่อฐานข้อมูลไม่ได้

// ❌ ไม่ดี - ไม่ชัดเจน ไม่สื่อความหมาย
"ERROR_1", "FAIL", "WRONG", "BAD_REQUEST", "SOMETHING_WENT_WRONG"
```

### 2. การจัดกลุ่ม Error Codes

```typescript
// services/errors/errorCodes.ts
export const ErrorCodes = {
  // User Management (1xxx)
  USER: {
    NOT_FOUND: "USER_NOT_FOUND",
    INVALID_EMAIL: "USER_INVALID_EMAIL",
    DUPLICATE_EMAIL: "USER_DUPLICATE_EMAIL",
    WEAK_PASSWORD: "USER_WEAK_PASSWORD"
  },

  // Employee Management (2xxx)
  EMPLOYEE: {
    NOT_FOUND: "EMPLOYEE_NOT_FOUND",
    DUPLICATE_ID: "EMPLOYEE_DUPLICATE_ID",
    INVALID_DEPARTMENT: "EMPLOYEE_INVALID_DEPARTMENT"
  },

  // Authentication (3xxx)
  AUTH: {
    INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
    TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
    PERMISSION_DENIED: "AUTH_PERMISSION_DENIED"
  },

  // System Errors (9xxx)
  SYSTEM: {
    DATABASE_ERROR: "SYSTEM_DATABASE_ERROR",
    NETWORK_ERROR: "SYSTEM_NETWORK_ERROR",
    INTERNAL_ERROR: "SYSTEM_INTERNAL_ERROR"
  }
} as const

// การใช้งาน
throw new AppError(ErrorCodes.USER.NOT_FOUND, "ไม่พบผู้ใช้", 404)
```

### 3. Service Layer Best Practices

```typescript
// ✅ ดี - แยก validation, business logic ชัดเจน
export const createEmployee = withErrorHandling(async (data: CreateEmployeeData) => {
  // 1. Input Validation
  await validateEmployeeInput(data)

  // 2. Business Rules Validation
  await validateBusinessRules(data)

  // 3. Database Operations
  return await saveEmployee(data)
})

async function validateEmployeeInput(data: CreateEmployeeData) {
  if (!data.name?.trim()) {
    throw new AppError(ErrorCodes.EMPLOYEE.INVALID_NAME, "ชื่อพนักงานจำเป็น", 400)
  }

  if (!data.employeeId?.match(/^EMP\d{3}$/)) {
    throw new AppError(ErrorCodes.EMPLOYEE.INVALID_ID, "รหัสพนักงานต้องเป็น EMP001-999", 400)
  }
}

async function validateBusinessRules(data: CreateEmployeeData) {
  // ตรวจสอบ ID ซ้ำ
  const existing = await db.employee.findUnique({
    where: { employeeId: data.employeeId }
  })

  if (existing) {
    throw new AppError(ErrorCodes.EMPLOYEE.DUPLICATE_ID, "รหัสพนักงานนี้มีอยู่แล้ว", 409)
  }

  // ตรวจสอบแผนกที่ถูกต้อง
  const validDepartments = ["IT", "HR", "Finance", "Marketing"]
  if (!validDepartments.includes(data.department)) {
    throw new AppError(
      ErrorCodes.EMPLOYEE.INVALID_DEPARTMENT,
      `แผนกต้องเป็น: ${validDepartments.join(", ")}`,
      400
    )
  }
}
```

### 4. Action Layer Best Practices

```typescript
// ✅ ดี - รองรับทั้ง FormData และ Object
export const createEmployeeAction = withActionHandler(async (input: FormData | CreateEmployeeData) => {
  let data: CreateEmployeeData

  if (input instanceof FormData) {
    data = {
      name: input.get("name") as string,
      employeeId: input.get("employeeId") as string,
      department: input.get("department") as string
    }
  } else {
    data = input
  }

  return createEmployee(data)
})

// ✅ ดี - มี permission checking
export const deleteEmployeeAction = withActionHandler(async (id: number) => {
  // ตรวจสอบสิทธิ์ก่อน
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    throw new AppError(ErrorCodes.AUTH.PERMISSION_DENIED, "ไม่มีสิทธิ์ลบพนักงาน", 403)
  }

  return deleteEmployee(id)
})
```

### 5. Client-side Error Handling

```typescript
// ✅ ดี - จัดการ error แต่ละ case
const handleSubmit = async (data: CreateEmployeeData) => {
  const result = await createEmployeeAction(data)

  if (result.ok) {
    addToast(`เพิ่มพนักงาน ${result.data.name} สำเร็จ`, "success")
    onSuccess?.(result.data)
  } else {
    // จัดการ error ตาม code
    const { code, message } = result.error

    switch (code) {
      case ErrorCodes.EMPLOYEE.DUPLICATE_ID:
        setFieldError("employeeId", "รหัสพนักงานนี้ถูกใช้แล้ว")
        break

      case ErrorCodes.EMPLOYEE.INVALID_NAME:
      case ErrorCodes.EMPLOYEE.INVALID_ID:
        addToast(message, "error")
        break

      case ErrorCodes.AUTH.PERMISSION_DENIED:
        router.push("/login")
        break

      case ErrorCodes.SYSTEM.DATABASE_ERROR:
        addToast("เกิดปัญหาเชื่อมต่อฐานข้อมูล กรุณาลองใหม่", "error")
        break

      default:
        addToast(message, "error")
    }
  }
}
```

### 6. Error Monitoring & Logging

```typescript
// lib/errors/errorLogger.ts
export function logError(error: AppError, context?: any) {
  const errorData = {
    code: error.code,
    message: error.message,
    status: error.status,
    meta: error.meta,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack
  }

  // Development
  if (process.env.NODE_ENV === "development") {
    console.error("AppError:", errorData)
  }

  // Production - ส่งไป monitoring service
  if (process.env.NODE_ENV === "production") {
    // Sentry, LogRocket, etc.
    sendToMonitoringService(errorData)
  }
}

// อัพเดท handleError ให้มี logging
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  const appError = error instanceof Error
    ? new AppError('INTERNAL_ERROR', error.message || 'เกิดข้อผิดพลาดภายในระบบ', 500)
    : new AppError('UNKNOWN_ERROR', 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ', 500)

  // Log unexpected errors
  logError(appError, { originalError: error })

  return appError
}
```

### 7. Type Safety

```typescript
// types/api.ts
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; status: number } }

// Custom hook สำหรับ type-safe API calls
export function useApiCall<T>() {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: string | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const call = async (apiFunction: () => Promise<ApiResponse<T>>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const result = await apiFunction()

    if (result.ok) {
      setState({ data: result.data, loading: false, error: null })
    } else {
      setState({ data: null, loading: false, error: result.error.message })
    }

    return result
  }

  return { ...state, call }
}

// การใช้งาน
const { data: employees, loading, error, call } = useApiCall<Employee[]>()

const loadEmployees = () => call(() => getEmployeesAction())
```

## 🤝 การสนับสนุน

หากมีคำถามหรือข้อเสนอแนะ สามารถ:
- เปิด Issue ใน repository
- ส่ง Pull Request เพื่อปรับปรุงโค้ด
- แชร์ความคิดเห็นและประสบการณ์การใช้งาน

---

**Happy Coding! 🚀**
