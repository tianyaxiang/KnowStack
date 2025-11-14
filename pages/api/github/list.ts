import type { NextApiRequest, NextApiResponse } from 'next'
import { listFiles } from '@/lib/github'
import { getSessionFromRequest, getGithubTokenFromRequest } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { path } = req.query
    const data = await listFiles(path as string, token)
    console.log('API /list - Data:', Array.isArray(data) ? `${data.length} items` : typeof data)
    res.status(200).json(data)
  } catch (error: any) {
    console.error('API /list - Error:', error)
    res.status(error.status || 500).json({ error: error.message })
  }
}
