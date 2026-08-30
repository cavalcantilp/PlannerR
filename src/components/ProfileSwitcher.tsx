import { Briefcase, User, X } from 'lucide-react'
import { useState } from 'react'
import type { Employee, Role } from '../types'
import Avatar from './Avatar'

export default function ProfileSwitcher({
  employees,
  role,
  employeeId,
  onClose,
  onApply,
}: {
  employees: Employee[]
  role: Role
  employeeId: string
  onClose: () => void
  onApply: (role: Role, employeeId: string) => void
}) {
  const [nextRole, setNextRole] = useState<Role>(role)
  const [nextEmployeeId, setNextEmployeeId] = useState(employeeId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Changer de profil</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setNextRole('manager')}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors ${
              nextRole === 'manager'
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase size={20} />
            Manager
          </button>
          <button
            type="button"
            onClick={() => setNextRole('employee')}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors ${
              nextRole === 'employee'
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User size={20} />
            Salarié
          </button>
        </div>

        {nextRole === 'employee' && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-700">Se connecter en tant que</p>
            <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {employees.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setNextEmployeeId(e.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    nextEmployeeId === e.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Avatar employee={e} size={28} />
                  <div>
                    <p className="font-medium">
                      {e.firstName} {e.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{e.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => onApply(nextRole, nextEmployeeId)}
          className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Valider
        </button>
      </div>
    </div>
  )
}
