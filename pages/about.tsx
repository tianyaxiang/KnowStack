import { allPages } from 'contentlayer/generated'
import { Layout } from '@/components/layout'
import { useMDXComponent } from 'next-contentlayer/hooks'

export default function About() {
  const page = allPages.find((p) => p.slug === 'about')
  
  if (!page) {
    return (
      <Layout>
        <div className="prose dark:prose-invert">
          <h1>页面未找到</h1>
        </div>
      </Layout>
    )
  }

  const MDXContent = useMDXComponent(page.body.code)
  
  return (
    <Layout>
      <article className="prose dark:prose-invert max-w-none">
        <h1>{page.title}</h1>
        <MDXContent />
      </article>
    </Layout>
  )
}
