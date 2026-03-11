"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.full_name } },
        });

        if (authError) { setError(authError.message); setLoading(false); return; }

        // Create profile
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: data.user.id,
                full_name: form.full_name,
                email: form.email,
                phone: form.phone,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            setError(err.error || "Failed to create profile");
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 50%, #F9FAFB 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
        }}>
            <div style={{
                width: "100%",
                maxWidth: "440px",
                animation: "riseUp 0.5s ease both",
            }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "36px" }}>
                    <div style={{
                        width: "42px", height: "42px",
                        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.3rem",
                        boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                    }}>🛡️</div>
                    <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "1.5rem", fontWeight: 800,
                        color: "#111827", letterSpacing: "-0.02em",
                    }}>Shield<span style={{ color: "#2563EB" }}>Cart</span></span>
                </Link>

                {/* Card */}
                <div style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "40px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(0,0,0,0.06)",
                }}>
                    <h1 style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "1.5rem", fontWeight: 800,
                        color: "#111827", marginBottom: "8px", textAlign: "center",
                    }}>Create your account</h1>
                    <p style={{ color: "#6B7280", fontSize: "0.9rem", textAlign: "center", marginBottom: "28px" }}>
                        Start shopping with verified products
                    </p>

                    {error && (
                        <div style={{
                            background: "#FEE2E2",
                            border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            marginBottom: "20px",
                            fontSize: "0.85rem",
                            color: "#DC2626",
                        }}>{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "16px" }}>
                            <label className="sc-label">Full Name</label>
                            <input type="text" name="full_name" className="sc-input" placeholder="John Doe" value={form.full_name} onChange={handleChange} required />
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <label className="sc-label">Email</label>
                            <input type="email" name="email" className="sc-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <label className="sc-label">Phone</label>
                            <input type="tel" name="phone" className="sc-input" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
                        </div>
                        <div style={{ marginBottom: "24px" }}>
                            <label className="sc-label">Password</label>
                            <input type="password" name="password" className="sc-input" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
                        </div>
                        <button type="submit" className="btn-olive" disabled={loading} style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontSize: "0.95rem",
                            padding: "16px",
                        }}>
                            {loading && <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />}
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>
                </div>

                <p style={{
                    textAlign: "center",
                    marginTop: "24px",
                    fontSize: "0.88rem",
                    color: "#6B7280",
                }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
