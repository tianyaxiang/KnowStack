import { signIn, signOut, useSession } from '@/lib/auth-client'
import { listFiles } from '@/lib/github'
import Link from 'next/link'
import React from 'react'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Admin() {
  const { data: session } = useSession()
  const [files, setFiles] = React.useState<any[]>([])

  React.useEffect(() => {
    if (session) {
      listFiles('content/posts').then((data) => {
        if (Array.isArray(data)) {
          setFiles(data)
        }
      })
    }
  }, [session])

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
              <Button onClick={() => signIn.social({ provider: 'github' })} className="w-full">
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
          <Button variant="outline" onClick={() => signOut()}>
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
              {files.length === 0 ? (
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
