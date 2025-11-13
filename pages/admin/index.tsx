import { signIn, signOut, useSession } from '@/lib/auth-client'
import { listFiles } from '@/lib/github'
import Link from 'next/link'
import React from 'react'

export default function Admin() {
  const { data: session } = useSession()
  const [files, setFiles] = React.useState<any[]>([])

  React.useEffect(() => {
    if (session) {
      listFiles('content/blog').then(setFiles)
    }
  }, [session])

  if (!session) {
    return <button onClick={() => signIn.social({ provider: 'github' })}>GitHub 登录</button>
  }

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">博客文件列表</h1>
      {files.map((f) => (
        <div key={f.name}>
          <Link href={`/admin/edit/blog/${f.name.replace('.mdx', '')}`}>{f.name}</Link>
        </div>
      ))}
      <button className="mt-4" onClick={() => signOut()}>退出登录</button>
    </div>
  )
}
