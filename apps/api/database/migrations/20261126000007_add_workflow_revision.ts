import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(
      'ALTER TABLE tickets ADD COLUMN workflow_revision integer NOT NULL DEFAULT 0 CHECK (workflow_revision >= 0)',
    )
  }

  async down() {
    this.schema.raw('ALTER TABLE tickets DROP COLUMN workflow_revision')
  }
}
