import type { Employee } from '../types'

export default function Avatar({
  employee,
  size = 36,
}: {
  employee: Employee
  size?: number
}) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        backgroundColor: employee.color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  )
}
