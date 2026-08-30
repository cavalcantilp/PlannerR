export type LeaveType =
  | 'Congés payés'
  | 'RTT'
  | 'Maladie'
  | 'Sans solde'
  | 'Événement familial'

export type LeaveStatus = 'En attente' | 'Approuvé' | 'Refusé'

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
}
