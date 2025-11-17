'use client'

import * as React from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface RepoFile {
  name: string
  path?: string
  sha?: string
}

type FilterType = 'all' | 'published' | 'draft'

export default function AdminPage() {
  const [session, setSession] = React.useState<any>(null)
  const [sessionLoading, setSessionLoading] = React.useState(true)
  const [files, setFiles] = React.useState<RepoFile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<FilterType>('all')
  const [search, setSearch] = React.useState('')
  const [refreshing, setRefreshing] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    fetch('/api/auth/session')
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then((data) => mounted && setSession(data))
      .catch(() => mounted && setSession(null))
      .finally(() => mounted && setSessionLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const loadFiles = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/github/list?path=content/posts')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('GitHub API 返回了非数组结构')
      setFiles(data)
    } catch (err) {
      console.error('Failed to load files:', err)
      setFiles([])
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (session) {
      loadFiles()
    }
  }, [session, loadFiles])

  const handleLogin = () => {
    window.location.href = '/api/auth/github'
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadFiles()
    setRefreshing(false)
  }

  const drafts = React.useMemo(() => files.filter((file) => /draft/i.test(file.name)).length, [files])
  const published = Math.max(files.length - drafts, 0)

  const filteredFiles = React.useMemo(() => {
    return files.filter((file) => {
      const lowerName = file.name.toLowerCase()
      const matchesSearch = lowerName.includes(search.toLowerCase())
      const isDraft = /draft/i.test(file.name)
      if (!matchesSearch) return false
      if (filter === 'draft') return isDraft
      if (filter === 'published') return !isDraft
      return true
    })
  }, [files, filter, search])

  const formatFileName = (name: string) => name.replace('.mdx', '').replace(/-/g, ' ')
  const greetingName = session?.user?.name || '创作者'

  const DashboardCards = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">文章总数</CardTitle>
          <span className="text-xs uppercase text-muted-foreground">总览</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{files.length}</div>
          <p className="text-xs text-muted-foreground">统计 content/posts 中的 MDX 文件</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">已发布</CardTitle>
          <span className="text-xs uppercase text-muted-foreground">PUBLISHED</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">{published}</div>
          <p className="text-xs text-muted-foreground">匹配非 draft 的文件</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">草稿</CardTitle>
          <span className="text-xs uppercase text-muted-foreground">Draft</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{drafts}</div>
          <p className="text-xs text-muted-foreground">文件名包含 draft 的文章</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">存储目录</CardTitle>
          <span className="text-xs uppercase text-muted-foreground">PATH</span>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">content/posts</div>
          <p className="text-xs text-muted-foreground">通过 GitHub API 实时同步</p>
        </CardContent>
      </Card>
    </div>
  )

  const filesTable = (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>文章列表</CardTitle>
          <CardDescription>参考 shadcn 的 Acme Inc demo 进行排版</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="published">已发布</TabsTrigger>
              <TabsTrigger value="draft">草稿</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索文件"
            className="sm:w-56"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold">加载失败</p>
            <p className="mt-1 text-destructive/80">{error}</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            {files.length === 0
              ? '暂无文章，请在 content/posts 中添加 MDX 文件。'
              : '没有找到匹配的文件，试试调整搜索或筛选条件。'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">文件名</TableHead>
                <TableHead className="w-[15%]">状态</TableHead>
                <TableHead>路径</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => {
                const isDraft = /draft/i.test(file.name)
                const slug = file.name.replace('.mdx', '')
                const statusStyles = isDraft
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                return (
                  <TableRow key={file.name}>
                    <TableCell className="font-medium capitalize">{formatFileName(file.name)}</TableCell>
                    <TableCell>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusStyles)}>
                        {isDraft ? '草稿' : '已发布'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {file.path || `content/posts/${file.name}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/edit/posts/${slug}`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-full')}
                      >
                        编辑
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )

  const quickActions = (
    <Card className="lg:col-span-2 border-[var(--sidebar-border)] bg-[var(--sidebar)]/20">
      <CardHeader>
        <CardTitle>快捷操作</CardTitle>
        <CardDescription>模仿 Acme Inc demo 的操作块，快速执行常见动作。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleRefresh} disabled={loading || refreshing}>
            {refreshing ? '刷新中...' : '刷新列表'}
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            退出登录
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }))}>
            查看前台
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  if (sessionLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-32 w-full" />
      </AdminLayout>
    )
  }

  if (!session) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>登录后台</CardTitle>
              <CardDescription>使用 GitHub 授权访问内容管理。</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogin} className="w-full">
                使用 GitHub 登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="border-[var(--sidebar-border)] bg-[var(--sidebar)]/20 shadow-sm">
          <CardHeader className="space-y-2">
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Sage Garden Theme
            </CardDescription>
            <CardTitle className="text-3xl">你好，{greetingName}</CardTitle>
            <p className="text-muted-foreground">
              右侧主内容区也启用了 Sage Garden 主题色，卡片、表格与按钮都沿用新的 OKLCH 调色板。
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={handleRefresh} disabled={loading || refreshing}>
                {refreshing ? '刷新中...' : '刷新列表'}
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                退出登录
              </Button>
              <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }))}>
                查看前台
              </Link>
            </div>
          </CardHeader>
        </Card>
{DashboardCards}
        <div className="grid gap-6 lg:grid-cols-3">
          {filesTable}
          {quickActions}
        </div>
      </div>
    </AdminLayout>
  )
}
