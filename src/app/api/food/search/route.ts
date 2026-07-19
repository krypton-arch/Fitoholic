import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search by food name or alias
    const foods = await prisma.food.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { aliases: { some: { alias: { contains: query, mode: 'insensitive' } } } }
        ]
      },
      include: {
        aliases: true
      },
      take: 20
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json({ error: 'Failed to search foods' }, { status: 500 });
  }
}
