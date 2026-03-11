"use client";
import { useState, useRef, useEffect } from "react";

const SUGGESTED_PROMPTS = [
    "Help me pick headphones under ₹5000",
    "Analyse reviews for Sony WH-1000XM5",
    "How does inspection work?",
    "Compare iPhone 16 across platforms",
    "Is this Flipkart seller trustworthy?",
    "What happens if my product fails inspection?",
];

export default function ShieldBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showChips, setShowChips] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        setShowChips(false);
        const userMsg = { role: "user", content: text.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.reply },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            "Sorry, I encountered an error. Please try again in a moment.",
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, I couldn\u2019t connect. Please check your internet and try again.",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <>
            <style>{`
                @keyframes sb-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes sb-pop-in {
                    0% { opacity: 0; transform: scale(0.7) translateY(20px); }
                    60% { opacity: 1; transform: scale(1.03) translateY(-4px); }
                    80% { transform: scale(0.98) translateY(1px); }
                    100% { transform: scale(1) translateY(0); }
                }
                @keyframes sb-dot-bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-6px); }
                }
                .sb-fab {
                    position: fixed;
                    bottom: 28px;
                    right: 28px;
                    z-index: 9999;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #5c6b3a 0%, #4a5630 100%);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    box-shadow: 0 6px 28px rgba(92,107,58,0.4), 0 2px 8px rgba(0,0,0,0.12);
                    animation: sb-float 3s ease-in-out infinite;
                    transition: box-shadow 0.3s;
                }
                .sb-fab:hover {
                    box-shadow: 0 8px 36px rgba(92,107,58,0.55), 0 2px 12px rgba(0,0,0,0.18);
                }
                .sb-window {
                    position: fixed;
                    bottom: 28px;
                    right: 28px;
                    z-index: 10000;
                    width: 400px;
                    height: 600px;
                    background: #faf7f2;
                    border-radius: 24px;
                    border: 1px solid #ddd0bc;
                    box-shadow: 0 20px 60px rgba(59,47,30,0.2), 0 4px 16px rgba(0,0,0,0.08);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: sb-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                    font-family: 'Manrope', sans-serif;
                }
                .sb-header {
                    background: linear-gradient(135deg, #5c6b3a 0%, #4a5630 100%);
                    padding: 18px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }
                .sb-header-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .sb-header-icon {
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                }
                .sb-header h3 {
                    color: #fefcf9;
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .sb-header small {
                    color: rgba(254,252,249,0.65);
                    font-size: 0.7rem;
                    font-weight: 500;
                    display: block;
                    margin-top: 1px;
                }
                .sb-close {
                    background: rgba(255,255,255,0.12);
                    border: none;
                    color: #fefcf9;
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .sb-close:hover {
                    background: rgba(255,255,255,0.25);
                }
                .sb-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 18px 16px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .sb-messages::-webkit-scrollbar { width: 5px; }
                .sb-messages::-webkit-scrollbar-track { background: transparent; }
                .sb-messages::-webkit-scrollbar-thumb { background: #c8d4a8; border-radius: 3px; }
                .sb-msg {
                    max-width: 85%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 0.85rem;
                    line-height: 1.65;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                }
                .sb-msg-user {
                    align-self: flex-end;
                    background: #5c6b3a;
                    color: #fefcf9;
                    border-bottom-right-radius: 6px;
                }
                .sb-msg-bot {
                    align-self: flex-start;
                    background: #fefcf9;
                    color: #3b2f1e;
                    border: 1px solid #e8dece;
                    border-bottom-left-radius: 6px;
                }
                .sb-welcome {
                    text-align: center;
                    padding: 12px 8px 4px;
                }
                .sb-welcome-icon {
                    font-size: 2.2rem;
                    margin-bottom: 8px;
                }
                .sb-welcome h4 {
                    font-family: 'Lora', serif;
                    color: #3b2f1e;
                    font-size: 1.15rem;
                    font-weight: 500;
                    margin: 0 0 4px;
                }
                .sb-welcome p {
                    color: #7a6e62;
                    font-size: 0.82rem;
                    margin: 0;
                    font-weight: 400;
                }
                .sb-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 4px 16px 10px;
                    justify-content: center;
                }
                .sb-chip {
                    background: #fefcf9;
                    border: 1.5px solid #c8d4a8;
                    border-radius: 100px;
                    padding: 8px 14px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #4a5630;
                    cursor: pointer;
                    font-family: 'Manrope', sans-serif;
                    transition: background 0.2s, border-color 0.2s, transform 0.2s;
                    white-space: nowrap;
                }
                .sb-chip:hover {
                    background: #edf0e6;
                    border-color: #5c6b3a;
                    transform: translateY(-1px);
                }
                .sb-typing {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 12px 16px;
                    align-self: flex-start;
                    background: #fefcf9;
                    border: 1px solid #e8dece;
                    border-radius: 18px;
                    border-bottom-left-radius: 6px;
                }
                .sb-dot {
                    width: 7px;
                    height: 7px;
                    background: #5c6b3a;
                    border-radius: 50%;
                    opacity: 0.5;
                    animation: sb-dot-bounce 1.4s ease-in-out infinite;
                }
                .sb-dot:nth-child(2) { animation-delay: 0.16s; }
                .sb-dot:nth-child(3) { animation-delay: 0.32s; }
                .sb-input-area {
                    padding: 12px 14px;
                    border-top: 1px solid #e8dece;
                    background: #fefcf9;
                    display: flex;
                    gap: 10px;
                    align-items: flex-end;
                    flex-shrink: 0;
                }
                .sb-textarea {
                    flex: 1;
                    border: 1.5px solid #ddd0bc;
                    border-radius: 14px;
                    padding: 10px 14px;
                    font-size: 0.85rem;
                    font-family: 'Manrope', sans-serif;
                    color: #3b2f1e;
                    background: #faf7f2;
                    resize: none;
                    outline: none;
                    max-height: 80px;
                    line-height: 1.5;
                    transition: border-color 0.2s;
                }
                .sb-textarea:focus {
                    border-color: #5c6b3a;
                    box-shadow: 0 0 0 3px rgba(92,107,58,0.1);
                }
                .sb-textarea::placeholder { color: #a09488; }
                .sb-send {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    border: none;
                    background: #5c6b3a;
                    color: #fefcf9;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                    transition: background 0.2s, transform 0.2s;
                }
                .sb-send:hover { background: #4a5630; transform: translateY(-1px); }
                .sb-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .sb-trust {
                    padding: 10px 16px;
                    background: #edf0e6;
                    border-top: 1px solid #c8d4a8;
                    text-align: center;
                    font-size: 0.68rem;
                    font-weight: 600;
                    color: #4a5630;
                    letter-spacing: 0.02em;
                    flex-shrink: 0;
                }
                @media (max-width: 480px) {
                    .sb-window {
                        width: calc(100vw - 16px);
                        height: calc(100vh - 80px);
                        bottom: 8px;
                        right: 8px;
                        border-radius: 20px;
                    }
                    .sb-fab {
                        bottom: 18px;
                        right: 18px;
                        width: 52px;
                        height: 52px;
                    }
                }
            `}</style>

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    className="sb-fab"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open ShieldBot chat assistant"
                    title="Chat with ShieldBot"
                >
                    🛡️
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="sb-window">
                    {/* Header */}
                    <div className="sb-header">
                        <div className="sb-header-title">
                            <div className="sb-header-icon">🛡️</div>
                            <div>
                                <h3>
                                    Shield<span style={{ color: "#c8d4a8" }}>Bot</span>
                                </h3>
                                <small>AI Shopping Assistant</small>
                            </div>
                        </div>
                        <button
                            className="sb-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="sb-messages">
                        {messages.length === 0 && (
                            <div className="sb-welcome">
                                <div className="sb-welcome-icon">🛡️</div>
                                <h4>
                                    Hey! I&apos;m{" "}
                                    <span style={{ color: "#5c6b3a" }}>ShieldBot</span>
                                </h4>
                                <p>
                                    Your AI shopping assistant. Ask me about products,
                                    reviews, comparisons, or how ShieldCart keeps you
                                    safe.
                                </p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`sb-msg ${msg.role === "user"
                                        ? "sb-msg-user"
                                        : "sb-msg-bot"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="sb-typing">
                                <div className="sb-dot" />
                                <div className="sb-dot" />
                                <div className="sb-dot" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Chips */}
                    {showChips && messages.length === 0 && (
                        <div className="sb-chips">
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    className="sb-chip"
                                    onClick={() => sendMessage(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="sb-input-area">
                        <textarea
                            ref={textareaRef}
                            className="sb-textarea"
                            rows={1}
                            placeholder="Ask ShieldBot anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isTyping}
                        />
                        <button
                            className="sb-send"
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isTyping}
                            aria-label="Send message"
                        >
                            ↑
                        </button>
                    </div>

                    {/* Trust Badge */}
                    <div className="sb-trust">
                        ✦ All orders placed via ShieldBot include ShieldCart
                        physical inspection
                    </div>
                </div>
            )}
        </>
    );
}
