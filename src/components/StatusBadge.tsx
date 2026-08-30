import type { LeaveStatus } from '../types'

const STYLES: Record<LeaveStatus, string> = {
  'En attente': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Approuvé: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Refusé: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

export default function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
