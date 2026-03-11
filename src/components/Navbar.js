"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

export default function Navbar({ showAuth = true }) {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                setProfile(data);
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const getDashboardLink = () => {
        if (!profile) return "/dashboard";
        if (profile.role === "admin") return "/admin";
        if (profile.role === "inspector") return "/inspector";
        return "/dashboard";
    };

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 52px",
                background: "rgba(250,247,242,0.92)",
                backdropFilter: "blur(14px)",
                borderBottom: "1px solid var(--sand3)",
            }}
        >
            <Link
                href="/"
                style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "var(--bark)",
                    letterSpacing: "-0.02em",
                    textDecoration: "none",
                }}
            >
                Shield<span style={{ color: "var(--olive)" }}>Cart</span>
                <sup
                    style={{
                        fontSize: "0.5rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--burnt)",
                        fontWeight: 700,
                        verticalAlign: "super",
                        marginLeft: "3px",
                    }}
                >
                    ®
                </sup>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                {user ? (
                    <>
                        <span
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 500,
                                color: "var(--stone)",
                            }}
                        >
                            {profile?.full_name || user.email}
                        </span>
                        {profile?.role && (
                            <span className="badge badge-olive" style={{ fontSize: "0.65rem" }}>
                                {profile.role}
                            </span>
                        )}
                        <Link
                            href={getDashboardLink()}
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: "var(--olive)",
                                textDecoration: "none",
                            }}
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "var(--sand2)",
                                color: "var(--bark)",
                                fontFamily: "'Manrope', sans-serif",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                padding: "8px 18px",
                                borderRadius: "100px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    showAuth && (
                        <>
                            <Link
                                href="/login"
                                style={{
                                    fontSize: "0.82rem",
                                    fontWeight: 500,
                                    color: "var(--stone)",
                                    textDecoration: "none",
                                }}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                style={{
                                    background: "var(--olive2)",
                                    color: "var(--white)",
                                    fontSize: "0.72rem",
                                    fontWeight: 800,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    padding: "10px 20px",
                                    borderRadius: "100px",
                                    textDecoration: "none",
                                }}
                            >
                                Get Started
                            </Link>
                        </>
                    )
                )}
            </div>
        </nav>
    );
}
