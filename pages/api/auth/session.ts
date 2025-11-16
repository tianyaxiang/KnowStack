import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export const runtime = 'edge'

// 获取当前 session
export default async function handler(req: NextRequest) {
  const session = await getSessionFromRequest(req)

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json({
    user: session.user,
  })
}
