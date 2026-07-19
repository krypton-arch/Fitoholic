import { prisma } from '@/lib/prisma';
import { newPasswordSchema } from '@/lib/validations/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = newPasswordSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ success: false, errors: result.error.flatten() }, { status: 400 });
    }

    const { token, password } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return Response.json({ success: false, error: 'Invalid or expired token' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Reset password confirm error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
