import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const idToken = cookieStore.get('idToken')?.value;
  
  if (!idToken) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    
    return NextResponse.json({
      authenticated: true,
      user: {
        email: payload.email,
        name: payload.name || payload.email?.split('@')[0],
        sub: payload.sub
      }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}