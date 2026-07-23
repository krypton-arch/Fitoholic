"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UpgradeButton({ user }: { user: { name: string; email: string } }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const orderRes = await fetch("/api/payments/order", { method: "POST" });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create order");
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: 49900,
        currency: "INR",
        name: "Fitoholic",
        description: "Premium Upgrade",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            alert("Payment Successful!");
            window.location.reload();
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="editorial-button font-label-caps text-[11px] uppercase tracking-widest px-6 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary transition-all active:scale-[0.99] disabled:opacity-50"
    >
      {loading ? "Processing..." : "Unlock Pro"}
    </button>
  );
}
