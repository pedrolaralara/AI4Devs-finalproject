export interface TicketReporter {
  id: string
  fullName: string
}

export interface CreatedTicket {
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
  assignee: null
  solvedAt: null
  closedAt: null
  createdAt: string
  updatedAt: string
}
