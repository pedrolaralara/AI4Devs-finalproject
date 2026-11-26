import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`CREATE TABLE tickets (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        type varchar(20) NOT NULL DEFAULT 'request',
        title varchar(200) NOT NULL,
        description text NOT NULL,
        status ticket_status NOT NULL DEFAULT 'open',
        urgency smallint NOT NULL,
        impact smallint NOT NULL,
        priority smallint GENERATED ALWAYS AS (ceil(urgency * impact / 5.0)) STORED NOT NULL,
        reporter_id bigint NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        assignee_id bigint REFERENCES users(id) ON DELETE RESTRICT,
        solved_at timestamptz,
        closed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT tickets_type_request CHECK (type = 'request'),
        CONSTRAINT tickets_urgency_range CHECK (urgency BETWEEN 1 AND 5),
        CONSTRAINT tickets_impact_range CHECK (impact BETWEEN 1 AND 5),
        CONSTRAINT tickets_assignee_required CHECK (status IN ('open', 'canceled') OR assignee_id IS NOT NULL)
      )`)
    this.schema.raw('CREATE INDEX tickets_status_index ON tickets (status)')
    this.schema.raw('CREATE INDEX tickets_assignee_id_index ON tickets (assignee_id)')
    this.schema.raw('CREATE INDEX tickets_reporter_id_index ON tickets (reporter_id)')
    this.schema.raw('CREATE INDEX tickets_priority_index ON tickets (priority)')
    this.schema.raw('CREATE INDEX tickets_created_at_index ON tickets (created_at)')
  }

  async down() {
    this.schema.raw('DROP TABLE tickets')
  }
}
