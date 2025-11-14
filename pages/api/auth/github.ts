import type { NextApiRequest, NextApiResponse } from 'next'

export const runtime = 'edge'

// GitHub OAuth 登录 - 重定向到 GitHub
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/auth/github/callback`
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`
  
  res.redirect(githubAuthUrl)
}
