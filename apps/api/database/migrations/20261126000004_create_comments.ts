import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`CREATE TABLE comments (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        ticket_id bigint NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        author_id bigint NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        body text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`)
    this.schema.raw(
      'CREATE INDEX comments_ticket_created_index ON comments (ticket_id, created_at)',
    )
  }

  async down() {
    this.schema.raw('DROP TABLE comments')
  }
}
