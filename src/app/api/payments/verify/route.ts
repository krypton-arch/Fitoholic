import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      await prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true },
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
