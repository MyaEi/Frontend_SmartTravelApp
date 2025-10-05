// app/login-success/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/', req.url));

  const domain       = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
  const region       = process.env.NEXT_PUBLIC_AWS_REGION!;
  const clientId     = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET; // optional
  const redirectUri  = process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN!; // should be http://localhost:3000/login-success

  const tokenUrl = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (clientSecret) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers.Authorization = `Basic ${basic}`;
  }

  const resp = await fetch(tokenUrl, { method: 'POST', headers, body, cache: 'no-store' });
  if (!resp.ok) {
    // On failure, just go home (or you can send to /login-error)
    return NextResponse.redirect(new URL('/', req.url));
  }
  const { id_token, access_token, refresh_token, expires_in } = await resp.json();

  // Set secure cookies and go home
  const isProd = process.env.NODE_ENV === 'production';
  const res = NextResponse.redirect(new URL('/', req.url));

  const maxAge = Math.max(60, Number(expires_in || 3600));
  res.cookies.set('idToken', id_token,         { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge });
  res.cookies.set('accessToken', access_token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge });
  if (refresh_token) {
    res.cookies.set('refreshToken', refresh_token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 });
  }

  return res;
}
