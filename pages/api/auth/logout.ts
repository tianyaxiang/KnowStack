import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

// 登出 - 清除 session cookie
export default async function handler(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: 'auth_session',
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  })
  return response
}
