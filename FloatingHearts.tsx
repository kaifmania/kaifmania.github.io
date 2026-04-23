'use client'
import { useEffect, useState } from 'react'

interface FloatingItem {
  id: number
  type: 'heart' | 'flower'
  left: number
  animationDuration: number
  size: number
}

export const FloatingHearts = () => {
  const [items, setItems] = useState<FloatingItem[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem: FloatingItem = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'heart' : 'flower',
        left: Math.random() * 100,
        animationDuration: 4 + Math.random() * 4,
        size: 20 + Math.random() * 30
      }
      setItems(prev => [...prev.slice(-15), newItem])
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== newItem.id))
      }, newItem.animationDuration * 1000)
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map(item => (
        <div
          key={item.id}
          className="absolute animate-float"
          style={{
            left: `${item.left}%`,
            bottom: '-50px',
            animationDuration: `${item.animationDuration}s`,
            fontSize: `${item.size}px`
          }}
        >
          {item.type === 'heart' ? '❤️' : '🌸'}
        </div>
      ))}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation: float linear forwards;
        }
      `}</style>
    </div>
  )
}
