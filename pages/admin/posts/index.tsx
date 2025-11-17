'use client'

import * as React from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type RepoFile = {
  name: string
  path?: string
  sha?: string
}

type FilterType = 'all' | 'published' | 'draft'

const RESOURCE_PATH = 'content/posts'
const EDIT_PREFIX = '/admin/edit/posts/'

export default function AdminPostsPage() {
  const [session, setSession] = React.useState<any>(null)
  const [sessionLoading, setSessionLoading] = React.useState(true)
  const [files, setFiles] = React.useState<RepoFile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<FilterType>('all')
  const [search, setSearch] = React.useState('')

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
      const res = await fetch(`/api/github/list?path=${RESOURCE_PATH}`)
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

  const filters = (
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
  )

  const filesTable = (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>文章管理</CardTitle>
          <CardDescription>浏览、筛选并跳转到编辑器</CardDescription>
        </div>
        {filters}
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
              ? `暂无文章，请在 ${RESOURCE_PATH} 中添加 MDX 文件。`
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
                      {file.path || `${RESOURCE_PATH}/${file.name}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`${EDIT_PREFIX}${slug}`}
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
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">您好 {greetingName}，欢迎管理文章</p>
          <h1 className="text-3xl font-semibold tracking-tight">文章管理</h1>
          <p className="text-muted-foreground">
            浏览文章列表并跳转到编辑器，支持草稿/已发布筛选与搜索。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>文章总数</CardDescription>
              <CardTitle className="text-2xl">{files.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>已发布</CardDescription>
              <CardTitle className="text-2xl text-emerald-500 dark:text-emerald-400">{published}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>草稿</CardDescription>
              <CardTitle className="text-2xl text-amber-500">{drafts}</CardTitle>
            </CardHeader>
          </Card>
        </div>
        {filesTable}
      </div>
    </AdminLayout>
  )
}
