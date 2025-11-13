import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getFile, updateFile } from '@/lib/github'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [sha, setSha] = useState('')

  const path = `content/${router.query.slug?.join('/')}.mdx`

  useEffect(() => {
    if (router.isReady) {
      getFile(path).then((res) => {
        if (res) {
          setContent(res.content)
          setSha(res.sha)
        }
      })
    }
  }, [router.isReady])

  async function handleSave() {
    await updateFile(path, content, sha)
    alert('已保存并推送到 GitHub！')
  }

  return (
    <div className="p-4">
      <h1 className="text-lg mb-4">{path}</h1>
      <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} />
      <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        保存
      </button>
    </div>
  )
}
