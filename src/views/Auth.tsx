import { useState } from 'react'
import type { SignUpParams } from '../hooks/useSupabaseAuth'
import type { Role } from '../types'

export default function Auth({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>
  onSignUp: (params: SignUpParams) => Promise<{ error: string | null }>
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [role, setRole] = useState<Role>('employee')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    if (mode === 'signin') {
      const { error } = await onSignIn(email, password)
      if (error) setError(error)
    } else {
      const { error } = await onSignUp({
        email,
        password,
        firstName,
        lastName,
        department,
        jobTitle,
        role,
      })
      if (error) {
        setError(error)
      } else {
        setInfo('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.')
        setMode('signin')
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            P
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">PlannerR</p>
            <p className="text-xs text-slate-500">Gestion des congés</p>
          </div>
        </div>

        <div className="mb-5 flex rounded-lg border border-slate-200 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
              mode === 'signin' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
              mode === 'signup' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Service"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Poste"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    role === 'employee'
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Salarié
                </button>
                <button
                  type="button"
                  onClick={() => setRole('manager')}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    role === 'manager'
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Manager
                </button>
              </div>
            </>
          )}

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresse email"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}
