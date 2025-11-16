import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createSessionJWT } from '@/lib/auth'

export const runtime = 'edge'

// GitHub OAuth 回调 - 获取 access token 并创建 session
export default async function handler(req: NextRequest) {
  const codeParam = req.nextUrl.searchParams.get('code')

  if (!codeParam) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
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
        code: codeParam,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 })
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

    const response = NextResponse.redirect(new URL('/admin', req.url))
    response.cookies.set({
      name: 'auth_session',
      value: sessionJWT,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
