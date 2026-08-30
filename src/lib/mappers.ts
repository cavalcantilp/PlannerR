import type { Employee, LeaveRequest, RequestComment, Role } from '../types'

export interface ProfileRow {
  id: string
  first_name: string
  last_name: string
  department: string
  job_title: string
  color: string
  role: Role
  balance_paid: number
  balance_rtt: number
}

export interface LeaveRequestRow {
  id: string
  employee_id: string
  type: string
  start_date: string
  end_date: string
  days: number
  status: LeaveRequest['status']
  reason: string
  created_at: string
}

export interface CommentRow {
  id: string
  request_id: string
  author_id: string
  message: string
  created_at: string
}

export function mapProfileToEmployee(row: ProfileRow): Employee {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    department: row.department,
    role: row.job_title,
    color: row.color,
    balancePaid: row.balance_paid,
    balanceRtt: row.balance_rtt,
  }
}

export function mapCommentRow(
  row: CommentRow,
  profileById: Map<string, ProfileRow>,
): RequestComment {
  const author = profileById.get(row.author_id)
  return {
    id: row.id,
    author: author ? `${author.first_name} ${author.last_name}` : 'Utilisateur',
    authorRole: author?.role ?? 'employee',
    message: row.message,
    createdAt: row.created_at,
  }
}

export function mapLeaveRequestRow(
  row: LeaveRequestRow,
  comments: CommentRow[],
  profileById: Map<string, ProfileRow>,
): LeaveRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    type: row.type as LeaveRequest['type'],
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    status: row.status,
    reason: row.reason,
    createdAt: row.created_at,
    comments: comments
      .filter((c) => c.request_id === row.id)
      .map((c) => mapCommentRow(c, profileById))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }
}
