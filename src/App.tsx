import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import NewRequestModal from './components/NewRequestModal'
import ProfileSwitcher from './components/ProfileSwitcher'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import {
  MANAGER_NAME,
  employees as initialEmployees,
  leaveRequests as initialRequests,
} from './data'
import { useAppData } from './hooks/useAppData'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { fireNativeNotification } from './lib/notifications'
import { isSupabaseConfigured } from './lib/supabaseClient'
import type { AppNotification, Employee, LeaveRequest, LeaveStatus, Role } from './types'
import Auth from './views/Auth'
import Calendar from './views/Calendar'
import Dashboard from './views/Dashboard'
import EmployeeDashboard from './views/EmployeeDashboard'
import EmployeeRequests from './views/EmployeeRequests'
import Employees from './views/Employees'
import LeaveRequestsView from './views/LeaveRequests'

export type View =
  | 'dashboard'
  | 'requests'
  | 'employees'
  | 'calendar'
  | 'my-dashboard'
  | 'my-requests'

const MANAGER_AVATAR: Employee = {
  id: 'manager',
  firstName: 'Sophie',
  lastName: 'Martin',
  department: 'Direction',
  role: 'Manager',
  color: '#0f172a',
  balancePaid: 0,
  balanceRtt: 0,
}

let nextId = initialRequests.length + 1
let nextCommentId = 1
let nextNotificationId = 1

