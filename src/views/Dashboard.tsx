import { CalendarCheck, CalendarClock, Hourglass, Users } from 'lucide-react'
import Avatar from '../components/Avatar'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { formatDateRange, isoToday } from '../lib/dates'
import type { Employee, LeaveRequest } from '../types'

export default function Dashboard({
  employees,
  requests,
}: {
  employees: Employee[]
  requests: LeaveRequest[]
}) {
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const pending = requests.filter((r) => r.status === 'En attente')
  const today = isoToday()
  const onLeaveToday = requests.filter(
    (r) => r.status === 'Approuvé' && r.startDate <= today && today <= r.endDate,
  )
  const daysTakenThisMonth = requests
    .filter((r) => r.status === 'Approuvé' && r.startDate.slice(0, 7) === today.slice(0, 7))
    .reduce((sum, r) => sum + r.days, 0)

  const upcoming = [...requests]
    .filter((r) => r.status === 'Approuvé' && r.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5)

  const recent = [...requests]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>
        <p className="text-sm text-slate-500">
          Vue d'ensemble des congés de votre équipe
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Salariés" value={employees.length} icon={Users} tint="#6366f1" />
        <StatCard
          label="Demandes en attente"
          value={pending.length}
          icon={Hourglass}
          tint="#f59e0b"
        />
        <StatCard
          label="En congé aujourd'hui"
          value={onLeaveToday.length}
          icon={CalendarCheck}
          tint="#10b981"
        />
        <StatCard
          label="Jours pris ce mois-ci"
          value={daysTakenThisMonth}
          icon={CalendarClock}
          tint="#0ea5e9"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Prochains congés approuvés
          </h2>
          <ul className="flex flex-col gap-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-slate-400">Aucun congé à venir.</p>
            )}
            {upcoming.map((r) => {
              const employee = employeeById.get(r.employeeId)
              if (!employee) return null
              return (
                <li key={r.id} className="flex items-center gap-3">
                  <Avatar employee={employee} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.type} · {formatDateRange(r.startDate, r.endDate)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Demandes récentes
          </h2>
          <ul className="flex flex-col gap-3">
            {recent.map((r) => {
              const employee = employeeById.get(r.employeeId)
              if (!employee) return null
              return (
                <li key={r.id} className="flex items-center gap-3">
                  <Avatar employee={employee} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.type} · {formatDateRange(r.startDate, r.endDate)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
