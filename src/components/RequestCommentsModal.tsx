import { Send, X } from 'lucide-react'
import { useState } from 'react'
import type { LeaveRequest } from '../types'
import { formatDateRange } from '../lib/dates'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RequestCommentsModal({
  request,
  employeeName,
  onClose,
  onAddComment,
}: {
  request: LeaveRequest
  employeeName: string
  onClose: () => void
  onAddComment: (message: string) => void
}) {
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return
    onAddComment(trimmed)
    setMessage('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Commentaires · {employeeName}
            </h2>
            <p className="text-xs text-slate-500">
              {request.type} · {formatDateRange(request.startDate, request.endDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto px-6 py-4">
          {request.comments.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              Aucun commentaire pour l'instant.
            </p>
          )}
          {request.comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  {c.author}{' '}
                  <span className="font-normal text-slate-400">
                    · {c.authorRole === 'manager' ? 'Manager' : 'Salarié'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">{formatTime(c.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-slate-700">{c.message}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-100 px-4 py-3"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrire un commentaire..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
            disabled={!message.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
