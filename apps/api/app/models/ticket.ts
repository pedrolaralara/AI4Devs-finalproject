import { afterSave, BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import Comment from '#models/comment'
import TicketEvent from '#models/ticket_event'
import type { TicketStatus } from '#models/ticket_types'
import User from '#models/user'

export default class Ticket extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: 'request'

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare status: TicketStatus

  @column()
  declare urgency: number

  @column()
  declare impact: number

  @column()
  declare readonly priority: number

  @column()
  declare reporterId: string

  @column()
  declare assigneeId: string | null

  @column.dateTime()
  declare solvedAt: DateTime | null

  @column.dateTime()
  declare closedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'reporterId' })
  declare reporter: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @hasMany(() => TicketEvent)
  declare events: HasMany<typeof TicketEvent>

  @afterSave()
  static async refreshGeneratedFields(ticket: Ticket) {
    await ticket.refresh()
  }
}
