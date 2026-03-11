import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are ShieldBot, the AI shopping assistant for ShieldCart — India's consumer protection platform that physically inspects every product before delivery. Help users: (1) pick products based on reviews and budget, (2) analyse user reviews to spot fakes and summarise pros/cons with a trust score out of 10, (3) compare products across Amazon, Flipkart, Meesho, Myntra, Nykaa, (4) understand ShieldCart's physical inspection process and how it protects them, (5) guide them to place a ShieldCart-verified order. Be warm, trustworthy, concise, and end every reply with a helpful follow-up question.`;

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

        // Build messages in OpenAI-compatible format for Groq
        const groqMessages = [
            { role: "system", content: SYSTEM_PROMPT },
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
