import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
)

function readSessionCookie(req: any): string | null {
  if (!req) return null

  const cookies = req.cookies
  if (cookies) {
    if (typeof cookies.get === 'function') {
      const cookie = cookies.get('auth_session')
      if (!cookie) return null
      return typeof cookie === 'string' ? cookie : cookie.value
    }
    if (typeof cookies === 'object' && 'auth_session' in cookies) {
      return (cookies as any).auth_session as string
    }
  }

  const headerValue =
    typeof req.headers?.get === 'function'
      ? req.headers.get('cookie')
      : req.headers?.cookie

  if (typeof headerValue === 'string') {
    const cookieMap = headerValue.split(';').reduce<Record<string, string>>((acc, pair) => {
      const [name, ...rest] = pair.trim().split('=')
      if (!name) return acc
      acc[name] = decodeURIComponent(rest.join('='))
      return acc
    }, {})
    return cookieMap['auth_session'] || null
  }

  return null
}

// 创建包含用户信息和 GitHub token 的 JWT session
export async function createSessionJWT(user: any, githubToken: string): Promise<string> {
  const jwt = await new SignJWT({
    userId: user.id.toString(),
    login: user.login,
    name: user.name,
    avatar: user.avatar_url,
    githubToken,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
  
  return jwt
}

// 从 JWT 中获取 session
export async function getSessionFromRequest(req: any) {
  const jwt = readSessionCookie(req)
  
  if (!jwt) {
    return null
  }

  try {
    const { payload } = await jwtVerify(jwt, JWT_SECRET)
    return {
      user: {
        id: payload.userId as string,
        login: payload.login as string,
        name: payload.name as string,
        avatar: payload.avatar as string,
      },
      githubToken: payload.githubToken as string,
    }
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

// 从请求中获取 GitHub token
export async function getGithubTokenFromRequest(req: any): Promise<string | null> {
  const session = await getSessionFromRequest(req)
  return session?.githubToken || null
}
