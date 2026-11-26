import vine from '@vinejs/vine'

const ticketFields = {
  title: vine.string().trim().minLength(1).maxLength(200),
  description: vine.string().trim().minLength(1),
  urgency: vine.number({ strict: true }).withoutDecimals().min(1).max(5),
  impact: vine.number({ strict: true }).withoutDecimals().min(1).max(5),
}

export const createTicketValidator = vine.create(ticketFields)

export function unknownTicketFields(body: Record<string, unknown>) {
  return Object.keys(body)
    .filter((field) => !Object.hasOwn(ticketFields, field))
    .map((field) => ({ field, rule: 'unknown', message: 'Este campo no se admite.' }))
}
