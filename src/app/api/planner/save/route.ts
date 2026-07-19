import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, plan } = await req.json();

    if (type !== 'WORKOUT' && type !== 'MEAL') {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const userId = session.user.id;
    const updateData: any = {};

    if (type === 'WORKOUT') {
      updateData.aiWorkoutPlan = plan || null;
    } else if (type === 'MEAL') {
      updateData.aiMealPlan = plan || null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