/** Coquille applicative partagée par le mode démo et le mode connecté. */
function AppShell({
  role,
  view,
  onNavigate,
  employees,
  requests,
  notifications,
  currentEmployee,
  topBarName,
  topBarAvatar,
  topBarMenuItems,
  onUpdateStatus,
  onCreateRequest,
  onAddComment,
  onMarkAllRead,
  onPromote,
}: {
  role: Role
  view: View
  onNavigate: (view: View) => void
  employees: Employee[]
  requests: LeaveRequest[]
  notifications: AppNotification[]
  currentEmployee: Employee | undefined
  topBarName: string
  topBarAvatar: Employee | undefined
  topBarMenuItems: { label: string; onClick: () => void }[]
  onUpdateStatus: (id: string, status: LeaveStatus) => void
  onCreateRequest: (
    data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'comments'>,
  ) => void
  onAddComment: (requestId: string, message: string) => void
  onMarkAllRead: () => void
  onPromote?: (employeeId: string) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        role={role}
        active={view}
        onNavigate={onNavigate}
        onNewRequest={() => setIsModalOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          role={role}
          name={topBarName}
          avatarEmployee={topBarAvatar}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          menuItems={topBarMenuItems}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
            {view === 'dashboard' && (
              <Dashboard employees={employees} requests={requests} />
            )}
            {view === 'requests' && (
              <LeaveRequestsView
                employees={employees}
                requests={requests}
                onUpdateStatus={onUpdateStatus}
                onAddComment={onAddComment}
              />
            )}
            {view === 'employees' && (
              <Employees employees={employees} onPromote={onPromote} />
            )}
            {view === 'calendar' && (
              <Calendar
                employees={employees}
                requests={requests}
                role={role}
                viewerEmployeeId={currentEmployee?.id ?? ''}
              />
            )}
            {view === 'my-dashboard' && currentEmployee && (
              <EmployeeDashboard employee={currentEmployee} requests={requests} />
            )}
            {view === 'my-requests' && currentEmployee && (
              <EmployeeRequests
                employee={currentEmployee}
                requests={requests}
                onAddComment={onAddComment}
              />
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <NewRequestModal
          employees={employees}
          lockedEmployee={role === 'employee' ? currentEmployee : undefined}
          onClose={() => setIsModalOpen(false)}
          onCreate={(data) => {
            onCreateRequest(data)
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

/** Mode démo : données fictives en mémoire, sélecteur de profil manuel. */
function DemoApp() {
  const [role, setRole] = useState<Role>('manager')
  const [viewerEmployeeId, setViewerEmployeeId] = useState(initialEmployees[0]?.id ?? '')
  const [view, setView] = useState<View>('dashboard')
  const [employees] = useState(initialEmployees)
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)

  const currentEmployee = employees.find((e) => e.id === viewerEmployeeId)
  const visibleAudience = role === 'manager' ? 'manager' : viewerEmployeeId

  function pushNotification(
    audience: AppNotification['audience'],
    message: string,
    tone: AppNotification['tone'],
  ) {
    const notification: AppNotification = {
      id: `ntf-${nextNotificationId++}`,
      audience,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      tone,
    }
    setNotifications((prev) => [notification, ...prev])
    fireNativeNotification('PlannerR', message)
  }

  function handleUpdateStatus(id: string, status: LeaveStatus) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    const request = requests.find((r) => r.id === id)
    if (!request) return
    const employee = employees.find((e) => e.id === request.employeeId)
    if (!employee) return
    pushNotification(
      employee.id,
      `Votre demande de ${request.type.toLowerCase()} (${request.startDate}) a été ${
        status === 'Approuvé' ? 'approuvée' : 'refusée'
      }.`,
      status === 'Approuvé' ? 'success' : 'warning',
    )
  }

  function handleCreateRequest(
    data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'comments'>,
  ) {
    const newRequest: LeaveRequest = {
      ...data,
      id: `req-${nextId++}`,
      status: 'En attente',
      createdAt: new Date().toISOString().slice(0, 10),
      comments: [],
    }
    setRequests((prev) => [newRequest, ...prev])

    const employee = employees.find((e) => e.id === data.employeeId)
    pushNotification(
      'manager',
      `${employee ? `${employee.firstName} ${employee.lastName}` : 'Un salarié'} a soumis une demande de ${data.type.toLowerCase()}.`,
      'info',
    )
    setView(role === 'manager' ? 'requests' : 'my-requests')
  }

  function handleAddComment(requestId: string, message: string) {
    const authorName =
      role === 'manager'
        ? MANAGER_NAME
        : `${currentEmployee?.firstName} ${currentEmployee?.lastName}`
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              comments: [
                ...r.comments,
                {
                  id: `cmt-${nextCommentId++}`,
                  author: authorName,
                  authorRole: role,
                  message,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : r,
      ),
    )
    const request = requests.find((r) => r.id === requestId)
    if (!request) return
    const audience = role === 'manager' ? request.employeeId : 'manager'
    pushNotification(
      audience,
      `Nouveau commentaire sur votre demande de ${request.type.toLowerCase()}.`,
      'info',
    )
  }

  function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((n) => (n.audience === visibleAudience ? { ...n, read: true } : n)),
    )
  }

  function handleApplyProfile(nextRole: Role, nextEmployeeId: string) {
    setRole(nextRole)
    if (nextRole === 'employee') setViewerEmployeeId(nextEmployeeId)
    setView(nextRole === 'manager' ? 'dashboard' : 'my-dashboard')
    setIsSwitcherOpen(false)
  }

  const visibleNotifications = notifications.filter((n) => n.audience === visibleAudience)

  return (
    <>
      <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-800">
        Mode démo — données fictives en mémoire. Configurez Supabase (VITE_SUPABASE_URL /
        VITE_SUPABASE_ANON_KEY) pour activer les comptes réels et sécurisés.
      </div>
      <div className="h-[calc(100vh-28px)]">
        <AppShell
          role={role}
          view={view}
          onNavigate={setView}
          employees={employees}
          requests={requests}
          notifications={visibleNotifications}
          currentEmployee={currentEmployee}
          topBarName={role === 'manager' ? MANAGER_NAME : (currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}` : '')}
          topBarAvatar={role === 'manager' ? MANAGER_AVATAR : currentEmployee}
          topBarMenuItems={[
            { label: 'Changer de profil', onClick: () => setIsSwitcherOpen(true) },
          ]}
          onUpdateStatus={handleUpdateStatus}
          onCreateRequest={handleCreateRequest}
          onAddComment={handleAddComment}
          onMarkAllRead={handleMarkAllRead}
        />
      </div>

      {isSwitcherOpen && (
        <ProfileSwitcher
          employees={employees}
          role={role}
          employeeId={viewerEmployeeId}
          onClose={() => setIsSwitcherOpen(false)}
          onApply={handleApplyProfile}
        />
      )}
    </>
  )
}

const MANAGER_ONLY_VIEWS: View[] = ['dashboard', 'requests', 'employees']

/** Mode connecté : données réelles issues de Supabase, identité fixée par le compte. */
function AuthedApp({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [view, setView] = useState<View>('dashboard')
  const data = useAppData(session)

  useEffect(() => {
    if (!data.loading && data.role === 'employee' && MANAGER_ONLY_VIEWS.includes(view)) {
      setView('my-dashboard')
    }
  }, [data.loading, data.role, view])

  if (data.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Chargement…
      </div>
    )
  }

  const currentEmployee = data.currentProfile
    ? {
        id: data.currentProfile.id,
        firstName: data.currentProfile.first_name,
        lastName: data.currentProfile.last_name,
        department: data.currentProfile.department,
        role: data.currentProfile.job_title,
        color: data.currentProfile.color,
        balancePaid: data.currentProfile.balance_paid,
        balanceRtt: data.currentProfile.balance_rtt,
      }
    : undefined

  return (
    <AppShell
      role={data.role}
      view={view}
      onNavigate={setView}
      employees={data.employees}
      requests={data.requests}
      notifications={data.notifications}
      currentEmployee={currentEmployee}
      topBarName={currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}` : ''}
      topBarAvatar={currentEmployee}
      topBarMenuItems={[{ label: 'Se déconnecter', onClick: onSignOut }]}
      onUpdateStatus={data.updateStatus}
      onCreateRequest={data.createRequest}
      onAddComment={data.addComment}
      onMarkAllRead={data.markAllRead}
      onPromote={data.promoteToManager}
    />
  )
}

function SupabaseGate() {
  const { session, loading, signIn, signUp, signOut } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Chargement…
      </div>
    )
  }

  if (!session) return <Auth onSignIn={signIn} onSignUp={signUp} />

  return <AuthedApp session={session} onSignOut={signOut} />
}

function App() {
  return isSupabaseConfigured ? <SupabaseGate /> : <DemoApp />
}

export default App
