import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        // Verify webhook signature
        if (!verifyWebhookSignature(body, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        const supabase = await createServiceClient();

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;

            // Update order payment status
            await supabase
                .from("orders")
                .update({ payment_status: "paid" })
                .eq("razorpay_order_id", orderId);
        }

        if (event.event === "payment.failed") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;

            await supabase
                .from("orders")
                .update({ payment_status: "pending" })
                .eq("razorpay_order_id", orderId);
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
