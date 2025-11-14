import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Admin() {
  const router = useRouter()
  const [session, setSession] = React.useState<any>(null)
  const [files, setFiles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // 检查 session
  React.useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error('Not authenticated')
      })
      .then((data) => {
        setSession(data)
      })
      .catch(() => {
        setSession(null)
      })
  }, [])

  // 加载文件列表
  React.useEffect(() => {
    if (session) {
      setLoading(true)
      setError(null)
      
      fetch('/api/github/list?path=content/posts')
        .then((res) => {
          console.log('Response status:', res.status)
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || `HTTP error! status: ${res.status}`)
            })
          }
          return res.json()
        })
        .then((data) => {
          console.log('Response data:', data)
          if (Array.isArray(data)) {
            setFiles(data)
          } else {
            console.error('Data is not an array:', data)
          }
        })
        .catch((error) => {
          console.error('Failed to load files:', error)
          setError(error.message)
          setFiles([])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [session])

  const handleLogin = () => {
    window.location.href = '/api/auth/github'
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  }

  if (!session) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardHeader>
              <CardTitle>管理后台</CardTitle>
              <CardDescription>请先登录以管理博客内容</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogin} className="w-full">
                使用 GitHub 登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }



  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">博客管理</h1>
            <p className="text-muted-foreground mt-2">管理你的博客文章</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            退出登录
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>文章列表</CardTitle>
            <CardDescription>点击文章名称进行编辑</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <p className="text-muted-foreground text-sm">加载中...</p>
              ) : error ? (
                <div className="text-sm">
                  <p className="text-destructive mb-2">加载失败: {error}</p>
                  <p className="text-muted-foreground">
                    请确保已正确配置 GitHub OAuth 并授权了 repo 权限
                  </p>
                </div>
              ) : files.length === 0 ? (
                <p className="text-muted-foreground text-sm">暂无文章</p>
              ) : (
                files.map((f) => (
                  <Link
                    key={f.name}
                    href={`/admin/edit/posts/${f.name.replace('.mdx', '')}`}
                    className="block p-3 rounded-md hover:bg-accent transition-colors"
                  >
                    {f.name}
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
