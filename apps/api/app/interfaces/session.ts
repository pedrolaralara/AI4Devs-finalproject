import type { UserRole } from '#models/ticket_types'

export interface SessionProfile {
  id: string
  fullName: string
  role: UserRole
}

export interface SessionError {
  code: string
  message: string
}

export interface ValidationError {
  message: string
  rule: string
  field: string
}

export interface ValidationErrors {
  errors: ValidationError[]
}
