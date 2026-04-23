'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MessageInput({ roomId, userId }: { roomId: number, userId: string }) {
  const [message, setMessage] = useState('')
  const [format, setFormat] = useState({ bold: false, italic: false, color: '#000000' })

  const sendMessage = async () => {
    if (!message.trim()) return

    let formattedContent = message
    if (format.bold) formattedContent = `**${formattedContent}**`
    if (format.italic) formattedContent = `*${formattedContent}*`
    
    await supabase.from('messages').insert({
      room_id: roomId,
      user_id: userId,
      content: message,
      formatted_text: format
    })
    setMessage('')
  }

  return (
    <div className="p-4 bg-base-200 border-t">
      <div className="flex gap-2 mb-2">
        <button onClick={() => setFormat(f => ({ ...f, bold: !f.bold }))} className={`btn btn-xs ${format.bold ? 'btn-primary' : 'btn-ghost'}`}>
          <b>B</b>
        </button>
        <button onClick={() => setFormat(f => ({ ...f, italic: !f.italic }))} className={`btn btn-xs ${format.italic ? 'btn-primary' : 'btn-ghost'}`}>
          <i>I</i>
        </button>
        <input type="color" value={format.color} onChange={e => setFormat(f => ({ ...f, color: e.target.value }))} className="w-6 h-6" />
      </div>

      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="textarea textarea-bordered flex-1"
          placeholder="დაწერე მესიჯი..."
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          style={{ color: format.color }}
        />
        <button onClick={sendMessage} className="btn btn-primary">📤</button>
      </div>
    </div>
  )
}
