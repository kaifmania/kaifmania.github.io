'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const themes = [
  { name: 'Dark', value: 'dark', bg: '#1d232a', text: '#fff' },
  { name: 'Light', value: 'light', bg: '#fff', text: '#000' },
  { name: 'Forest', value: 'forest', bg: '#1e3a2f', text: '#d4f5d4' },
  { name: 'Ocean', value: 'ocean', bg: '#0a2f44', text: '#a0e0ff' },
  { name: 'Sunset', value: 'sunset', bg: '#4a1a2e', text: '#f7c6a0' },
  { name: 'Pastel', value: 'pastel', bg: '#f3e5f5', text: '#4a148c' },
  { name: 'Midnight', value: 'midnight', bg: '#110f1f', text: '#c5c5f0' },
  { name: 'Coffee', value: 'coffee', bg: '#3e2723', text: '#d7ccc8' },
  { name: 'Sky', value: 'sky', bg: '#87ceeb', text: '#001f3f' },
  { name: 'Cherry', value: 'cherry', bg: '#5e1a2a', text: '#ffc0cb' }
]

export default function ThemeSwitcher({ userId }: { userId: string }) {
  const [currentTheme, setCurrentTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setCurrentTheme(saved)
    else document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  const changeTheme = async (themeValue: string) => {
    setCurrentTheme(themeValue)
    document.documentElement.setAttribute('data-theme', themeValue)
    localStorage.setItem('theme', themeValue)
    
    if (userId) {
      await supabase.from('profiles').update({ theme: themeValue }).eq('id', userId)
    }
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} className="btn btn-ghost btn-circle">
        🎨
      </div>
      <div className="dropdown-content z-50 card card-compact w-64 bg-base-200 shadow">
        <div className="card-body">
          <h3 className="font-bold">აირჩიე თემა</h3>
          <div className="grid grid-cols-2 gap-1">
            {themes.map(theme => (
              <button
                key={theme.value}
                onClick={() => changeTheme(theme.value)}
                className={`btn btn-sm ${currentTheme === theme.value ? 'btn-primary' : 'btn-ghost'}`}
                style={{ backgroundColor: theme.bg, color: theme.text }}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
