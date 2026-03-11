import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export async function PATCH(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role using service client to avoid RLS issues
        const serviceSupabase = await createServiceClient();
        const { data: profile } = await serviceSupabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role !== "inspector" && profile?.role !== "admin") {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const updateData = {};

        if (body.status) updateData.status = body.status;
        if (body.inspector_id) updateData.inspector_id = body.inspector_id;

        const { data, error } = await serviceSupabase
            .from("orders")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // Send email notification for status updates
        if (body.status) {
            try {
                const { data: order } = await serviceSupabase
                    .from("orders")
                    .select("*, user:profiles!orders_user_id_fkey(full_name, email)")
                    .eq("id", id)
                    .single();

                if (order?.user?.email) {
                    await fetch(new URL("/api/emails/order-update", request.url), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: order.user.email,
                            customerName: order.user.full_name,
                            productName: order.product_name,
                            status: body.status,
                        }),
                    });
                }
            } catch (emailErr) {
                console.error("Email notification error:", emailErr);
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Update order status error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
