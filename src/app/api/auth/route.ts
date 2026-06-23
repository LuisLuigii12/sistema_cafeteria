import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (!process.env.APP_PASSWORD || !process.env.SESSION_TOKEN) {
    return NextResponse.json({ ok: false, error: 'No configurado' }, { status: 500 })
  }

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('pos_session', process.env.SESSION_TOKEN, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 días
    path: '/',
  })
  return res
}
