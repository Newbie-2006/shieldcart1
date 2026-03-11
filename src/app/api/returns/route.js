import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { order_id, reason } = await request.json();

        if (!order_id || !reason) {
            return NextResponse.json({ error: "Missing order_id or reason" }, { status: 400 });
        }

        // Verify the order belongs to this user
        const { data: order } = await supabase
            .from("orders")
            .select("id, user_id, status")
            .eq("id", order_id)
            .eq("user_id", user.id)
            .single();

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status !== "delivered") {
            return NextResponse.json({ error: "Can only return delivered orders" }, { status: 400 });
        }

        const { data, error } = await supabase.from("returns").insert({
            order_id,
            reason,
            status: "requested",
        }).select().single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
