"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatusBar from "@/components/StatusBar";
import PhotoGallery from "@/components/PhotoGallery";
import { createClient } from "@/lib/supabase-browser";

const CHECKLIST_LABELS = {
    packaging_intact: "Packaging Intact",
    correct_item: "Correct Item Received",
    no_defects: "No Defects Found",
    serial_number_matches: "Serial Number Matches",
    all_accessories_present: "All Accessories Present",
};

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const supabase = createClient();
    const [order, setOrder] = useState(null);
    const [inspection, setInspection] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            // Fetch order
            const { data: orderData } = await supabase
                .from("orders")
                .select("*")
                .eq("id", params.id)
                .single();

            if (!orderData) { router.push("/dashboard"); return; }
            setOrder(orderData);

            // Fetch inspection
            const { data: inspData } = await supabase
                .from("inspections")
                .select("*, inspector:profiles!inspections_inspector_id_fkey(full_name)")
                .eq("order_id", params.id)
                .order("inspected_at", { ascending: false })
                .limit(1);

            if (inspData && inspData.length > 0) {
                setInspection(inspData[0]);

                // Fetch photos
                const { data: photoData } = await supabase
                    .from("inspection_photos")
                    .select("*")
                    .eq("inspection_id", inspData[0].id)
                    .order("taken_at", { ascending: true });

                setPhotos(photoData || []);
            }

            setLoading(false);

            // Realtime for this order
            const channel = supabase
                .channel(`order-${params.id}`)
                .on("postgres_changes", {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `id=eq.${params.id}`,
                }, (payload) => {
                    setOrder(payload.new);
                })
                .subscribe();

            return () => supabase.removeChannel(channel);
        };
        fetchData();
    }, [params.id]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--canvas)" }}>
                <Navbar />
                <div style={{ textAlign: "center", paddingTop: "200px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div style={{ minHeight: "100vh", background: "var(--canvas)" }}>
            <Navbar />
            <div
                style={{
                    maxWidth: "800px",
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
                        marginBottom: "24px",
                        display: "inline-block",
                    }}
                >
                    ← Back to Dashboard
                </Link>

                {/* Order Header Card */}
                <div className="sc-card" style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div>
                            <h1
                                style={{
                                    fontFamily: "'Lora', serif",
                                    fontSize: "1.5rem",
                                    fontWeight: 500,
                                    color: "var(--bark)",
                                    marginBottom: "8px",
                                }}
                            >
                                {order.product_name}
                            </h1>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                <span className="badge badge-olive">{order.platform}</span>
                                <span className="badge badge-sand">
                                    {order.payment_status === "paid" ? "💳 Paid" : order.payment_status}
                                </span>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "'Lora', serif", fontSize: "1.5rem", fontWeight: 500, color: "var(--olive2)" }}>
                                ₹{Number(order.price).toLocaleString("en-IN")}
                            </div>
                            {order.shieldcart_fee > 0 && (
                                <div style={{ fontSize: "0.75rem", color: "var(--stone2)" }}>+ ₹{order.shieldcart_fee} fee</div>
                            )}
                        </div>
                    </div>

                    <StatusBar status={order.status} />

                    <div
                        style={{
                            marginTop: "20px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px",
                            background: "var(--sand)",
                            borderRadius: "14px",
                            padding: "18px 20px",
                        }}
                    >
                        <div>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                                Order ID
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "var(--bark)", fontWeight: 500, fontFamily: "monospace" }}>
                                {order.id.substring(0, 8)}...
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                                Ordered On
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "var(--bark)", fontWeight: 500 }}>
                                {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                        </div>
                        {order.product_url && (
                            <div>
                                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                                    Product URL
                                </div>
                                <a
                                    href={order.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: "0.82rem", color: "var(--olive)", textDecoration: "underline" }}
                                >
                                    View on {order.platform} ↗
                                </a>
                            </div>
                        )}
                        <div>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                                Delivery Address
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--bark)" }}>
                                {order.delivery_address || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspection Details */}
                {inspection && (
                    <div className="sc-card" style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.2rem", fontWeight: 500, color: "var(--bark)" }}>
                                Inspection Report
                            </h2>
                            <span className={`badge ${inspection.status === "passed" ? "badge-olive" : "badge-danger"}`}>
                                {inspection.status === "passed" ? "✓ Passed" : "✗ Failed"}
                            </span>
                        </div>

                        {inspection.inspector && (
                            <div style={{ fontSize: "0.85rem", color: "var(--stone)", marginBottom: "16px" }}>
                                Inspected by <strong style={{ color: "var(--bark)" }}>{inspection.inspector.full_name}</strong>
                                {" "}on {new Date(inspection.inspected_at).toLocaleDateString("en-IN")}
                            </div>
                        )}

                        {/* Checklist */}
                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                                Inspection Checklist
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {Object.entries(CHECKLIST_LABELS).map(([key, label]) => {
                                    const passed = inspection.checklist?.[key];
                                    return (
                                        <div
                                            key={key}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "10px 14px",
                                                background: passed ? "var(--olive-pale)" : "#fff5f5",
                                                borderRadius: "10px",
                                                border: passed ? "1px solid var(--olive-mid)" : "1px solid rgba(160,48,48,0.15)",
                                            }}
                                        >
                                            <span style={{ fontSize: "0.85rem", color: "var(--bark)" }}>{label}</span>
                                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: passed ? "var(--olive)" : "#c04040" }}>
                                                {passed ? "✓ Pass" : "✗ Fail"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        {inspection.notes && (
                            <div style={{ marginBottom: "16px" }}>
                                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                                    Inspector Notes
                                </div>
                                <div style={{ fontSize: "0.88rem", color: "var(--bark)", background: "var(--sand)", padding: "14px 16px", borderRadius: "12px", lineHeight: 1.7 }}>
                                    {inspection.notes}
                                </div>
                            </div>
                        )}

                        {/* Defects */}
                        {inspection.defects_found && inspection.defects_found.length > 0 && (
                            <div style={{ marginBottom: "16px" }}>
                                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                                    Defects Found
                                </div>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {inspection.defects_found.map((d, i) => (
                                        <span key={i} className="badge badge-danger">{d}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certificate Download */}
                        {inspection.status === "passed" && (
                            <a
                                href={`/api/inspections/${inspection.id}/certificate`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-olive"
                                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "8px" }}
                            >
                                📄 Download Inspection Certificate
                            </a>
                        )}
                    </div>
                )}

                {/* Photo Gallery */}
                {photos.length > 0 && (
                    <div className="sc-card">
                        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.2rem", fontWeight: 500, color: "var(--bark)", marginBottom: "16px" }}>
                            Inspection Photos
                        </h2>
                        <PhotoGallery photos={photos} />
                    </div>
                )}
            </div>
        </div>
    );
}
