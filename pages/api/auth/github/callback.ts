import type { NextApiRequest, NextApiResponse } from 'next'
import { createSessionJWT } from '@/lib/auth'

// GitHub OAuth 回调 - 获取 access token 并创建 session
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query

  if (!code) {
    return res.status(400).json({ error: 'No code provided' })
  }

  try {
    // 用 code 换取 access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to get access token' })
    }

    // 用 access token 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const user = await userResponse.json()

    // 创建包含用户信息和 GitHub token 的 JWT
    const sessionJWT = await createSessionJWT(user, accessToken)

    // 将 JWT 存储在 httpOnly cookie 中
    res.setHeader(
      'Set-Cookie',
      `auth_session=${sessionJWT}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    )

    // 重定向到管理页面
    res.redirect('/admin')
  } catch (error: any) {
    console.error('GitHub OAuth error:', error)
    res.status(500).json({ error: error.message })
  }
}
