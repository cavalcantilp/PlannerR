import { MessageSquare } from 'lucide-react'
import { useMemo, useState } from 'react'
import RequestCommentsModal from '../components/RequestCommentsModal'
import StatusBadge from '../components/StatusBadge'
import { formatDateRange } from '../lib/dates'
import type { Employee, LeaveRequest, LeaveStatus } from '../types'

const FILTERS: (LeaveStatus | 'Toutes')[] = [
  'Toutes',
  'En attente',
  'Approuvé',
  'Refusé',
]

export default function EmployeeRequests({
  employee,
  requests,
  onAddComment,
}: {
  employee: Employee
  requests: LeaveRequest[]
  onAddComment: (requestId: string, message: string) => void
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Toutes')
  const [openRequestId, setOpenRequestId] = useState<string | null>(null)

  const mine = useMemo(
    () => requests.filter((r) => r.employeeId === employee.id),
    [requests, employee.id],
  )

  const filtered = useMemo(() => {
    const list = filter === 'Toutes' ? mine : mine.filter((r) => r.status === filter)
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [mine, filter])

  const openRequest = mine.find((r) => r.id === openRequestId) ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes demandes</h1>
          <p className="text-sm text-slate-500">
            {mine.length} demande{mine.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500">
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Période</th>
              <th className="px-5 py-3 font-medium">Jours</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-800">{r.type}</td>
                <td className="px-5 py-3 text-slate-600">
                  {formatDateRange(r.startDate, r.endDate)}
                </td>
                <td className="px-5 py-3 text-slate-600">{r.days}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setOpenRequestId(r.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                  >
                    <MessageSquare size={14} />
                    {r.comments.length > 0 ? r.comments.length : ''}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            Aucune demande dans cette catégorie.
          </p>
        )}
      </div>

      {openRequest && (
        <RequestCommentsModal
          request={openRequest}
          employeeName={`${employee.firstName} ${employee.lastName}`}
          onClose={() => setOpenRequestId(null)}
          onAddComment={(message) => onAddComment(openRequest.id, message)}
        />
      )}
    </div>
  )
}
