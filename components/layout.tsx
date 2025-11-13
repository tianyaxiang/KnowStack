import * as React from 'react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <header>
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <nav className="ml-auto text-sm font-medium space-x-6">
            <Link href="/">Home</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
