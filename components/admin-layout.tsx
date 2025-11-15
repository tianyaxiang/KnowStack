import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(87,172,137,0.2),_transparent_55%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/90 px-6 py-4 shadow-sm backdrop-blur">
          <div>
            <Link href="/admin" className="text-lg font-semibold tracking-tight">
              KnowStack Admin
            </Link>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">Sage Garden Console</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              返回前台
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className={cn('flex-1 py-8', className)}>{children}</main>
      </div>
    </div>
  )
}
