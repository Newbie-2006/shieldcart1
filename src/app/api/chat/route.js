import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

const SYSTEM_PROMPT = `You are ShieldBot, the AI shopping assistant for ShieldCart — India's consumer protection platform that physically inspects every product before delivery. Help users: (1) pick products based on reviews and budget, (2) analyse user reviews to spot fakes and summarise pros/cons with a trust score out of 10, (3) compare products across Amazon, Flipkart, Meesho, Myntra, Nykaa, (4) understand ShieldCart's physical inspection process and how it protects them, (5) guide them to place a ShieldCart-verified order, (6) tell them the status of their orders when asked. Be warm, trustworthy, concise, and end every reply with a helpful follow-up question.`;

export async function POST(request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Groq API key not configured. Set GROQ_API_KEY in .env.local" },
                { status: 500 }
            );
        }

        // Check if user is asking about order status
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
        const isOrderQuery = lastMessage.includes("order") || lastMessage.includes("status") ||
            lastMessage.includes("track") || lastMessage.includes("delivery") ||
            lastMessage.includes("where is") || lastMessage.includes("cancel") ||
            lastMessage.includes("refund");

        let orderContext = "";

        if (isOrderQuery) {
            try {
                const supabase = await createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const serviceSupabase = await createServiceClient();
                    const { data: orders } = await serviceSupabase
                        .from("orders")
                        .select("id, product_name, platform, price, status, payment_status, created_at, inspector_id")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false })
                        .limit(10);

                    if (orders && orders.length > 0) {
                        const dummyAgents = {
                            "agent-rahul": "Rahul Sharma",
                            "agent-priya": "Priya Patel",
                            "agent-arjun": "Arjun Mehta",
                            "agent-sneha": "Sneha Reddy",
                            "agent-vikram": "Vikram Singh",
                            "agent-ananya": "Ananya Gupta",
                        };

                        const orderList = orders.map((o, i) => {
                            const agent = o.inspector_id?.startsWith("agent-")
                                ? dummyAgents[o.inspector_id] || "Assigned"
                                : o.inspector_id ? "Assigned" : "Not yet assigned";
                            const date = new Date(o.created_at).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric"
                            });
                            return `${i + 1}. ${o.product_name} (${o.platform}) — ₹${o.price} — Status: ${o.status.toUpperCase()} — Payment: ${o.payment_status} — Agent: ${agent} — Ordered: ${date} — ID: #${o.id.slice(0, 8)}`;
                        }).join("\n");

                        orderContext = `\n\nThe user has the following recent orders:\n${orderList}\n\nUse this information to answer questions about their orders. Present the information in a friendly, readable format. Use emojis for status indicators.`;
                    } else {
                        orderContext = "\n\nThe user has no orders yet. Encourage them to place their first order on ShieldCart.";
                    }
                } else {
                    orderContext = "\n\nThe user is not logged in. Ask them to log in first to check their order status.";
                }
            } catch (err) {
                console.error("Error fetching orders for chat:", err);
                orderContext = "\n\nCould not fetch order details at this time.";
            }
        }

        // Build messages in OpenAI-compatible format for Groq
        const groqMessages = [
            { role: "system", content: SYSTEM_PROMPT + orderContext },
            ...messages.map((msg) => ({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content,
            })),
        ];

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: groqMessages,
                    max_tokens: 1024,
                    temperature: 0.7,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Groq API error:", errorData);
            return NextResponse.json(
                { error: "Failed to get response from AI" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const assistantMessage =
            data.choices?.[0]?.message?.content ||
            "Sorry, I could not generate a response.";

        return NextResponse.json({ reply: assistantMessage });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
