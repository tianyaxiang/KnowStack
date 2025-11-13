import { Octokit } from 'octokit'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

const OWNER = 'yourname'
const REPO = 'your-repo'
const BRANCH = 'main'

export async function listFiles(path: string) {
  const res = await octokit.rest.repos.getContent({ owner: OWNER, repo: REPO, path })
  return res.data
}

export async function getFile(path: string) {
  const res = await octokit.rest.repos.getContent({ owner: OWNER, repo: REPO, path })
  if ('content' in res.data) {
    const content = Buffer.from(res.data.content, 'base64').toString('utf8')
    return { content, sha: res.data.sha }
  }
  return null
}

export async function updateFile(path: string, content: string, sha: string) {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: `update: ${path}`,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch: BRANCH
  })
}
