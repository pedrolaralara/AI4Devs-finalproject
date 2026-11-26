import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`CREATE TABLE ticket_events (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        ticket_id bigint NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        actor_id bigint NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        event_type ticket_event_type NOT NULL,
        field varchar(50),
        old_value text,
        new_value text,
        created_at timestamptz NOT NULL DEFAULT now()
      )`)
    this.schema.raw(
      'CREATE INDEX ticket_events_ticket_created_index ON ticket_events (ticket_id, created_at)',
    )
  }

  async down() {
    this.schema.raw('DROP TABLE ticket_events')
  }
}
