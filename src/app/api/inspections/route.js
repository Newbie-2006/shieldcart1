import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { order_id, checklist } = body;

        const { data, error } = await supabase.from("inspections").insert({
            order_id,
            inspector_id: user.id,
            checklist: checklist || {
                packaging_intact: false,
                correct_item: false,
                no_defects: false,
                serial_number_matches: false,
                all_accessories_present: false,
            },
        }).select().single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
