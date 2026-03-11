import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use service client to bypass RLS for reading orders
        const serviceSupabase = await createServiceClient();
        const { data, error } = await serviceSupabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            product_url,
            product_name,
            platform,
            price,
            shieldcart_fee,
            delivery_address,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            test_mode,
        } = body;

        // Skip payment verification in test mode (COD or placeholder keys)
        const isTestMode = test_mode || process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder";

        if (!isTestMode) {
            const isValid = verifyPaymentSignature({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });

            if (!isValid) {
                return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
            }
        }

        // Use service client to bypass RLS for inserting orders
        const serviceSupabase = await createServiceClient();
        const { data, error } = await serviceSupabase.from("orders").insert({
            user_id: user.id,
            product_url,
            product_name,
            platform,
            price,
            shieldcart_fee,
            delivery_address,
            razorpay_order_id,
            payment_status: body.payment_status || "paid",
            status: "ordered",
        }).select().single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
