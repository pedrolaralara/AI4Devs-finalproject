import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`CREATE TABLE users (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        full_name varchar(120) NOT NULL,
        email varchar(254) NOT NULL UNIQUE,
        password varchar(255) NOT NULL,
        role user_role NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT users_email_lowercase CHECK (email = lower(email))
      )`)
  }

  async down() {
    this.schema.raw('DROP TABLE users')
  }
}
