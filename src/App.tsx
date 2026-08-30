import { useState } from 'react'
import NewRequestModal from './components/NewRequestModal'
import ProfileSwitcher from './components/ProfileSwitcher'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import {
  MANAGER_NAME,
  employees as initialEmployees,
  leaveRequests as initialRequests,
} from './data'
import { fireNativeNotification } from './lib/notifications'
import type { AppNotification, LeaveRequest, LeaveStatus, Role } from './types'
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

let nextId = initialRequests.length + 1
let nextCommentId = 1
let nextNotificationId = 1

function App() {
  const [role, setRole] = useState<Role>('manager')
  const [viewerEmployeeId, setViewerEmployeeId] = useState(initialEmployees[0]?.id ?? '')
  const [view, setView] = useState<View>('dashboard')
  const [employees] = useState(initialEmployees)
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)

  const currentEmployee = employees.find((e) => e.id === viewerEmployeeId)

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
    setIsModalOpen(false)

    const employee = employees.find((e) => e.id === data.employeeId)
    pushNotification(
      'manager',
      `${employee ? `${employee.firstName} ${employee.lastName}` : 'Un salarié'} a soumis une demande de ${data.type.toLowerCase()}.`,
      'info',
    )

    setView(role === 'manager' ? 'requests' : 'my-requests')
  }

  function handleAddComment(requestId: string, message: string) {
    const authorName = role === 'manager' ? MANAGER_NAME : `${currentEmployee?.firstName} ${currentEmployee?.lastName}`
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
    pushNotification(audience, `Nouveau commentaire sur votre demande de ${request.type.toLowerCase()}.`, 'info')
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

  const visibleAudience = role === 'manager' ? 'manager' : viewerEmployeeId
  const visibleNotifications = notifications.filter((n) => n.audience === visibleAudience)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        role={role}
        active={view}
        onNavigate={setView}
        onNewRequest={() => setIsModalOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          role={role}
          currentEmployee={currentEmployee}
          notifications={visibleNotifications}
          onMarkAllRead={handleMarkAllRead}
          onOpenSwitcher={() => setIsSwitcherOpen(true)}
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
                onUpdateStatus={handleUpdateStatus}
                onAddComment={handleAddComment}
              />
            )}
            {view === 'employees' && <Employees employees={employees} />}
            {view === 'calendar' && (
              <Calendar
                employees={employees}
                requests={requests}
                role={role}
                viewerEmployeeId={viewerEmployeeId}
              />
            )}
            {view === 'my-dashboard' && currentEmployee && (
              <EmployeeDashboard employee={currentEmployee} requests={requests} />
            )}
            {view === 'my-requests' && currentEmployee && (
              <EmployeeRequests
                employee={currentEmployee}
                requests={requests}
                onAddComment={handleAddComment}
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
          onCreate={handleCreateRequest}
        />
      )}

      {isSwitcherOpen && (
        <ProfileSwitcher
          employees={employees}
          role={role}
          employeeId={viewerEmployeeId}
          onClose={() => setIsSwitcherOpen(false)}
          onApply={handleApplyProfile}
        />
      )}
    </div>
  )
}

export default App
