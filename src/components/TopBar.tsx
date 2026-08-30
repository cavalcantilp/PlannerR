import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AppNotification, Employee, Role } from '../types'
import Avatar from './Avatar'
import NotificationBell from './NotificationBell'

export interface TopBarMenuItem {
  label: string
  onClick: () => void
}

export default function TopBar({
  role,
  name,
  avatarEmployee,
  notifications,
  onMarkAllRead,
  menuItems,
}: {
  role: Role
  name: string
  avatarEmployee: Employee | undefined
  notifications: AppNotification[]
  onMarkAllRead: () => void
  menuItems: TopBarMenuItem[]
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-3 sm:px-8">
      <NotificationBell notifications={notifications} onMarkAllRead={onMarkAllRead} />
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-3 text-sm hover:bg-slate-50"
        >
          {avatarEmployee && <Avatar employee={avatarEmployee} size={26} />}
          <span className="flex flex-col items-start leading-tight">
            <span className="font-medium text-slate-800">{name}</span>
            <span className="text-[11px] text-slate-400">
              {role === 'manager' ? 'Manager' : 'Salarié'}
            </span>
          </span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  item.onClick()
                }}
                className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
