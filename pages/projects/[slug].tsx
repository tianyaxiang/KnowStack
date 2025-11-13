import { allProjects, Project } from 'contentlayer/generated'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { Layout } from '@/components/layout'
import { useMDXComponent } from 'next-contentlayer/hooks'

type ProjectPageProps = {
  project: Project
}

export default function ProjectPage({ project }: ProjectPageProps) {
  const MDXContent = useMDXComponent(project.body.code)
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-8">
          ← 返回项目列表
        </Link>
        
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
            
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                查看项目 ↗
              </a>
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
  const paths = allProjects.map((project: Project) => ({
    params: { slug: project.slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const project = allProjects.find((project: Project) => project.slug === params?.slug)

  if (!project) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      project,
    },
  }
}
