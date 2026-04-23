'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import EmojiPicker from './EmojiPicker'

interface ChatRoomProps {
  roomId: number
  userId: string
  userRole: string
}

export default function ChatRoom({ roomId, userId, userRole }: ChatRoomProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [animatedEmojis, setAnimatedEmojis] = useState<string[]>([])

  // რეალურ დროში მესიჯების მიღება
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    fetchMessages()
    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(username, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const addReaction = async (messageId: number, emoji: string) => {
    await supabase
      .from('message_reactions')
      .upsert({ message_id: messageId, user_id: userId, emoji })
  }

  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* ონლაინ პანელი */}
      <div className="bg-base-200 p-2 flex gap-2 overflow-x-auto">
        {Array.from(onlineUsers).map(uid => (
          <div key={uid} className="avatar online">
            <div className="w-8 rounded-full">
              <img src="/avatar-placeholder.png" />
            </div>
          </div>
        ))}
      </div>

      <MessageList 
        messages={messages} 
        currentUserId={userId}
        onReaction={addReaction}
        canDelete={userRole === 'admin' || userRole === 'founder'}
      />

      <MessageInput 
        roomId={roomId} 
        userId={userId}
        animatedEmojis={animatedEmojis}
      />

      <EmojiPicker 
        onSelect={(emoji) => console.log('selected', emoji)}
        animatedEmojis={animatedEmojis}
        isAdmin={userRole === 'admin' || userRole === 'founder'}
        onAddAnimatedEmoji={async (emoji) => {
          await supabase.from('global_emojis').insert({ emoji, is_animated: true, added_by: userId })
          setAnimatedEmojis(prev => [...prev, emoji])
        }}
      />
    </div>
  )
}
