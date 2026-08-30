import { Check, MessageSquare, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import Avatar from '../components/Avatar'
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

export default function LeaveRequests({
  employees,
  requests,
  onUpdateStatus,
  onAddComment,
}: {
  employees: Employee[]
  requests: LeaveRequest[]
  onUpdateStatus: (id: string, status: LeaveStatus) => void
  onAddComment: (requestId: string, message: string) => void
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Toutes')
  const [openRequestId, setOpenRequestId] = useState<string | null>(null)
  const employeeById = new Map(employees.map((e) => [e.id, e]))

  const filtered = useMemo(() => {
    const list =
      filter === 'Toutes' ? requests : requests.filter((r) => r.status === filter)
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [requests, filter])

  const openRequest = requests.find((r) => r.id === openRequestId) ?? null
  const openEmployee = openRequest ? employeeById.get(openRequest.employeeId) : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Demandes de congés
          </h1>
          <p className="text-sm text-slate-500">
            {requests.length} demande{requests.length > 1 ? 's' : ''} au total
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
              <th className="px-5 py-3 font-medium">Salarié</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Période</th>
              <th className="px-5 py-3 font-medium">Jours</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const employee = employeeById.get(r.employeeId)
              if (!employee) return null
              return (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar employee={employee} size={30} />
                      <div>
                        <p className="font-medium text-slate-800">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{employee.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.type}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatDateRange(r.startDate, r.endDate)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.days}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenRequestId(r.id)}
                        title="Commentaires"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        <MessageSquare size={16} />
                      </button>
                      {r.status === 'En attente' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(r.id, 'Approuvé')}
                            title="Approuver"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(r.id, 'Refusé')}
                            title="Refuser"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            Aucune demande dans cette catégorie.
          </p>
        )}
      </div>

      {openRequest && openEmployee && (
        <RequestCommentsModal
          request={openRequest}
          employeeName={`${openEmployee.firstName} ${openEmployee.lastName}`}
          onClose={() => setOpenRequestId(null)}
          onAddComment={(message) => onAddComment(openRequest.id, message)}
        />
      )}
    </div>
  )
}
