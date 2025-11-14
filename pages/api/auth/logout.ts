import type { NextApiRequest, NextApiResponse } from 'next'

// 登出 - 清除 session cookie
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `auth_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  )
  
  res.status(200).json({ success: true })
}
