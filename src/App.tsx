import { useState } from 'react'
import NewRequestModal from './components/NewRequestModal'
import Sidebar from './components/Sidebar'
import { employees as initialEmployees, leaveRequests as initialRequests } from './data'
import type { LeaveRequest, LeaveStatus } from './types'
import Dashboard from './views/Dashboard'
import Employees from './views/Employees'
import LeaveRequestsView from './views/LeaveRequests'

export type View = 'dashboard' | 'requests' | 'employees'

let nextId = initialRequests.length + 1

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [employees] = useState(initialEmployees)
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleUpdateStatus(id: string, status: LeaveStatus) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  function handleCreateRequest(
    data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>,
  ) {
    const newRequest: LeaveRequest = {
      ...data,
      id: `req-${nextId++}`,
      status: 'En attente',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setRequests((prev) => [newRequest, ...prev])
    setIsModalOpen(false)
    setView('requests')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        active={view}
        onNavigate={setView}
        onNewRequest={() => setIsModalOpen(true)}
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
            />
          )}
          {view === 'employees' && <Employees employees={employees} />}
        </div>
      </main>

      {isModalOpen && (
        <NewRequestModal
          employees={employees}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateRequest}
        />
      )}
    </div>
  )
}

export default App
