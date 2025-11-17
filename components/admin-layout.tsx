'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  BookmarkCheck,
  CircleUser,
  FilePenLine,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  PencilRuler,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
  onLogout?: () => Promise<void> | void
}

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutGrid },
  { href: '/admin/posts', label: '文章', icon: FilePenLine },
  { href: '/admin/projects', label: '项目', icon: PencilRuler },
]

export function AdminLayout({ children, className, onLogout }: AdminLayoutProps) {
  const pathname = usePathname()

  const NavLinks = ({ className: wrapperClass }: { className?: string }) => (
    <nav className={cn('grid gap-1', wrapperClass)}>
      {navItems.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const handleLogout = React.useCallback(() => {
    onLogout?.()
  }, [onLogout])

  return (
    <div className="theme min-h-screen bg-background font-[var(--font-sans)] text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:sticky lg:top-0 lg:block lg:h-screen">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-2 border-b border-[var(--sidebar-border)] px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Home className="h-5 w-5" />
                KnowStack Admin
              </Link>
            </div>
            <div className="flex-1 space-y-6 px-4 py-6">
              <NavLinks />
              <div className="rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-accent)]/40 p-4 text-xs text-[var(--sidebar-foreground)]/90">
                <p className="mb-2 font-medium text-[var(--sidebar-foreground)]">后台提示</p>
                <p>内容存储在 content/posts & projects；修改后自动触发 Contentlayer。</p>
              </div>
            </div>
            <div className="border-t border-[var(--sidebar-border)] px-4 py-6">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                  asChild
                >
                  <Link href="/">
                    <BookmarkCheck className="h-4 w-4" />
                    返回前台
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-[var(--sidebar-border)] text-[var(--sidebar-foreground)]"
                  onClick={handleLogout}
                  disabled={!onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </aside>
        <div className="flex flex-col bg-background">
          <header className="flex h-16 items-center gap-3 border-b border-[var(--sidebar-border)]/70 bg-[var(--sidebar)]/15 px-4 shadow-sm backdrop-blur lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">打开侧边栏</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-background">
                <SheetHeader>
                  <SheetTitle>后台导航</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-6">
                  <NavLinks />
                  <div className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
                    <p className="mb-1 font-medium text-foreground">操作提示</p>
                    <p>确保完成 GitHub 授权后再编辑内容。</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/">
                        <BookmarkCheck className="h-4 w-4" />
                        返回前台
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={handleLogout}
                      disabled={!onLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex flex-1 flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Acme Dashboard</span>
              <span className="font-semibold">内容控制台</span>
            </div>
            <form className="hidden flex-1 items-center md:flex">
              <div className="relative h-10 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-10 w-full pl-10" placeholder="搜索文章或项目" />
              </div>
            </form>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
                <span className="sr-only">通知</span>
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <CircleUser className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />前台预览
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={!onLogout}
                    onSelect={(event) => {
                      event.preventDefault()
                      handleLogout()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main
            className={cn(
              'flex-1 overflow-y-auto border-t border-[var(--sidebar-border)]/60 bg-[var(--sidebar)]/10 p-4 lg:p-6',
              className
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
