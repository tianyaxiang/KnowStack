import React from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type RepoFile = {
  name: string
  path?: string
  sha?: string
}

type FilterType = 'all' | 'published' | 'draft'

export default function Admin() {
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
        if (res.ok) {
          return res.json()
        }
        throw new Error('Not authenticated')
      })
      .then((data) => {
        if (mounted) {
          setSession(data)
        }
      })
      .catch(() => {
        if (mounted) {
          setSession(null)
        }
      })
      .finally(() => {
        if (mounted) {
          setSessionLoading(false)
        }
      })

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
      if (Array.isArray(data)) {
        setFiles(data)
      } else {
        throw new Error('GitHub API 返回了非数组结构')
      }
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

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: '全部', value: 'all' },
    { label: '已发布', value: 'published' },
    { label: '草稿', value: 'draft' },
  ]

  const formatFileName = (name: string) => name.replace('.mdx', '').replace(/-/g, ' ')
  const greetingName = session?.user?.name || '创作者'

  if (sessionLoading) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto py-24">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>正在加载管理后台</CardTitle>
              <CardDescription>检查会话信息...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  if (!session) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto py-24">
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 to-background">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin Console</p>
              <CardTitle className="text-3xl">登录后台</CardTitle>
              <CardDescription>
                连接 GitHub 账号即可在浏览器内编辑 MDX 文章、管理项目介绍并发布到远端仓库。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>· 使用 Better Auth session + JWT 确保 token 安全</li>
                <li>· 支持暗黑模式的所见即所得编辑体验</li>
                <li>· 一键推送内容到 GitHub 主分支</li>
              </ul>
              <Button onClick={handleLogin} className="w-full h-12 text-base font-semibold">
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
      <div className="space-y-8 py-4">
        <section className="overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/20 via-primary/10 to-background p-8 shadow-lg">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">Admin · Sage Garden</p>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              你好，{greetingName}
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              在这里管理文章、刷新内容和维护项目展示区。每次调整都会通过 Contentlayer + GitHub 工作流即时同步至前台。
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleRefresh} disabled={loading || refreshing}>
                {refreshing ? '刷新中...' : '刷新文章列表'}
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                退出登录
              </Button>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: 'ghost' }), 'border border-transparent hover:border-border/50')}
              >
                查看前台站点
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/60">
            <CardHeader>
              <CardDescription>文章总数</CardDescription>
              <CardTitle className="text-4xl font-semibold">{files.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>已发布</CardDescription>
              <CardTitle className="text-4xl font-semibold text-emerald-500 dark:text-emerald-400">
                {published}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>草稿</CardDescription>
              <CardTitle className="text-4xl font-semibold text-amber-500">{drafts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>内容目录</CardDescription>
              <CardTitle className="text-lg font-medium text-muted-foreground">
                content/posts
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl">文章列表</CardTitle>
                <CardDescription>筛选、搜索并跳转到编辑器</CardDescription>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索文件，例如 hello-world"
                className="w-full rounded-2xl border border-border/60 bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-60"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    filter === option.value
                      ? 'border-primary/60 bg-primary/10 text-primary'
                      : 'border-border/70 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted/60" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <p className="font-semibold">加载失败</p>
                <p className="mt-1 text-destructive/80">{error}</p>
                <p className="mt-2 text-muted-foreground">
                  请确认 GitHub OAuth、仓库权限以及 Contentlayer 配置是否正确。
                </p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                {files.length === 0
                  ? '暂无文章，请在 content/posts 中添加 MDX 文件。'
                  : '没有找到匹配的文件，试试调整搜索或筛选条件。'}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredFiles.map((file) => {
                  const isDraft = /draft/i.test(file.name)
                  const statusStyles = isDraft
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                  return (
                    <div
                      key={file.name}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6"
                    >
                      <div className="flex-1">
                        <p className="text-base font-medium capitalize">{formatFileName(file.name)}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.path || `content/posts/${file.name}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusStyles)}>
                          {isDraft ? '草稿' : '已发布'}
                        </span>
                        <Link
                          href={`/admin/edit/posts/${file.name.replace('.mdx', '')}`}
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'rounded-full'
                          )}
                        >
                          编辑
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
