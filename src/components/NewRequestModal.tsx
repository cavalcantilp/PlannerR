import { X } from 'lucide-react'
import { useState } from 'react'
import { countBusinessDays, isoToday } from '../lib/dates'
import type { Employee, LeaveRequest, LeaveType } from '../types'

const LEAVE_TYPES: LeaveType[] = [
  'Congés payés',
  'RTT',
  'Maladie',
  'Sans solde',
  'Événement familial',
]

export default function NewRequestModal({
  employees,
  onClose,
  onCreate,
}: {
  employees: Employee[]
  onClose: () => void
  onCreate: (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void
}) {
  const today = isoToday()
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? '')
  const [type, setType] = useState<LeaveType>('Congés payés')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const days = countBusinessDays(startDate, endDate)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!employeeId) {
      setError('Veuillez sélectionner un salarié.')
      return
    }
    if (endDate < startDate) {
      setError('La date de fin doit être postérieure à la date de début.')
      return
    }
    if (days === 0) {
      setError('La période sélectionnée ne contient aucun jour ouvré.')
      return
    }
    onCreate({ employeeId, type, startDate, endDate, days, reason })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Nouvelle demande de congé
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Salarié</span>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Type de congé</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Date de début</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Date de fin</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <p className="text-xs text-slate-500">
            {days} jour{days > 1 ? 's' : ''} ouvré{days > 1 ? 's' : ''} sélectionné
            {days > 1 ? 's' : ''}
          </p>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Motif (facultatif)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Précisez le motif de la demande..."
              className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
