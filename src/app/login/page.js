"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Get role for redirect
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        const redirect = searchParams.get("redirect");
        if (redirect) {
            router.push(redirect);
        } else if (profile?.role === "admin") {
            router.push("/admin");
        } else if (profile?.role === "inspector") {
            router.push("/inspector");
        } else {
            router.push("/dashboard");
        }
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
                        color: "#111827", marginBottom: "8px",
                        textAlign: "center",
                    }}>Welcome back</h1>
                    <p style={{ color: "#6B7280", fontSize: "0.9rem", textAlign: "center", marginBottom: "28px" }}>
                        Sign in to track your verified orders
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
                        <div style={{ marginBottom: "18px" }}>
                            <label className="sc-label">Email</label>
                            <input
                                type="email"
                                className="sc-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: "24px" }}>
                            <label className="sc-label">Password</label>
                            <input
                                type="password"
                                className="sc-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
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
                                fontSize: "0.95rem",
                                padding: "16px",
                            }}
                        >
                            {loading && <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />}
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <p style={{
                    textAlign: "center",
                    marginTop: "24px",
                    fontSize: "0.88rem",
                    color: "#6B7280",
                }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
