import { allPosts, Post } from 'contentlayer/generated'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useMDXComponent } from 'next-contentlayer/hooks'

type PostProps = {
  post: Post
}

export default function PostPage({ post }: PostProps) {
  const MDXContent = useMDXComponent(post.body.code)
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-8">
        </Link>
        
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            {post.date && (
              <time className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            )}
          </header>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <MDXContent />
          </div>
        </article>
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = allPosts.map((post: Post) => ({
    params: { slug: post.slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = allPosts.find((post: Post) => post.slug === params?.slug)

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
  }
}
