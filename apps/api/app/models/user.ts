import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import Comment from '#models/comment'
import Ticket from '#models/ticket'
import TicketEvent from '#models/ticket_event'
import type { UserRole } from '#models/ticket_types'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Ticket, { foreignKey: 'reporterId' })
  declare reportedTickets: HasMany<typeof Ticket>

  @hasMany(() => Ticket, { foreignKey: 'assigneeId' })
  declare assignedTickets: HasMany<typeof Ticket>

  @hasMany(() => Comment, { foreignKey: 'authorId' })
  declare comments: HasMany<typeof Comment>

  @hasMany(() => TicketEvent, { foreignKey: 'actorId' })
  declare ticketEvents: HasMany<typeof TicketEvent>
}
