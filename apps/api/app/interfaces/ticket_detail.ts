import type { TicketReporter } from './created_ticket.js'

export interface TicketComment {
  id: string
  body: string
  author: TicketReporter
  createdAt: string
}

export interface TicketHistoryEntry {
  id: string
  eventType: string
  actor: TicketReporter
  field: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: string
}

export interface TicketDetail {
  id: string
  key: string
  type: string
  title: string
  description: string
  status: string
  workflowRevision: number
  urgency: number
  impact: number
  priority: number
  reporter: TicketReporter
  assignee: TicketReporter | null
  solvedAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
  comments: TicketComment[]
  history: TicketHistoryEntry[]
}
