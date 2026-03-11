import { NextResponse } from "next/server";
import { sendOrderUpdateEmail } from "@/lib/resend";

export async function POST(request) {
    try {
        const body = await request.json();
        const { to, customerName, productName, status } = body;

        const result = await sendOrderUpdateEmail({
            to,
            customerName,
            productName,
            status,
        });

        return NextResponse.json({ success: true, id: result?.data?.id });
    } catch (error) {
        console.error("Order update email error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
