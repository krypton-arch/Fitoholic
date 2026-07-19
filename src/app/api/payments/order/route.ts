import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const amount = 49900;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: userId,
    });

    await prisma.payment.create({
      data: {
        userId,
        amount,
        razorpayOrderId: order.id,
        status: "CREATED",
      },
    });

    return NextResponse.json({ 
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
