import type { LucideIcon } from 'lucide-react'

export default function StatCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tint: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${tint}1a`, color: tint }}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}
