import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(request) {
    try {
        const { amount } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const razorpay = getRazorpay();

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency: "INR",
            receipt: `sc_${Date.now()}`,
        });

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
