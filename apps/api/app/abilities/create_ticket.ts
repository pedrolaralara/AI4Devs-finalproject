import { Bouncer } from '@adonisjs/bouncer'
import type User from '#models/user'

export const createTicketAbility = Bouncer.ability(
  (user: User) => user.role === 'requester' || user.role === 'supervisor',
)
