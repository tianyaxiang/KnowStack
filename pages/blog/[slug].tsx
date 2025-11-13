import { allBlogs, Blog } from 'contentlayer/generated'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useMDXComponent } from 'next-contentlayer/hooks'

type BlogPostProps = {
  post: Blog
}

export default function BlogPost({ post }: BlogPostProps) {
  const MDXContent = useMDXComponent(post.body.code)
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← 返回首页
          </Button>
        </Link>
        
        <article className="prose prose-slate dark:prose-invert lg:prose-xl max-w-none">
          <h1 className="mb-2">{post.title}</h1>
          
          {post.date && (
            <time className="text-muted-foreground block mb-8">
              {new Date(post.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          )}
          
          {post.description && (
            <p className="text-xl text-muted-foreground lead">{post.description}</p>
          )}
          
          <MDXContent />
        </article>
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = allBlogs.map((post: Blog) => ({
    params: { slug: post.slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = allBlogs.find((post: Blog) => post.slug === params?.slug)

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
