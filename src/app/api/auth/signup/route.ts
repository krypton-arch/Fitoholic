import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signupSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ success: false, errors: result.error.flatten() }, { status: 400 });
    }

    const { email, password, name } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return Response.json({ success: false, error: 'Email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'USER'
      }
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
