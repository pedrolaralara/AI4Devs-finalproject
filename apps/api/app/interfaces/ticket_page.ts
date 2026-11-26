import type { TicketReporter } from './created_ticket.js'

export interface TicketListItem {
  id: string
  key: string
  type: string
  title: string
  description: string
  status: string
  urgency: number
  impact: number
  priority: number
  reporter: TicketReporter
  assignee: TicketReporter | null
  solvedAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketPageMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export interface TicketPage {
  meta: TicketPageMeta
  data: TicketListItem[]
}
