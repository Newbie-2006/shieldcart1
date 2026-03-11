import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { generateCertificate } from "@/lib/generate-certificate";

export async function GET(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get inspection with order details
        const serviceSupabase = await createServiceClient();
        const { data: inspection } = await serviceSupabase
            .from("inspections")
            .select("*, order:orders(id, product_name, platform), inspector:profiles!inspections_inspector_id_fkey(full_name)")
            .eq("id", id)
            .single();

        if (!inspection || inspection.status !== "passed") {
            return NextResponse.json({ error: "Certificate not available" }, { status: 404 });
        }

        // Try to fetch from storage first
        const fileName = `certificates/${inspection.order.id}.pdf`;
        const { data: fileData } = await serviceSupabase.storage
            .from("shieldcart")
            .download(fileName);

        let pdfBuffer;
        if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);
        } else {
            // Generate on-the-fly
            pdfBuffer = await generateCertificate({
                orderId: inspection.order.id,
                productName: inspection.order.product_name,
                platform: inspection.order.platform,
                inspectorName: inspection.inspector?.full_name || "ShieldCart Inspector",
                checklist: inspection.checklist,
                inspectedAt: inspection.inspected_at,
            });
        }

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="ShieldCart_Certificate_${inspection.order.id.substring(0, 8)}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Certificate download error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
