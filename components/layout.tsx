import * as React from 'react'
import { ThemeToggle } from './theme-toggle'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center space-x-2">
              <span className="font-bold">KnowStack</span>
            </a>
            <nav className="flex items-center gap-6 text-sm">
              <a href="/blog" className="transition-colors hover:text-foreground/80">
                博客
              </a>
              <a href="/admin" className="transition-colors hover:text-foreground/80">
                管理
              </a>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  )
}
