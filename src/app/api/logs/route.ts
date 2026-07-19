import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLogsForUser, getLogsByDateRange, upsertDailyLog } from '@/lib/services/log-service';
import { dailyLogSchema } from '@/lib/validations/logs';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const logs = await getLogsByDateRange(userId, fromDate, toDate);
      return NextResponse.json(logs);
    }

    const logs = await getLogsForUser(userId);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsedData = dailyLogSchema.parse(body);

    const log = await upsertDailyLog(userId, parsedData);
    return NextResponse.json(log);
  } catch (error) {
    console.error('Error upserting log:', error);
    return NextResponse.json({ error: 'Invalid input or Internal Server Error' }, { status: 400 });
  }
}
