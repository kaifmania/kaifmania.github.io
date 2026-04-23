'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FriendsList({ userId, userRole }: { userId: string, userRole: string }) {
  const [friends, setFriends] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])

  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
  }, [userId])

  const fetchFriends = async () => {
    const { data } = await supabase
      .from('friends')
      .select('friend_id, profiles(username, status, role)')
      .eq('user_id', userId)
      .eq('status', 'accepted')
    if (data) setFriends(data)
  }

  const fetchPendingRequests = async () => {
    const { data } = await supabase
      .from('friends')
      .select('user_id, profiles(username)')
      .eq('friend_id', userId)
      .eq('status', 'pending')
    if (data) setPendingRequests(data)
  }

  const acceptRequest = async (friendUserId: string) => {
    await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('user_id', friendUserId)
      .eq('friend_id', userId)
  }

  const removeFriend = async (friendId: string) => {
    await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)
  }

  const assignRole = async (targetUserId: string, role: 'admin' | 'founder') => {
    if (userRole !== 'founder') return alert('მხოლოდ დამფუძნებელს შეუძლია')
    await supabase.from('profiles').update({ role }).eq('id', targetUserId)
  }

  const blockUser = async (targetUserId: string) => {
    if (userRole !== 'admin' && userRole !== 'founder') return
    await supabase.from('profiles').update({ banned: true }).eq('id', targetUserId)
  }

  return (
    <div className="card bg-base-200 p-4">
      <h3 className="font-bold">📒 მეგობრები</h3>
      {friends.map(f => (
        <div key={f.friend_id} className="flex justify-between items-center mt-2">
          <span>{f.profiles.username} {f.profiles.status === 'online' && '🟢'}</span>
          <div className="flex gap-1">
            <button onClick={() => removeFriend(f.friend_id)} className="btn btn-xs btn-ghost">❌</button>
            {(userRole === 'founder') && (
              <>
                <button onClick={() => assignRole(f.friend_id, 'admin')} className="btn btn-xs">👑</button>
                <button onClick={() => blockUser(f.friend_id)} className="btn btn-xs">🚫</button>
              </>
            )}
          </div>
        </div>
      ))}

      <h3 className="font-bold mt-4">⏳ მოთხოვნები</h3>
      {pendingRequests.map(req => (
        <div key={req.user_id} className="flex justify-between">
          <span>{req.profiles.username}</span>
          <button onClick={() => acceptRequest(req.user_id)} className="btn btn-xs btn-success">✅</button>
        </div>
      ))}
    </div>
  )
}
