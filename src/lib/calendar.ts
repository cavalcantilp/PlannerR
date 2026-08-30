export interface CalendarDay {
  date: Date
  iso: string
  inCurrentMonth: boolean
  isToday: boolean
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function buildMonthMatrix(year: number, month: number): CalendarDay[][] {
  const todayIso = toIso(new Date())
  const firstOfMonth = new Date(year, month, 1)
  // Monday-based week: getDay() 0=Sunday..6=Saturday
  const leadingDays = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - leadingDays)

  const weeks: CalendarDay[][] = []
  const cursor = new Date(gridStart)
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = []
    for (let d = 0; d < 7; d++) {
      const iso = toIso(cursor)
      week.push({
        date: new Date(cursor),
        iso,
        inCurrentMonth: cursor.getMonth() === month,
        isToday: iso === todayIso,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}
