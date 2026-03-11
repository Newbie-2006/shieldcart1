import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(request) {
    try {
        const body = await request.json();
        const id = body.user_id || body.id;
        const { email, full_name, phone } = body;

        if (!id || !email || !full_name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = await createServiceClient();

        const { data, error } = await supabase.from("profiles").insert({
            id,
            email,
            full_name,
            phone: phone || null,
            role: "customer",
        }).select().single();

        if (error) {
            // Profile might already exist (e.g., from auth trigger)
            if (error.code === "23505") {
                return NextResponse.json({ message: "Profile already exists" }, { status: 200 });
            }
            throw error;
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Signup API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
