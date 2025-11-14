import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_OWNER || 'yourname'
const REPO = process.env.GITHUB_REPO || 'your-repo'
const BRANCH = process.env.GITHUB_BRANCH || 'main'

function getOctokit(token: string) {
  return new Octokit({ auth: token })
}

export async function listFiles(path: string, token: string) {
  const octokit = getOctokit(token)
  const res = await octokit.rest.repos.getContent({ owner: OWNER, repo: REPO, path })
  return res.data
}

export async function getFile(path: string, token: string) {
  const octokit = getOctokit(token)
  const res = await octokit.rest.repos.getContent({ owner: OWNER, repo: REPO, path })
  if ('content' in res.data) {
    const content = Buffer.from(res.data.content, 'base64').toString('utf8')
    return { content, sha: res.data.sha }
  }
  return null
}

export async function updateFile(path: string, content: string, sha: string, token: string) {
  const octokit = getOctokit(token)
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
