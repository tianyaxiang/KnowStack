import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getFile, updateFile } from '@/lib/github'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [sha, setSha] = useState('')

  const slugArray = Array.isArray(router.query.slug) ? router.query.slug : []
  const path = `content/${slugArray.join('/')}.mdx`

  useEffect(() => {
    if (router.isReady && slugArray.length > 0) {
      getFile(path).then((res) => {
        if (res) {
          setContent(res.content)
          setSha(res.sha)
        }
      })
    }
  }, [router.isReady, path])

  async function handleSave() {
    await updateFile(path, content, sha)
    alert('已保存并推送到 GitHub！')
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
