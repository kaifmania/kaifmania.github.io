import { createClient } from '@/lib/supabaseClient'
import { ThemeProvider } from '@/components/ThemeProvider'
import { FloatingHearts } from '@/components/FloatingHearts'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="ka">
      <body className="transition-colors duration-300">
        <ThemeProvider>
          {children}
          <FloatingHearts />
        </ThemeProvider>
      </body>
    </html>
  )
}
