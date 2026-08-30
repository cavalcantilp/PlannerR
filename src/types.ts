export type LeaveType =
  | 'Congés payés'
  | 'RTT'
  | 'Maladie'
  | 'Sans solde'
  | 'Événement familial'

export type LeaveStatus = 'En attente' | 'Approuvé' | 'Refusé'

export type Role = 'manager' | 'employee'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  department: string
  role: string
  color: string
  balancePaid: number
  balanceRtt: number
}

export interface RequestComment {
  id: string
  author: string
  authorRole: Role
  message: string
  createdAt: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  status: LeaveStatus
  reason: string
  createdAt: string
  comments: RequestComment[]
}

export interface AppNotification {
  id: string
  audience: 'manager' | string
  message: string
  createdAt: string
  read: boolean
  tone: 'success' | 'warning' | 'info'
}
