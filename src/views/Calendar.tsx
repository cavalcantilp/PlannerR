import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { buildMonthMatrix, monthLabel, WEEKDAY_LABELS } from '../lib/calendar'
import type { Employee, LeaveRequest, Role } from '../types'

export default function Calendar({
  employees,
  requests,
  role,
  viewerEmployeeId,
}: {
  employees: Employee[]
  requests: LeaveRequest[]
  role: Role
  viewerEmployeeId: string
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const weeks = buildMonthMatrix(year, month)

  const visibleRequests =
    role === 'manager'
      ? requests.filter((r) => r.status === 'Approuvé')
      : requests.filter(
          (r) => r.employeeId === viewerEmployeeId && r.status !== 'Refusé',
        )

  function requestsOnDay(iso: string) {
    return visibleRequests.filter((r) => r.startDate <= iso && iso <= r.endDate)
  }

  function goPrev() {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function goNext() {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Calendrier</h1>
          <p className="text-sm text-slate-500">
            {role === 'manager'
              ? "Vue d'ensemble des congés approuvés de l'équipe"
              : 'Vos congés sur le mois'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="w-36 text-center text-sm font-medium capitalize text-slate-800">
            {monthLabel(year, month)}
          </p>
          <button
            type="button"
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((day) => {
            const dayRequests = requestsOnDay(day.iso)
            return (
              <div
                key={day.iso}
                className={`flex min-h-24 flex-col gap-1 border-b border-r border-slate-50 p-1.5 ${
                  day.inCurrentMonth ? 'bg-white' : 'bg-slate-50/60'
                }`}
              >
                <span
                  className={`self-end text-xs ${
                    day.isToday
                      ? 'flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white'
                      : day.inCurrentMonth
                        ? 'text-slate-600'
                        : 'text-slate-300'
                  }`}
                >
                  {day.date.getDate()}
                </span>
                <div className="flex flex-col gap-0.5">
                  {dayRequests.slice(0, 3).map((r) => {
                    const employee = employeeById.get(r.employeeId)
                    if (!employee) return null
                    return (
                      <div
                        key={r.id}
                        title={`${employee.firstName} ${employee.lastName} · ${r.type}`}
                        className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: employee.color }}
                      >
                        {employee.firstName}
                      </div>
                    )
                  })}
                  {dayRequests.length > 3 && (
                    <span className="text-[10px] text-slate-400">
                      +{dayRequests.length - 3} autre{dayRequests.length - 3 > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
