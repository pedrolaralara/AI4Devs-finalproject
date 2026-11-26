import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import Ticket from '#models/ticket'
import type { TicketEventType } from '#models/ticket_types'
import User from '#models/user'

export default class TicketEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ticketId: string

  @column()
  declare actorId: string

  @column()
  declare eventType: TicketEventType

  @column()
  declare field: string | null

  @column()
  declare oldValue: string | null

  @column()
  declare newValue: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Ticket)
  declare ticket: BelongsTo<typeof Ticket>

  @belongsTo(() => User, { foreignKey: 'actorId' })
  declare actor: BelongsTo<typeof User>
}
