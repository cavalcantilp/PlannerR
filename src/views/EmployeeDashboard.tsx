import { CalendarClock, Hourglass, Palmtree, Sun } from 'lucide-react'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { formatDateRange } from '../lib/dates'
import type { Employee, LeaveRequest } from '../types'

export default function EmployeeDashboard({
  employee,
  requests,
}: {
  employee: Employee
  requests: LeaveRequest[]
}) {
  const mine = requests.filter((r) => r.employeeId === employee.id)
  const pending = mine.filter((r) => r.status === 'En attente')
  const upcoming = [...mine]
    .filter((r) => r.status === 'Approuvé')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5)
  const recent = [...mine]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Bonjour {employee.firstName} 👋
        </h1>
        <p className="text-sm text-slate-500">Voici l'état de vos congés</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Jours CP restants"
          value={employee.balancePaid}
          icon={Sun}
          tint="#f59e0b"
        />
        <StatCard
          label="RTT restants"
          value={employee.balanceRtt}
          icon={Palmtree}
          tint="#10b981"
        />
        <StatCard
          label="Demandes en attente"
          value={pending.length}
          icon={Hourglass}
          tint="#6366f1"
        />
        <StatCard
          label="Congés à venir"
          value={upcoming.length}
          icon={CalendarClock}
          tint="#0ea5e9"
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Mes demandes récentes</h2>
        <ul className="flex flex-col gap-3">
          {recent.length === 0 && (
            <p className="text-sm text-slate-400">
              Vous n'avez pas encore fait de demande de congé.
            </p>
          )}
          {recent.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{r.type}</p>
                <p className="text-xs text-slate-500">
                  {formatDateRange(r.startDate, r.endDate)} · {r.days} jour
                  {r.days > 1 ? 's' : ''}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
