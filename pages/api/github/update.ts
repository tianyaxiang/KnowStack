import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateFile } from '@/lib/github'
import { getSessionFromRequest, getGithubTokenFromRequest } from '@/lib/auth'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const token = await getGithubTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'GitHub token not found. Please login again.' }, { status: 400 })
    }

    const body = await req.json()
    const { path, content, sha } = body

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    }

    await updateFile(path, content, sha, token)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API /update - Error:', error)
    return NextResponse.json({ error: error.message }, { status: error?.status || 500 })
  }
}
