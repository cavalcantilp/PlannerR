import { ChevronDown } from 'lucide-react'
import NotificationBell from './NotificationBell'
import type { AppNotification, Employee, Role } from '../types'
import { MANAGER_NAME } from '../data'
import Avatar from './Avatar'

const MANAGER_AVATAR: Employee = {
  id: 'manager',
  firstName: 'Sophie',
  lastName: 'Martin',
  department: 'Direction',
  role: 'Manager',
  color: '#0f172a',
  balancePaid: 0,
  balanceRtt: 0,
}

export default function TopBar({
  role,
  currentEmployee,
  notifications,
  onMarkAllRead,
  onOpenSwitcher,
}: {
  role: Role
  currentEmployee: Employee | undefined
  notifications: AppNotification[]
  onMarkAllRead: () => void
  onOpenSwitcher: () => void
}) {
  const displayEmployee = role === 'manager' ? MANAGER_AVATAR : currentEmployee
  const name =
    role === 'manager'
      ? MANAGER_NAME
      : currentEmployee
        ? `${currentEmployee.firstName} ${currentEmployee.lastName}`
        : ''

  return (
    <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-3 sm:px-8">
      <NotificationBell notifications={notifications} onMarkAllRead={onMarkAllRead} />
      <button
        type="button"
        onClick={onOpenSwitcher}
        className="flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-3 text-sm hover:bg-slate-50"
      >
        {displayEmployee && <Avatar employee={displayEmployee} size={26} />}
        <span className="flex flex-col items-start leading-tight">
          <span className="font-medium text-slate-800">{name}</span>
          <span className="text-[11px] text-slate-400">
            {role === 'manager' ? 'Manager' : 'Salarié'}
          </span>
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
    </div>
  )
}
