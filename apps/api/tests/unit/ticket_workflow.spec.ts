import { test } from '@japa/runner'
import type { TicketStatus } from '#models/ticket_types'
import {
  type AvailableTransition,
  availableTransitions,
  type WorkflowActor,
} from '#services/ticket_workflow'

const roles = {
  requesterReporter: { id: 'requester', role: 'requester' },
  requesterOther: { id: 'requester-other', role: 'requester' },
  agentAssigned: { id: 'agent-assigned', role: 'agent' },
  agentOther: { id: 'agent-other', role: 'agent' },
  supervisorReporter: { id: 'supervisor', role: 'supervisor' },
  supervisorOther: { id: 'supervisor-other', role: 'supervisor' },
} as const satisfies Record<string, WorkflowActor>

const assigneeRequired = { to: 'assigned', requiresAssignee: true } as const

function actions(...destinations: TicketStatus[]): AvailableTransition[] {
  return destinations.map((to) => ({ to, requiresAssignee: false }))
}

// Expected outcomes come from PRD §6. The model never reads the implementation's transition table.
const expected = {
  open: {
    requesterReporter: actions('canceled'),
    requesterOther: [],
    agentAssigned: actions('assigned'),
    agentOther: actions('assigned'),
    supervisorReporter: [assigneeRequired, ...actions('canceled')],
    supervisorOther: [assigneeRequired, ...actions('canceled')],
  },
  assigned: {
    requesterReporter: actions('canceled'),
    requesterOther: [],
    agentAssigned: actions('in_progress', 'canceled'),
    agentOther: [],
    supervisorReporter: [assigneeRequired, ...actions('in_progress', 'canceled')],
    supervisorOther: [assigneeRequired, ...actions('in_progress', 'canceled')],
  },
  in_progress: {
    requesterReporter: actions('canceled'),
    requesterOther: [],
    agentAssigned: actions('pending_user', 'solved', 'canceled'),
    agentOther: [],
    supervisorReporter: actions('pending_user', 'solved', 'canceled'),
    supervisorOther: actions('pending_user', 'solved', 'canceled'),
  },
  pending_user: {
    requesterReporter: actions('canceled'),
    requesterOther: [],
    agentAssigned: actions('in_progress', 'canceled'),
    agentOther: [],
    supervisorReporter: actions('in_progress', 'canceled'),
    supervisorOther: actions('in_progress', 'canceled'),
  },
  solved: {
    requesterReporter: actions('closed'),
    requesterOther: [],
    agentAssigned: [],
    agentOther: [],
    supervisorReporter: actions('closed'),
    supervisorOther: [],
  },
  closed: {
    requesterReporter: [],
    requesterOther: [],
    agentAssigned: [],
    agentOther: [],
    supervisorReporter: [],
    supervisorOther: [],
  },
  canceled: {
    requesterReporter: [],
    requesterOther: [],
    agentAssigned: [],
    agentOther: [],
    supervisorReporter: [],
    supervisorOther: [],
  },
} satisfies Record<TicketStatus, Record<keyof typeof roles, AvailableTransition[]>>

const cases = (Object.keys(expected) as TicketStatus[]).flatMap((status) =>
  (Object.keys(roles) as (keyof typeof roles)[]).map((relation) => ({ status, relation })),
)

test('matches workflow availability for {status} and {relation}')
  .with(cases)
  .run(({ assert }, { status, relation }) => {
    const actor = roles[relation]
    const ticket = {
      status,
      reporterId:
        relation === 'supervisorReporter'
          ? roles.supervisorReporter.id
          : roles.requesterReporter.id,
      assigneeId: status === 'open' ? null : roles.agentAssigned.id,
    }

    assert.sameDeepMembers(availableTransitions(ticket, actor), expected[status][relation])
  })
