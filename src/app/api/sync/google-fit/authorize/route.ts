import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  if (session.user.role !== 'ADMIN' && !session.user.isPremium) {
    return NextResponse.redirect(new URL('/dashboard/fitness-sync', req.url));
  }

  const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  if (!clientId) {
    return new NextResponse("Google Fit Client ID not configured in .env (Add GOOGLE_HEALTH_CLIENT_ID or AUTH_GOOGLE_ID)", { status: 500 });
  }

  // Determine the callback URL based on the incoming request to support localhost or production
  const url = new URL(req.url);
  const redirectUri = `${url.protocol}//${url.host}/api/sync/google-fit/callback`;

  // We request fitness.activity.read and offline access
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.location.read',
    access_type: 'offline',
    prompt: 'consent', // Force consent to ensure we always get a refresh token
    state: session.user.id // Pass user ID in state to verify in callback
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
