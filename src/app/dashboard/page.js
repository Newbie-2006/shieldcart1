"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase-browser";

const PLATFORM_COLORS = {
    Amazon: "#e47911",
    Flipkart: "#2874f0",
    Meesho: "#9b2de8",
    Myntra: "#ff3e6c",
    Nykaa: "#fc2779",
};

const PLATFORM_ICONS = {
    Amazon: "🛒",
    Flipkart: "🏷️",
    Meesho: "🛍️",
    Myntra: "👗",
    Nykaa: "💄",
};

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [returnModal, setReturnModal] = useState(null);
    const [returnReason, setReturnReason] = useState("");
    const [submittingReturn, setSubmittingReturn] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }
            setUser(user);

            const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            setProfile(prof);

            // Fetch orders
            const { data: orderData } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            setOrders(orderData || []);
            setLoading(false);

            // Subscribe to realtime changes
            const channel = supabase
                .channel("orders-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "orders",
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        if (payload.eventType === "INSERT") {
                            setOrders((prev) => [payload.new, ...prev]);
                        } else if (payload.eventType === "UPDATE") {
                            setOrders((prev) =>
                                prev.map((o) => (o.id === payload.new.id ? payload.new : o))
                            );
                        } else if (payload.eventType === "DELETE") {
                            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();

            return () => supabase.removeChannel(channel);
        };
        init();
    }, []);

    const handleReturnSubmit = async () => {
        if (!returnReason.trim()) return;
        setSubmittingReturn(true);
        try {
            const res = await fetch("/api/returns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_id: returnModal,
                    reason: returnReason,
                }),
            });
            if (res.ok) {
                setReturnModal(null);
                setReturnReason("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingReturn(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--canvas)" }}>
            <Navbar />
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    padding: "110px 24px 60px",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "36px",
                        animation: "riseUp 0.5s ease both",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "2rem",
                                fontWeight: 500,
                                color: "var(--bark)",
                            }}
                        >
                            Welcome back, <em style={{ color: "var(--olive)" }}>{profile?.full_name || "User"}</em>
                        </h1>
                        <p style={{ color: "var(--stone)", fontSize: "0.9rem", marginTop: "4px" }}>
                            Track your orders and request returns
                        </p>
                    </div>
                    <Link
                        href="/order/new"
                        className="btn-olive"
                        style={{ textDecoration: "none" }}
                    >
                        + Place New Order
                    </Link>
                </div>

                {/* Orders */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <div className="spinner" style={{ margin: "0 auto" }} />
                        <p style={{ color: "var(--stone)", marginTop: "16px", fontSize: "0.88rem" }}>
                            Loading your orders...
                        </p>
                    </div>
                ) : orders.length === 0 ? (
                    <div
                        className="sc-card"
                        style={{
                            textAlign: "center",
                            padding: "60px 40px",
                            animation: "riseUp 0.5s 0.1s ease both",
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🛒</div>
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.3rem", color: "var(--bark)", marginBottom: "8px" }}>
                            No orders yet
                        </h3>
                        <p style={{ color: "var(--stone)", fontSize: "0.9rem", marginBottom: "24px" }}>
                            Place your first order and we&#39;ll inspect it before delivery.
                        </p>
                        <Link href="/order/new" className="btn-olive" style={{ textDecoration: "none" }}>
                            Place Your First Order
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {orders.map((order, idx) => (
                            <div
                                key={order.id}
                                className="sc-card"
                                style={{
                                    animation: `riseUp 0.5s ${0.05 * idx}s ease both`,
                                    cursor: "pointer",
                                }}
                                onClick={() => router.push(`/order/${order.id}`)}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <div>
                                        <h3
                                            style={{
                                                fontWeight: 700,
                                                fontSize: "1rem",
                                                color: "var(--bark)",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            {order.product_name}
                                        </h3>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <span
                                                style={{
                                                    background: "var(--canvas)",
                                                    border: "1.5px solid var(--sand3)",
                                                    borderRadius: "10px",
                                                    padding: "4px 12px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700,
                                                    color: PLATFORM_COLORS[order.platform] || "var(--bark)",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                {PLATFORM_ICONS[order.platform]} {order.platform}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--stone2)",
                                                }}
                                            >
                                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span
                                            style={{
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                fontSize: "1.2rem",
                                                fontWeight: 500,
                                                color: "var(--olive2)",
                                            }}
                                        >
                                            ₹{Number(order.price).toLocaleString("en-IN")}
                                        </span>
                                        {order.shieldcart_fee > 0 && (
                                            <div style={{ fontSize: "0.7rem", color: "var(--stone2)" }}>
                                                + ₹{order.shieldcart_fee} fee
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <StatusBar status={order.status} />

                                {/* Inspector & Payment info */}
                                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                                    {order.inspector_id && (
                                        <span style={{
                                            fontSize: "0.75rem", fontWeight: 600,
                                            background: "#ECFDF5", color: "#059669",
                                            padding: "4px 10px", borderRadius: "8px",
                                            display: "inline-flex", alignItems: "center", gap: "4px",
                                        }}>
                                            👤 Agent: {
                                                order.inspector_id.startsWith("agent-")
                                                    ? {
                                                        "agent-rahul": "Rahul Sharma",
                                                        "agent-priya": "Priya Patel",
                                                        "agent-arjun": "Arjun Mehta",
                                                        "agent-sneha": "Sneha Reddy",
                                                        "agent-vikram": "Vikram Singh",
                                                        "agent-ananya": "Ananya Gupta",
                                                    }[order.inspector_id] || "Assigned"
                                                    : "Assigned"
                                            }
                                        </span>
                                    )}
                                    {order.payment_status && (
                                        <span style={{
                                            fontSize: "0.75rem", fontWeight: 600,
                                            background: order.payment_status === "refunded" ? "#FEF2F2" : order.payment_status === "cod" ? "#FFF7ED" : "#EFF6FF",
                                            color: order.payment_status === "refunded" ? "#DC2626" : order.payment_status === "cod" ? "#C2410C" : "#2563EB",
                                            padding: "4px 10px", borderRadius: "8px",
                                        }}>
                                            {order.payment_status === "cod" ? "💵 COD" : order.payment_status === "refunded" ? "↩️ Refunded" : "💳 Paid"}
                                        </span>
                                    )}
                                </div>

                                {order.status === "delivered" && (
                                    <div style={{ marginTop: "14px", textAlign: "right" }}>
                                        <button
                                            className="btn-soft btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setReturnModal(order.id);
                                            }}
                                        >
                                            🔄 Request Return
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Return Modal */}
            {returnModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(15,23,42,0.5)",
                        zIndex: 500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        animation: "fadeIn 0.2s ease",
                    }}
                    onClick={() => setReturnModal(null)}
                >
                    <div
                        style={{
                            background: "var(--white)",
                            borderRadius: "24px",
                            padding: "36px",
                            maxWidth: "480px",
                            width: "100%",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "1.3rem",
                                color: "var(--bark)",
                                marginBottom: "8px",
                            }}
                        >
                            Request Return
                        </h3>
                        <p style={{ color: "var(--stone)", fontSize: "0.85rem", marginBottom: "20px" }}>
                            Tell us why you&apos;d like to return this order. We&apos;ll handle everything from here.
                        </p>
                        <textarea
                            className="sc-textarea"
                            placeholder="Describe the reason for return..."
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            style={{ marginBottom: "20px" }}
                        />
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button className="btn-soft btn-small" onClick={() => setReturnModal(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn-olive btn-small"
                                onClick={handleReturnSubmit}
                                disabled={submittingReturn || !returnReason.trim()}
                            >
                                {submittingReturn ? "Submitting..." : "Submit Return Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
