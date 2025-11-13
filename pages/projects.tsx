import Link from 'next/link'
import { allProjects } from 'contentlayer/generated'
import { Layout } from '@/components/layout'

export default function Projects() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">项目</h1>
          <p className="text-muted-foreground">我的一些个人项目和作品</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {allProjects.map((project) => (
            <article
              key={project._id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {project.name} ↗
                  </a>
                ) : (
                  project.name
                )}
              </h2>
              
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                查看详情 →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  )
}
