import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { generateCertificate } from "@/lib/generate-certificate";
import { sendInspectionPassedEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, checklist, notes, defects_found } = body;

        // Update inspection
        const serviceSupabase = await createServiceClient();
        const { data: inspection, error } = await serviceSupabase
            .from("inspections")
            .update({
                status,
                checklist,
                notes,
                defects_found: defects_found || [],
                inspected_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select("*, order:orders(*, user:profiles!orders_user_id_fkey(full_name, email))")
            .single();

        if (error) throw error;

        const order = inspection.order;

        // Update order status
        const newOrderStatus = status === "passed" ? "passed" : "failed";
        await serviceSupabase
            .from("orders")
            .update({ status: newOrderStatus })
            .eq("id", order.id);

        // If passed: generate PDF, email it
        if (status === "passed") {
            try {
                // Get inspector name
                const { data: inspector } = await serviceSupabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                // Generate PDF
                const pdfBuffer = await generateCertificate({
                    orderId: order.id,
                    productName: order.product_name,
                    platform: order.platform,
                    inspectorName: inspector?.full_name || "ShieldCart Inspector",
                    checklist,
                    inspectedAt: new Date().toISOString(),
                });

                // Upload to Supabase Storage
                const fileName = `certificates/${order.id}.pdf`;
                await serviceSupabase.storage
                    .from("shieldcart")
                    .upload(fileName, pdfBuffer, {
                        contentType: "application/pdf",
                        upsert: true,
                    });

                // Send email with certificate
                if (order.user?.email) {
                    await sendInspectionPassedEmail({
                        to: order.user.email,
                        customerName: order.user.full_name,
                        orderDetails: {
                            orderId: order.id,
                            productName: order.product_name,
                            platform: order.platform,
                            inspectorName: inspector?.full_name || "ShieldCart Inspector",
                        },
                        certificateBuffer: pdfBuffer,
                    });
                }
            } catch (certErr) {
                console.error("Certificate/email error:", certErr);
                // Don't fail the whole request if cert/email fails
            }
        }

        return NextResponse.json(inspection);
    } catch (error) {
        console.error("Inspection result error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
