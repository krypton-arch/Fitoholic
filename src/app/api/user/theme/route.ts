import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const themeSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = themeSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ error: 'Invalid theme value' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { theme: result.data.theme },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Theme update error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
