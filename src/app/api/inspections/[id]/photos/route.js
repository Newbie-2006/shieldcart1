import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get("file");
        const photoType = formData.get("photo_type") || "product";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert to buffer and upload to Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await uploadImage(buffer, `shieldcart/inspections/${id}`);

        // Save to database
        const { data, error } = await supabase.from("inspection_photos").insert({
            inspection_id: id,
            photo_url: result.secure_url,
            photo_type: photoType,
        }).select().single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Photo upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
