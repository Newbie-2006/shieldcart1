import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

export async function PATCH(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role !== "inspector" && profile?.role !== "admin") {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const { id } = await params;
        const { status, fraud_flag, mismatch_notes } = await request.json();

        const serviceSupabase = await createServiceClient();

        const { data: returnData, error } = await serviceSupabase
            .from("returns")
            .update({
                status,
                fraud_flag: fraud_flag || false,
                mismatch_notes: mismatch_notes || null,
                verified_by: user.id,
                verified_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select("*, order:orders(user_id)")
            .single();

        if (error) throw error;

        // If fraud flagged, add to blacklist
        if (fraud_flag && returnData?.order?.user_id) {
            await serviceSupabase.from("blacklist").insert({
                user_id: returnData.order.user_id,
                reason: mismatch_notes || "Fraudulent return flagged by inspector",
                flagged_by: user.id,
            });
        }

        return NextResponse.json(returnData);
    } catch (error) {
        console.error("Verify return error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
