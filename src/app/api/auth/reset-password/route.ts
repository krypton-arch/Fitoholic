import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ success: false, errors: result.error.flatten() }, { status: 400 });
    }

    const { email } = result.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      const resetToken = crypto.randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry }
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const resetUrl = `${process.env.AUTH_URL}/reset-password?token=${resetToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset - Fitoholic',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
      });
    }

    // Always return success to prevent email enumeration
    return Response.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
