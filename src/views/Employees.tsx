import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Avatar from '../components/Avatar'
import type { Employee } from '../types'

export default function Employees({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.department} ${e.role}`
        .toLowerCase()
        .includes(q),
    )
  }, [employees, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Salariés</h1>
          <p className="text-sm text-slate-500">
            {employees.length} salarié{employees.length > 1 ? 's' : ''} dans l'équipe
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un salarié..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((employee) => (
          <div
            key={employee.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <Avatar employee={employee} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {employee.firstName} {employee.lastName}
                </p>
                <p className="truncate text-xs text-slate-500">{employee.role}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                {employee.department}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {employee.balancePaid}
                </p>
                <p className="text-xs text-slate-500">jours CP restants</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {employee.balanceRtt}
                </p>
                <p className="text-xs text-slate-500">RTT restants</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">
            Aucun salarié ne correspond à votre recherche.
          </p>
        )}
      </div>
    </div>
  )
}
