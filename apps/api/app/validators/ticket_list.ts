import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { ticketStatuses, validTicketId } from '#models/ticket_types'

const sorts = [
  '-priority',
  'priority',
  '-createdAt',
  'createdAt',
  '-updatedAt',
  'updatedAt',
] as const

const idOrAlias = vine.createRule<string[]>((value, aliases, field) => {
  if (typeof value === 'string' && !aliases.includes(value) && !validTicketId(value)) {
    field.report(
      'Usa un identificador decimal válido o un alias admitido.',
      'ticketFilterId',
      field,
    )
  }
})

const statusPattern = ticketStatuses.join('|')
const statusCsv = new RegExp(`^(?:${statusPattern})(?:,(?:${statusPattern}))*$`)

export const ticketListValidator = vine.create({
  status: vine.string().regex(statusCsv).optional(),
  priority: vine
    .string()
    .regex(/^[1-5](?:,[1-5])*$/)
    .optional(),
  assigneeId: vine
    .string()
    .use(idOrAlias(['me', 'none']))
    .optional(),
  reporterId: vine
    .string()
    .use(idOrAlias(['me']))
    .optional(),
  q: vine.string().trim().maxLength(100).optional(),
  sort: vine.enum(sorts).optional(),
  page: vine
    .number()
    .withoutDecimals()
    .min(1)
    .max(Math.floor(Number.MAX_SAFE_INTEGER / 100))
    .optional(),
  perPage: vine.number().withoutDecimals().min(1).max(100).optional(),
})

export type TicketListQuery = Infer<typeof ticketListValidator>
