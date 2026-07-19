import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Helper to refresh Google OAuth Token
async function getValidAccessToken(userId: string) {
  const tokenRecord = await prisma.fitnessSyncToken.findUnique({
    where: { userId_provider: { userId, provider: 'google_health' } }
  });

  if (!tokenRecord) throw new Error('Not connected');

  // Add a 5 minute buffer
  if (tokenRecord.expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
    const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.GOOGLE_HEALTH_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: tokenRecord.refreshToken,
        grant_type: 'refresh_token',
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    const updatedToken = await prisma.fitnessSyncToken.update({
      where: { id: tokenRecord.id },
      data: {
        accessToken: data.access_token,
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
        expiresAt,
      }
    });

    return updatedToken.accessToken;
  }

  return tokenRecord.accessToken;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (session.user.role !== 'ADMIN' && !session.user.isPremium) {
      return NextResponse.json({ error: 'Premium feature' }, { status: 403 });
    }

    // Get a valid access token
    let accessToken;
    try {
      accessToken = await getValidAccessToken(session.user.id);
    } catch (e: any) {
      return NextResponse.json({ error: 'Google Fit not connected or authorization expired' }, { status: 400 });
    }

    // Query Google Fitness API for today's aggregate data
    const now = new Date();
    const startOfTodayLocal = new Date(now);
    startOfTodayLocal.setHours(0, 0, 0, 0);
    const endOfTodayLocal = new Date(now);
    endOfTodayLocal.setHours(23, 59, 59, 999);

    // This ensures we save to the exact same UTC midnight string used by the Logs manual form
    const startOfTodayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        aggregateBy: [
          { dataTypeName: 'com.google.step_count.delta' },
          { dataTypeName: 'com.google.calories.expended' },
          { dataTypeName: 'com.google.distance.delta' }
        ],
        bucketByTime: { durationMillis: endOfTodayLocal.getTime() - startOfTodayLocal.getTime() },
        startTimeMillis: startOfTodayLocal.getTime(),
        endTimeMillis: endOfTodayLocal.getTime()
      })
    });

    if (!response.ok) {
      let errData;
      try {
        errData = await response.json();
      } catch(e) {
        errData = await response.text();
      }
      console.error('Fitness API Error:', errData);
      return NextResponse.json({ error: 'Failed to fetch from Google Fit', details: errData }, { status: 502 });
    }

    const fitData = await response.json();
    
    // Parse the data out of the buckets
    let steps = 0;
    let calories = 0;
    let distanceMeters = 0;

    if (fitData.bucket && fitData.bucket.length > 0) {
      const bucket = fitData.bucket[0];
      for (const dataset of bucket.dataset) {
        if (dataset.point && dataset.point.length > 0) {
          const value = dataset.point[0].value[0];
          const valNum = value.intVal || value.fpVal || 0;
          
          if (dataset.dataSourceId.includes('step_count')) steps = Math.floor(valNum);
          else if (dataset.dataSourceId.includes('calories')) calories = Math.floor(valNum);
          else if (dataset.dataSourceId.includes('distance')) distanceMeters = valNum;
        }
      }
    }

    const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));

    // Save to DailyLog
    await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: startOfTodayUTC
        }
      },
      update: {
        steps,
        caloriesBurned: calories,
      },
      create: {
        userId: session.user.id,
        date: startOfTodayUTC,
        steps,
        caloriesBurned: calories,
      }
    });

    // Update last sync time
    await prisma.fitnessSyncToken.update({
      where: { userId_provider: { userId: session.user.id, provider: 'google_health' } },
      data: { lastSyncAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: {
        steps,
        caloriesActive: calories,
        distanceKm,
        source: 'Google Fit',
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Google Fit Sync Error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
