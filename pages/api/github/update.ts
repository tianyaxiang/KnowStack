import type { NextApiRequest, NextApiResponse } from 'next'
import { updateFile } from '@/lib/github'
import { getSessionFromRequest, getGithubTokenFromRequest } from '@/lib/auth'

export const runtime = 'edge'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 验证用户 session
    const session = await getSessionFromRequest(req)
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // 从 JWT 中获取 GitHub token
    const token = await getGithubTokenFromRequest(req)
    
    if (!token) {
      return res.status(400).json({ error: 'GitHub token not found. Please login again.' })
    }

    const { path, content, sha } = req.body

    await updateFile(path, content, sha, token)
    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('API /update - Error:', error)
    res.status(error.status || 500).json({ error: error.message })
  }
}
