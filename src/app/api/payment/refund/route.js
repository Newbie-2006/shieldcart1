import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check admin role using service client
        const serviceSupabase = await createServiceClient();
        const { data: profile } = await serviceSupabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Admin only" }, { status: 403 });
        }

        const { razorpay_payment_id, order_id } = await request.json();

        const isTestMode = !process.env.RAZORPAY_KEY_ID ||
            process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder" ||
            process.env.RAZORPAY_KEY_ID.includes("placeholder");

        if (isTestMode) {
            // Simulate refund — just update the payment status
            await serviceSupabase
                .from("orders")
                .update({ payment_status: "refunded", status: "refunded" })
                .eq("id", order_id);

            return NextResponse.json({ refund_id: `sim_refund_${Date.now()}`, status: "processed" });
        } else {
            // Real Razorpay refund
            const razorpay = getRazorpay();
            const refund = await razorpay.payments.refund(razorpay_payment_id, {
                speed: "normal",
            });

            await serviceSupabase
                .from("orders")
                .update({ payment_status: "refunded" })
                .eq("id", order_id);

            return NextResponse.json({ refund_id: refund.id, status: refund.status });
        }
    } catch (error) {
        console.error("Refund error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
