import Link from 'next/link'
import { allBlogs } from 'contentlayer/generated'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">欢迎来到我的博客</h1>
          <p className="text-xl text-muted-foreground">分享技术见解与思考</p>
        </div>
        
        <div className="grid gap-6">
          {allBlogs.map((post) => (
            <Card key={post._id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                {post.date && (
                  <time className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
              </CardHeader>
              {post.description && (
                <CardContent>
                  <CardDescription className="text-base">{post.description}</CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/admin">
            <Button variant="outline">进入管理后台 →</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
