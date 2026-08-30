export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateRange(startIso: string, endIso: string): string {
  if (startIso === endIso) return formatDate(startIso)
  return `${formatDate(startIso)} → ${formatDate(endIso)}`
}

export function countBusinessDays(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00`)
  const end = new Date(`${endIso}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  let count = 0
  const cursor = new Date(start)
  while (cursor <= end) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) count++
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}
