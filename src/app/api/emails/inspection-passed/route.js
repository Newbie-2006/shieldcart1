import { NextResponse } from "next/server";
import { sendInspectionPassedEmail } from "@/lib/resend";

export async function POST(request) {
    try {
        const body = await request.json();
        const { to, customerName, orderDetails, certificateBuffer } = body;

        const result = await sendInspectionPassedEmail({
            to,
            customerName,
            orderDetails,
            certificateBuffer: certificateBuffer ? Buffer.from(certificateBuffer) : null,
        });

        return NextResponse.json({ success: true, id: result?.data?.id });
    } catch (error) {
        console.error("Email error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
