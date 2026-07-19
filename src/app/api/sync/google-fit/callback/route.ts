import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // Should be the userId
  const error = url.searchParams.get('error');

  if (error) {
    console.error('Google Fit Auth Error:', error);
    return NextResponse.redirect(new URL('/dashboard/fitness-sync?error=auth_denied', req.url));
  }

  if (!code || state !== session.user.id) {
    return NextResponse.redirect(new URL('/dashboard/fitness-sync?error=invalid_request', req.url));
  }

  const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_HEALTH_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;
  
  if (!clientId || !clientSecret) {
    return new NextResponse("Google Fit Client config missing in .env (Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET)", { status: 500 });
  }

  const redirectUri = `${url.protocol}//${url.host}/api/sync/google-fit/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token Exchange Error:', tokenData);
      return NextResponse.redirect(new URL('/dashboard/fitness-sync?error=token_exchange_failed', req.url));
    }

    // Google returns expires_in in seconds
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    await prisma.fitnessSyncToken.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'google_health'
        }
      },
      update: {
        accessToken: tokenData.access_token,
        // Only update refresh token if provided (Google doesn't always send it on re-auth unless prompt=consent)
        ...(tokenData.refresh_token && { refreshToken: tokenData.refresh_token }),
        expiresAt,
        scopes: tokenData.scope.split(' '),
      },
      create: {
        userId: session.user.id,
        provider: 'google_health',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '', // It shouldn't be empty on first auth because prompt=consent
        expiresAt,
        scopes: tokenData.scope.split(' '),
      }
    });

    return NextResponse.redirect(new URL('/dashboard/fitness-sync?success=true', req.url));
  } catch (err) {
    console.error('Failed to save Google Fit Token:', err);
    return NextResponse.redirect(new URL('/dashboard/fitness-sync?error=server_error', req.url));
  }
}
