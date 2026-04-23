// components/VoiceRecorder.tsx
'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function VoiceRecorder({ userId }: { userId: string }) {
  const [recording, setRecording] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data)
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      const file = new File([blob], 'voice.webm', { type: 'audio/webm' })
      // ატვირთე Supabase Storage-ში
      const { data } = await supabase.storage.from('voices').upload(`${Date.now()}.webm`, file)
      // გაგზავნე ლინკი როგორც მესიჯი
      chunks.current = []
    }
    mediaRecorder.current.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorder.current?.stop()
    setRecording(false)
  }

  return (
    <button onClick={recording ? stopRecording : startRecording} className="btn btn-ghost btn-circle">
      {recording ? '🔴' : '🎙️'}
    </button>
  )
}
