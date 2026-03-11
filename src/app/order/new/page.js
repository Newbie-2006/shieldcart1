"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-browser";

const PLATFORMS = ["Amazon", "Flipkart", "Meesho", "Myntra", "Nykaa"];

export default function NewOrderPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--canvas)' }}><Navbar /><div style={{ textAlign: 'center', paddingTop: '200px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div></div>}>
            <NewOrderForm />
        </Suspense>
    );
}

function NewOrderForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("online"); // "online" or "cod"
    const initialPlatform = searchParams.get("platform") || "Amazon";
    const [form, setForm] = useState({
        product_url: searchParams.get("product_url") || "",
        product_name: searchParams.get("product_name") || "",
        platform: PLATFORMS.includes(initialPlatform) ? initialPlatform : "Amazon",
        price: searchParams.get("price") || "",
        delivery_address: "",
    });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }
            setUser(user);

            // Check subscription
            const { data: subs } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", user.id)
                .eq("status", "active")
                .gte("ends_at", new Date().toISOString())
                .limit(1);

            if (subs && subs.length > 0) {
                setHasSubscription(true);
            }
        };
        init();
    }, []);

    const fee = hasSubscription ? 0 : 99;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const createOrder = async (paymentData) => {
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                price: Number(form.price),
                shieldcart_fee: fee,
                ...paymentData,
            }),
        });
        if (res.ok) {
            router.push("/dashboard");
        } else {
            const err = await res.json();
            alert(err.error || "Failed to create order");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const totalAmount = (Number(form.price) || 0) + fee;

            if (paymentMethod === "cod") {
                // ── CASH ON DELIVERY ──
                await createOrder({
                    razorpay_order_id: `cod_${Date.now()}`,
                    payment_status: "cod",
                    test_mode: true,
                });
            } else {
                // ── ONLINE PAYMENT ──
                const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
                const isTestMode = !razorpayKey || razorpayKey === "rzp_test_placeholder" || razorpayKey.includes("placeholder");

                if (isTestMode) {
                    const confirmed = window.confirm(
                        `💳 Payment Simulation\n\nProduct: ${form.product_name}\nAmount: ₹${totalAmount.toLocaleString("en-IN")}\n\nClick OK to simulate successful payment.`
                    );
                    if (!confirmed) { setLoading(false); return; }
                    await createOrder({
                        razorpay_order_id: `sim_${Date.now()}`,
                        test_mode: true,
                    });
                } else {
                    const orderRes = await fetch("/api/payment/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ amount: totalAmount }),
                    });
                    const orderData = await orderRes.json();
                    if (!orderRes.ok) throw new Error(orderData.error);

                    const loaded = await loadRazorpayScript();
                    if (!loaded) throw new Error("Razorpay SDK failed to load");

                    const options = {
                        key: razorpayKey,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: "ShieldCart",
                        description: `Inspection for ${form.product_name}`,
                        order_id: orderData.id,
                        handler: async (response) => {
                            await createOrder({
                                razorpay_order_id: orderData.id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                        },
                        prefill: { email: user?.email || "" },
                        theme: { color: "#2563EB" },
                        modal: { ondismiss: () => setLoading(false) },
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--canvas)" }}>
            <Navbar />
            <div
                style={{
                    maxWidth: "640px",
                    margin: "0 auto",
                    padding: "110px 24px 60px",
                    animation: "riseUp 0.5s ease both",
                }}
            >
                <Link
                    href="/dashboard"
                    style={{
                        fontSize: "0.82rem",
                        color: "var(--olive)",
                        textDecoration: "none",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "16px",
                    }}
                >
                    ← Back to Dashboard
                </Link>

                <h1
                    style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "1.8rem",
                        fontWeight: 500,
                        color: "var(--bark)",
                        marginBottom: "8px",
                    }}
                >
                    Place New <em style={{ color: "var(--olive)" }}>Order</em>
                </h1>
                <p style={{ color: "var(--stone)", fontSize: "0.9rem", marginBottom: "32px" }}>
                    Tell us what you want to buy. We&#39;ll make sure it&#39;s genuine.
                </p>

                <div
                    style={{
                        background: "var(--white)",
                        border: "1px solid var(--sand3)",
                        borderRadius: "24px",
                        padding: "36px",
                        boxShadow: "0 4px 24px rgba(59,47,30,0.06)",
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "18px" }}>
                            <label className="sc-label">Platform</label>
                            <select
                                name="platform"
                                className="sc-select"
                                value={form.platform}
                                onChange={handleChange}
                            >
                                {PLATFORMS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label className="sc-label">Product Name</label>
                            <input
                                type="text"
                                name="product_name"
                                className="sc-input"
                                placeholder="e.g., Samsung Galaxy S24 Ultra"
                                value={form.product_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label className="sc-label">Product URL</label>
                            <input
                                type="url"
                                name="product_url"
                                className="sc-input"
                                placeholder="https://www.amazon.in/dp/..."
                                value={form.product_url}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label className="sc-label">Product Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                className="sc-input"
                                placeholder="0"
                                value={form.price}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label className="sc-label">Delivery Address</label>
                            <textarea
                                name="delivery_address"
                                className="sc-textarea"
                                placeholder="Your full delivery address"
                                value={form.delivery_address}
                                onChange={handleChange}
                                required
                                style={{ minHeight: "80px" }}
                            />
                        </div>

                        {/* Fee summary */}
                        <div
                            style={{
                                background: hasSubscription ? "var(--olive-pale)" : "var(--sand)",
                                borderRadius: "16px",
                                padding: "20px",
                                marginBottom: "24px",
                                border: hasSubscription
                                    ? "1px solid var(--olive-mid)"
                                    : "1px solid var(--sand3)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                }}
                            >
                                <span style={{ fontSize: "0.85rem", color: "var(--stone)" }}>Product Price</span>
                                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--bark)" }}>
                                    ₹{Number(form.price || 0).toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "12px",
                                }}
                            >
                                <span style={{ fontSize: "0.85rem", color: "var(--stone)" }}>
                                    ShieldCart Inspection Fee
                                    {hasSubscription && (
                                        <span className="badge badge-olive" style={{ marginLeft: "8px", fontSize: "0.6rem" }}>
                                            SUBSCRIBER
                                        </span>
                                    )}
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        color: hasSubscription ? "var(--olive)" : "var(--burnt)",
                                    }}
                                >
                                    {hasSubscription ? (
                                        <>
                                            <span style={{ textDecoration: "line-through", color: "var(--stone2)", marginRight: "6px" }}>
                                                ₹99
                                            </span>
                                            ₹0
                                        </>
                                    ) : (
                                        "₹99"
                                    )}
                                </span>
                            </div>
                            <div
                                style={{
                                    borderTop: "1px solid var(--sand3)",
                                    paddingTop: "12px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--bark)" }}>
                                    Total
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Lora', serif",
                                        fontSize: "1.3rem",
                                        fontWeight: 500,
                                        color: "var(--olive2)",
                                    }}
                                >
                                    ₹{((Number(form.price) || 0) + fee).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", display: "block", marginBottom: "10px" }}>
                                Payment Method
                            </label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("online")}
                                    style={{
                                        flex: 1, padding: "14px 16px", borderRadius: "12px",
                                        border: paymentMethod === "online" ? "2px solid #2563EB" : "2px solid #E5E7EB",
                                        background: paymentMethod === "online" ? "#EFF6FF" : "white",
                                        cursor: "pointer", textAlign: "center",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{ fontSize: "1.3rem", marginBottom: "4px" }}>💳</div>
                                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: paymentMethod === "online" ? "#2563EB" : "#374151" }}>Pay Online</div>
                                    <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "2px" }}>UPI / Card / Netbanking</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("cod")}
                                    style={{
                                        flex: 1, padding: "14px 16px", borderRadius: "12px",
                                        border: paymentMethod === "cod" ? "2px solid #10B981" : "2px solid #E5E7EB",
                                        background: paymentMethod === "cod" ? "#ECFDF5" : "white",
                                        cursor: "pointer", textAlign: "center",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{ fontSize: "1.3rem", marginBottom: "4px" }}>🏠</div>
                                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: paymentMethod === "cod" ? "#059669" : "#374151" }}>Cash on Delivery</div>
                                    <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "2px" }}>Pay when you receive</div>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-olive"
                            disabled={loading}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                background: paymentMethod === "cod" ? "linear-gradient(135deg, #10B981, #059669)" : undefined,
                            }}
                        >
                            {loading && <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />}
                            {loading ? "Processing..." : paymentMethod === "cod"
                                ? `Place Order — ₹${((Number(form.price) || 0) + fee).toLocaleString("en-IN")} (COD)`
                                : `Pay ₹${((Number(form.price) || 0) + fee).toLocaleString("en-IN")} & Place Order`
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
