import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [content, setContent] = useState('')
  const [sha, setSha] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const slugArray = Array.isArray(router.query.slug) ? router.query.slug : []
  const path = useMemo(() => `content/${slugArray.join('/')}.mdx`, [slugArray])

  useEffect(() => {
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

  useEffect(() => {
    if (!router.isReady || !session || slugArray.length === 0) return
    setLoading(true)
    setError(null)
    fetch(`/api/github/get?path=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((res) => {
        if (res && res.content) {
          setContent(res.content)
          setSha(res.sha)
        }
      })
      .catch((err) => {
        console.error('Failed to load file:', err)
        setError(err instanceof Error ? err.message : '加载失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router.isReady, slugArray, session, path])

  async function handleSave() {
    if (!session) return
    setSaving(true)
    try {
      const res = await fetch('/api/github/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, content, sha }),
      })
      if (res.ok) {
        alert('已保存并推送到 GitHub！')
      } else {
        const errorBody = await res.json().catch(() => ({}))
        alert(`保存失败: ${errorBody.error || res.statusText}`)
      }
    } catch (err) {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (sessionLoading) {
    return (
      <AdminLayout>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>正在加载编辑器</CardTitle>
            <CardDescription>等待会话校验完成...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  if (!session) {
    return (
      <AdminLayout>
        <Card className="border border-primary/30 bg-gradient-to-br from-primary/10 to-background">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请返回管理首页并使用 GitHub 登录后再访问编辑器。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => router.push('/admin')}>返回后台</Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/api/auth/github')}>
              立即登录
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout className="space-y-6">
      <div className="rounded-3xl border bg-card/80 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">MDX Editor</p>
            <h1 className="text-3xl font-semibold">{slugArray.at(-1) || '新文章'}</h1>
            <p className="text-sm text-muted-foreground">{path}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              返回列表
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存到 GitHub'}
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>内容编辑</CardTitle>
          <CardDescription>支持暗色/亮色模式，直接编辑 MDX 内容。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[480px] animate-pulse rounded-2xl bg-muted/60" />
          ) : error ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
              <p className="font-semibold">内容加载失败</p>
              <p className="text-sm text-destructive/80">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/admin')}>
                返回文章列表
              </Button>
            </div>
          ) : (
            <>
              <div data-color-mode="light" className="dark:hidden">
                <MDEditor value={content} onChange={(v) => setContent(v || '')} height={520} />
              </div>
              <div data-color-mode="dark" className="hidden dark:block">
                <MDEditor value={content} onChange={(v) => setContent(v || '')} height={520} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                保存会同步到 GitHub 仓库的对应 MDX 文件。
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
