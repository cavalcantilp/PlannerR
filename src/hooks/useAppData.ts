import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { mapLeaveRequestRow, mapProfileToEmployee } from '../lib/mappers'
import type { CommentRow, LeaveRequestRow, ProfileRow } from '../lib/mappers'
import { fireNativeNotification } from '../lib/notifications'
import { supabase } from '../lib/supabaseClient'
import type { AppNotification, LeaveRequest, LeaveStatus, Role } from '../types'

interface NotificationRow {
  id: string
  audience_role: Role | null
  audience_profile_id: string | null
  message: string
  tone: AppNotification['tone']
  read: boolean
  created_at: string
}

export function useAppData(session: Session) {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [requestRows, setRequestRows] = useState<LeaveRequestRow[]>([])
  const [commentRows, setCommentRows] = useState<CommentRow[]>([])
  const [notificationRows, setNotificationRows] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)

  const userId = session.user.id

  const refetch = useCallback(async () => {
    if (!supabase) return
    const [profilesRes, requestsRes, commentsRes, notificationsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('leave_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('request_comments').select('*'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
    ])
    setProfiles((profilesRes.data ?? []) as ProfileRow[])
    setRequestRows((requestsRes.data ?? []) as LeaveRequestRow[])
    setCommentRows((commentsRes.data ?? []) as CommentRow[])
    setNotificationRows((notificationsRes.data ?? []) as NotificationRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const profileById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles])
  const currentProfile = profileById.get(userId)
  const role: Role = currentProfile?.role ?? 'employee'

  const employees = useMemo(
    () => profiles.filter((p) => p.role === 'employee').map(mapProfileToEmployee),
    [profiles],
  )

  const requests: LeaveRequest[] = useMemo(
    () => requestRows.map((r) => mapLeaveRequestRow(r, commentRows, profileById)),
    [requestRows, commentRows, profileById],
  )

  const notifications: AppNotification[] = useMemo(
    () =>
      notificationRows.map((n) => ({
        id: n.id,
        audience: n.audience_profile_id ?? 'manager',
        message: n.message,
        createdAt: n.created_at,
        read: n.read,
        tone: n.tone,
      })),
    [notificationRows],
  )

  // Notifications en temps réel : alerte native si elle concerne l'utilisateur connecté.
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('notifications-listen')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const row = payload.new as NotificationRow
          const isMine =
            role === 'manager'
              ? row.audience_role === 'manager'
              : row.audience_profile_id === userId
          if (isMine) fireNativeNotification('PlannerR', row.message)
          refetch()
        },
      )
      .subscribe()
    return () => {
      supabase!.removeChannel(channel)
    }
  }, [role, userId, refetch])

  async function createRequest(
    data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'comments'>,
  ) {
    if (!supabase) return
    await supabase.from('leave_requests').insert({
      employee_id: data.employeeId,
      type: data.type,
      start_date: data.startDate,
      end_date: data.endDate,
      days: data.days,
      reason: data.reason,
    })
    const authorName = currentProfile
      ? `${currentProfile.first_name} ${currentProfile.last_name}`
      : 'Un salarié'
    await supabase.from('notifications').insert({
      audience_role: 'manager',
      message: `${authorName} a soumis une demande de ${data.type.toLowerCase()}.`,
      tone: 'info',
    })
    await refetch()
  }

  async function updateStatus(id: string, status: LeaveStatus) {
    if (!supabase) return
    const request = requestRows.find((r) => r.id === id)
    await supabase.from('leave_requests').update({ status }).eq('id', id)
    if (request) {
      await supabase.from('notifications').insert({
        audience_profile_id: request.employee_id,
        message: `Votre demande de ${request.type.toLowerCase()} (${request.start_date}) a été ${
          status === 'Approuvé' ? 'approuvée' : 'refusée'
        }.`,
        tone: status === 'Approuvé' ? 'success' : 'warning',
      })
    }
    await refetch()
  }

  async function addComment(requestId: string, message: string) {
    if (!supabase) return
    await supabase
      .from('request_comments')
      .insert({ request_id: requestId, author_id: userId, message })
    const request = requestRows.find((r) => r.id === requestId)
    if (request) {
      await supabase.from('notifications').insert(
        role === 'manager'
          ? {
              audience_profile_id: request.employee_id,
              message: `Nouveau commentaire sur votre demande de ${request.type.toLowerCase()}.`,
              tone: 'info',
            }
          : {
              audience_role: 'manager',
              message: `Nouveau commentaire sur une demande de ${request.type.toLowerCase()}.`,
              tone: 'info',
            },
      )
    }
    await refetch()
  }

  async function markAllRead() {
    if (!supabase) return
    const visibleAudience = role === 'manager' ? 'manager' : userId
    const unread = notifications.filter((n) => n.audience === visibleAudience && !n.read)
    await Promise.all(
      unread.map((n) => supabase!.from('notifications').update({ read: true }).eq('id', n.id)),
    )
    await refetch()
  }

  return {
    loading,
    role,
    currentProfile,
    employees,
    requests,
    notifications,
    createRequest,
    updateStatus,
    addComment,
    markAllRead,
  }
}
