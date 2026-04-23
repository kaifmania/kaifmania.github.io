'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ChatRoom from '@/components/ChatRoom'
import FriendsList from '@/components/FriendsList'
import PMIndicator from '@/components/PMIndicator'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import VoiceRecorder from '@/components/VoiceRecorder'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedRoom, setSelectedRoom] = useState(1)
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    fetchRooms()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  const fetchRooms = async () => {
    const { data } = await supabase.from('rooms').select('*').order('room_number')
    if (data) setRooms(data)
  }

  if (!session) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div>
          <h1 className="text-5xl font-bold animate-pulse">💬 ჩატი</h1>
          <div className="mt-8 flex gap-4">
            <a href="/login" className="btn btn-primary">შესვლა</a>
            <a href="/register" className="btn btn-secondary">რეგისტრაცია</a>
          </div>
        </div>
      </div>
    </div>
  )

  if (profile?.banned) return (
    <div className="hero min-h-screen">
      <div className="alert alert-error">თქვენ დაბლოკილი ხართ!</div>
    </div>
  )

  return (
    <div className="drawer drawer-mobile">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        {/* Header */}
        <div className="navbar bg-base-300">
          <div className="flex-1">
            <label htmlFor="drawer" className="btn btn-ghost btn-circle lg:hidden">☰</label>
            <span className="font-bold text-xl">✨ ოთახი {selectedRoom}</span>
          </div>
          <div className="flex gap-2">
            <VoiceRecorder userId={session.user.id} />
            <PMIndicator userId={session.user.id} />
            <ThemeSwitcher userId={session.user.id} />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <span className="text-2xl">{profile?.status_emoji || '😊'}</span>
              </div>
              <div className="dropdown-content z-50 card w-64 bg-base-200">
                <div className="card-body">
                  <p>{profile?.username}</p>
                  <p className="text-sm">როლი: {profile?.role}</p>
                  <button onClick={() => supabase.auth.signOut()} className="btn btn-sm btn-error">გასვლა</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <ChatRoom 
          roomId={selectedRoom} 
          userId={session.user.id}
          userRole={profile?.role}
        />
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="drawer" className="drawer-overlay"></label>
        <div className="menu p-4 w-80 bg-base-200 h-full">
          <h2 className="font-bold text-xl mb-4">🏠 ოთახები</h2>
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.room_number)}
              className={`btn btn-ghost justify-start my-1 ${selectedRoom === room.room_number ? 'btn-active' : ''}`}
            >
              {room.room_number}. {room.name}
            </button>
          ))}
          
          <div className="divider"></div>
          <FriendsList userId={session.user.id} userRole={profile?.role} />
          
          {(profile?.role === 'admin' || profile?.role === 'founder') && (
            <div className="mt-4">
              <h3 className="font-bold">🔧 ადმინ პანელი</h3>
              <button className="btn btn-sm btn-warning w-full mt-2" onClick={() => alert('სმაილების მართვა')}>
                ➕ მოძრავი სმაილის დამატება
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
