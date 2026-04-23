'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PMIndicator({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [pms, setPms] = useState<any[]>([])

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('private_messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user', userId)
        .eq('seen', false)
      setUnreadCount(count || 0)
    }

    fetchUnread()

    const subscription = supabase
      .channel('pms')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `to_user=eq.${userId}`
      }, (payload) => {
        setUnreadCount(prev => prev + 1)
        setPms(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [userId])

  const markAsSeen = async (pmId: number) => {
    await supabase
      .from('private_messages')
      .update({ seen: true, seen_at: new Date() })
      .eq('id', pmId)
    setUnreadCount(prev => prev - 1)
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} className="btn btn-ghost btn-circle relative">
        💬
        {unreadCount > 0 && (
          <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="dropdown-content card card-compact w-80 bg-base-100 shadow z-50">
        <div className="card-body">
          <h3 className="card-title">პირადი მესიჯები</h3>
          {pms.map(pm => (
            <div key={pm.id} className="border-b py-2">
              <div className="flex justify-between">
                <span>{pm.content?.substring(0, 30)}</span>
                {!pm.seen && (
                  <button onClick={() => markAsSeen(pm.id)} className="btn btn-xs">✅ წაკითხული</button>
                )}
              </div>
              <div className="text-xs opacity-50">
                {new Date(pm.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
