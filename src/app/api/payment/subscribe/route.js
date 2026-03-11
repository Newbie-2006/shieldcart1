import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
    try {
        const { plan_id, user_id } = await request.json();
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const razorpay = getRazorpay();

        const subscription = await razorpay.subscriptions.create({
            plan_id: plan_id,
            total_count: 12,
            quantity: 1,
        });

        // Save subscription record
        const startsAt = new Date();
        const endsAt = new Date();
        endsAt.setMonth(endsAt.getMonth() + 1);

        await supabase.from("subscriptions").insert({
            user_id: user.id,
            plan: "monthly",
            status: "active",
            razorpay_sub_id: subscription.id,
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
        });

        return NextResponse.json({
            subscription_id: subscription.id,
            short_url: subscription.short_url,
        });
    } catch (error) {
        console.error("Subscribe error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
