import Link from 'next/link'
import { allPosts } from 'contentlayer/generated'
import { Layout } from '@/components/layout'

export default function Home() {
  return (
    <Layout>
      <div className="prose dark:prose-invert">
        {allPosts.map((post) => (
          <article key={post._id}>
            <Link href={`/posts/${post.slug}`} >
              <h2>{post.title}</h2>
            </Link>
            {post.description && <p>{post.description}</p>}
          </article>
        ))}
      </div>
    </Layout>
  )
}
