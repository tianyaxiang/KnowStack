import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionFromRequest } from '@/lib/auth'

// 获取当前 session
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSessionFromRequest(req)
  
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  // 不返回 githubToken 给前端
  res.status(200).json({
    user: session.user,
  })
}
