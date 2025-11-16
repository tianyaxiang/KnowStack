import { Octokit } from '@octokit/rest'

function createOctokit(token: string) {
  return new Octokit({
    auth: token,
    request: {
      fetch: globalThis.fetch,
      headers: {
        'user-agent': 'KnowStack'
      }
    }
  })
}

const owner = process.env.GITHUB_OWNER
const repo = process.env.GITHUB_REPO
const branch = process.env.GITHUB_BRANCH || 'main'

export async function listFiles(path: string, token: string) {
  const octokit = createOctokit(token)
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  })
  return response.data
}

export async function getFile(path: string, token: string) {
  const octokit = createOctokit(token)
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  })

  if (Array.isArray(response.data)) {
    throw new Error('Path is a directory')
  }

  const content = Buffer.from(response.data.content, 'base64').toString('utf-8')
  return {
    content,
    sha: response.data.sha,
  }
}

export async function updateFile(path: string, content: string, sha: string, token: string) {
  const octokit = createOctokit(token)
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `Update ${path}`,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch,
  })
}
