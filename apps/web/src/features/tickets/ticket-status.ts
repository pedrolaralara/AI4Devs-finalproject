import type { TicketDetail } from './ticket-api'

export const statuses: Record<TicketDetail['status'], string> = {
  open: 'Abierto',
  assigned: 'Asignado',
  in_progress: 'En curso',
  pending_user: 'Pendiente del usuario',
  solved: 'Resuelto',
  closed: 'Cerrado',
  canceled: 'Cancelado',
}
