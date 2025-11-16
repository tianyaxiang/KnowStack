import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

// GitHub OAuth 登录 - 重定向到 GitHub
export default async function handler(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_URL || req.nextUrl.origin}/api/auth/github/callback`
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=repo`

  return NextResponse.redirect(githubAuthUrl)
}
