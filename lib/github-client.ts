// 客户端 GitHub API 调用封装

export async function fetchWithGitHubToken(url: string, options: RequestInit = {}) {
  // 从 Better Auth session 获取 GitHub token
  const sessionRes = await fetch('/api/auth/session')
  const session = await sessionRes.json()
  
  const token = session?.user?.token || session?.accessToken
  
  if (!token) {
    throw new Error('No GitHub token found in session')
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function listGitHubFiles(path: string) {
  const res = await fetchWithGitHubToken(`/api/github/list?path=${encodeURIComponent(path)}`)
  return res.json()
}

export async function getGitHubFile(path: string) {
  const res = await fetchWithGitHubToken(`/api/github/get?path=${encodeURIComponent(path)}`)
  return res.json()
}

export async function updateGitHubFile(path: string, content: string, sha: string) {
  const res = await fetchWithGitHubToken('/api/github/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content, sha }),
  })
  return res.json()
}
