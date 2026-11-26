import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw("CREATE TYPE user_role AS ENUM ('requester', 'agent', 'supervisor')")
    this.schema.raw(
      "CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'pending_user', 'solved', 'closed', 'canceled')",
    )
    this.schema.raw(
      "CREATE TYPE ticket_event_type AS ENUM ('created', 'status_changed', 'assigned', 'unassigned', 'field_updated')",
    )
  }

  async down() {
    this.schema.raw('DROP TYPE ticket_event_type')
    this.schema.raw('DROP TYPE ticket_status')
    this.schema.raw('DROP TYPE user_role')
  }
}
