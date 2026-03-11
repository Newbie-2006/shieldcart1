"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });

            if (authError) throw authError;

            // Get user role for redirect
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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--canvas)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    animation: "riseUp 0.6s ease both",
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <Link
                        href="/"
                        style={{
                            fontFamily: "'Manrope', sans-serif",
                            fontSize: "1.8rem",
                            fontWeight: 800,
                            color: "var(--bark)",
                            letterSpacing: "-0.02em",
                            textDecoration: "none",
                        }}
                    >
                        Shield<span style={{ color: "var(--olive)" }}>Cart</span>
                        <sup
                            style={{
                                fontSize: "0.55rem",
                                color: "var(--burnt)",
                                fontWeight: 700,
                                verticalAlign: "super",
                                marginLeft: "3px",
                            }}
                        >
                            ®
                        </sup>
                    </Link>
                    <p
                        style={{
                            marginTop: "8px",
                            color: "var(--stone)",
                            fontSize: "0.9rem",
                            fontWeight: 300,
                        }}
                    >
                        Welcome back
                    </p>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: "var(--white)",
                        border: "1px solid var(--sand3)",
                        borderRadius: "24px",
                        padding: "40px 36px",
                        boxShadow: "0 4px 24px rgba(59,47,30,0.06)",
                    }}
                >
                    {error && (
                        <div
                            style={{
                                background: "#fde8e8",
                                border: "1px solid rgba(160,48,48,0.2)",
                                color: "#a03030",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                fontSize: "0.82rem",
                                fontWeight: 500,
                                marginBottom: "20px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "18px" }}>
                            <label className="sc-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="sc-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "28px" }}>
                            <label className="sc-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="sc-input"
                                placeholder="Your password"
                                value={form.password}
                                onChange={handleChange}
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
                            }}
                        >
                            {loading && <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />}
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "24px",
                        fontSize: "0.85rem",
                        color: "var(--stone)",
                    }}
                >
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        style={{ color: "var(--olive)", fontWeight: 600, textDecoration: "none" }}
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
