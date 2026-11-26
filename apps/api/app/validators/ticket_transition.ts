import vine from '@vinejs/vine'
import { ticketStatuses } from '#models/ticket_types'

const transitionFields = {
  to: vine.enum(ticketStatuses),
  expectedRevision: vine.number({ strict: true }).withoutDecimals().min(0).max(2147483647),
  assigneeId: vine
    .string()
    .regex(/^[1-9][0-9]{0,18}$/)
    .optional(),
}

export const ticketTransitionValidator = vine.create(transitionFields)

export function unknownTransitionFields(body: Record<string, unknown>) {
  return Object.keys(body)
    .filter((field) => !Object.hasOwn(transitionFields, field))
    .map((field) => ({ field, rule: 'unknown', message: 'Este campo no se admite.' }))
}
