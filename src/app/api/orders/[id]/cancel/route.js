import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export async function POST(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const serviceSupabase = await createServiceClient();

        // Get order and verify ownership
        const { data: order, error: fetchError } = await serviceSupabase
            .from("orders")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.user_id !== user.id) {
            return NextResponse.json({ error: "Not your order" }, { status: 403 });
        }

        if (order.status === "delivered" || order.status === "cancelled" || order.status === "refunded") {
            return NextResponse.json({ error: "Cannot cancel this order" }, { status: 400 });
        }

        // Cancel order and simulate refund
        const refundAmount = (order.price || 0) + (order.shieldcart_fee || 0);

        const { error: updateError } = await serviceSupabase
            .from("orders")
            .update({
                status: "cancelled",
                payment_status: "refunded",
            })
            .eq("id", id);

        if (updateError) throw updateError;

        return NextResponse.json({
            message: "Order cancelled and refund processed",
            refundAmount,
            refund_id: `refund_${Date.now()}`,
        });
    } catch (error) {
        console.error("Cancel order error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
