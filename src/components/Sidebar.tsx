import {
  CalendarDays,
  LayoutDashboard,
  Plus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { View } from '../App'

const NAV_ITEMS: { view: View; label: string; icon: LucideIcon }[] = [
  { view: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { view: 'requests', label: 'Demandes de congés', icon: CalendarDays },
  { view: 'employees', label: 'Salariés', icon: Users },
]

export default function Sidebar({
  active,
  onNavigate,
  onNewRequest,
}: {
  active: View
  onNavigate: (view: View) => void
  onNewRequest: () => void
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
          P
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">PlannerR</p>
          <p className="text-xs text-slate-500">Gestion des congés</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = active === view
          return (
            <button
              key={view}
              type="button"
              onClick={() => onNavigate(view)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={onNewRequest}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus size={18} />
          Nouvelle demande
        </button>
      </div>
    </aside>
  )
}
