import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC = ['/login', '/api/auth']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const esPublica = PUBLIC.some((p) => pathname.startsWith(p))
  if (esPublica) return NextResponse.next()

  const session = request.cookies.get('pos_session')
  if (session?.value === process.env.SESSION_TOKEN) return NextResponse.next()

  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|icon-512.png|manifest.json|sw.js|.*\\.png$|.*\\.jpg$|.*\\.ico$).*)'],
}
