export type TicketStatus = 
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  roomId: string;
  assetId?: string;
  reportedByUserId: string;
  assignedToUserId?: string;
  issueSummary: string;
  details?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  resolvedAt?: string;
}

export interface TimetableSlot {
  id: string;
  roomId: string;
  classCode: string;
  className: string;
  facultyName: string;
  dayOfWeek: number; // 1 = Monday ... 7 = Sunday
  startTime: string; // HH:mm format e.g. "09:00"
  endTime: string;   // HH:mm format e.g. "10:30"
}

export interface RoomBooking {
  id: string;
  roomId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
