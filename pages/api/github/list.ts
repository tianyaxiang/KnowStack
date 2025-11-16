import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { listFiles } from '@/lib/github'
import { getSessionFromRequest, getGithubTokenFromRequest } from '@/lib/auth'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const token = await getGithubTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'GitHub token not found. Please login again.' }, { status: 400 })
    }

    const path = req.nextUrl.searchParams.get('path')
    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
    }

    const data = await listFiles(path, token)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API /list - Error:', error)
    return NextResponse.json({ error: error.message }, { status: error?.status || 500 })
  }
}
