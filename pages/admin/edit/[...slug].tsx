import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [content, setContent] = useState('')
  const [sha, setSha] = useState('')

  const slugArray = Array.isArray(router.query.slug) ? router.query.slug : []
  const path = `content/${slugArray.join('/')}.mdx`

  // 检查 session
  useEffect(() => {
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
        router.push('/admin')
      })
  }, [router])

  useEffect(() => {
    if (router.isReady && slugArray.length > 0 && session) {
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
        .catch((error) => {
          console.error('Failed to load file:', error)
          alert('加载失败，请返回管理页面重新配置 token')
        })
    }
  }, [router.isReady, path, session])

  async function handleSave() {
    if (!session) return

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
        const error = await res.json()
        alert(`保存失败: ${error.error}`)
      }
    } catch (error) {
      alert('保存失败，请重试')
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{path}</CardTitle>
          </CardHeader>
          <CardContent>
            <div data-color-mode="light" className="dark:hidden">
              <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} />
            </div>
            <div data-color-mode="dark" className="hidden dark:block">
              <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} />
            </div>
            <Button onClick={handleSave} className="mt-4">
              保存到 GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
