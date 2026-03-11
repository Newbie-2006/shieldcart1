"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PhotoGallery from "@/components/PhotoGallery";
import { createClient } from "@/lib/supabase-browser";

const CHECKLIST_ITEMS = [
    { key: "packaging_intact", label: "Packaging Intact" },
    { key: "correct_item", label: "Correct Item Received" },
    { key: "no_defects", label: "No Defects Found" },
    { key: "serial_number_matches", label: "Serial Number Matches" },
    { key: "all_accessories_present", label: "All Accessories Present" },
];

const PHOTO_TYPES = [
    { value: "box_exterior", label: "Box Exterior" },
    { value: "box_interior", label: "Box Interior" },
    { value: "product", label: "Product" },
    { value: "serial_number", label: "Serial Number" },
    { value: "defect", label: "Defect" },
    { value: "return", label: "Return" },
];

export default function InspectorPage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inspection, setInspection] = useState(null);
    const [checklist, setChecklist] = useState({
        packaging_intact: false,
        correct_item: false,
        no_defects: false,
        serial_number_matches: false,
        all_accessories_present: false,
    });
    const [notes, setNotes] = useState("");
    const [defects, setDefects] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photoType, setPhotoType] = useState("product");
    const [photos, setPhotos] = useState([]);
    const [returnVerifyNotes, setReturnVerifyNotes] = useState("");

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }
            setUser(user);

            // Fetch assigned orders
            const { data: orderData } = await supabase
                .from("orders")
                .select("*, user:profiles!orders_user_id_fkey(full_name, email)")
                .eq("inspector_id", user.id)
                .in("status", ["arrived", "inspecting"])
                .order("created_at", { ascending: true });
            setOrders(orderData || []);

            // Fetch returns for inspection
            const { data: returnData } = await supabase
                .from("returns")
                .select("*, order:orders(*, user:profiles!orders_user_id_fkey(full_name))")
                .in("status", ["received", "verifying"])
                .order("created_at", { ascending: true });
            setReturns(returnData || []);

            setLoading(false);
        };
        init();
    }, []);

    const handleSelectOrder = async (order) => {
        setSelectedOrder(order);

        // Check for existing inspection
        const { data: inspData } = await supabase
            .from("inspections")
            .select("*")
            .eq("order_id", order.id)
            .eq("inspector_id", user.id)
            .limit(1);

        if (inspData && inspData.length > 0) {
            setInspection(inspData[0]);
            setChecklist(inspData[0].checklist || checklist);
            setNotes(inspData[0].notes || "");

            // Fetch photos
            const { data: photoData } = await supabase
                .from("inspection_photos")
                .select("*")
                .eq("inspection_id", inspData[0].id)
                .order("taken_at", { ascending: true });
            setPhotos(photoData || []);
        } else {
            // Create new inspection
            const { data: newInsp } = await supabase
                .from("inspections")
                .insert({
                    order_id: order.id,
                    inspector_id: user.id,
                    checklist,
                })
                .select()
                .single();
            setInspection(newInsp);
            setPhotos([]);

            // Update order status to inspecting
            await fetch(`/api/orders/${order.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "inspecting" }),
            });
        }
    };

    const handleChecklistChange = (key) => {
        setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !inspection) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("photo_type", photoType);

        try {
            const res = await fetch(`/api/inspections/${inspection.id}/photos`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setPhotos((prev) => [...prev, data]);
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleResult = async (result) => {
        if (!inspection) return;
        setSubmitting(true);

        try {
            const res = await fetch(`/api/inspections/${inspection.id}/result`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: result,
                    checklist,
                    notes,
                    defects_found: result === "failed" ? defects.split(",").map((d) => d.trim()).filter(Boolean) : [],
                }),
            });

            if (res.ok) {
                setSelectedOrder(null);
                setInspection(null);
                setChecklist({ packaging_intact: false, correct_item: false, no_defects: false, serial_number_matches: false, all_accessories_present: false });
                setNotes("");
                setDefects("");
                setPhotos([]);
                // Refresh orders
                const { data: orderData } = await supabase
                    .from("orders")
                    .select("*, user:profiles!orders_user_id_fkey(full_name, email)")
                    .eq("inspector_id", user.id)
                    .in("status", ["arrived", "inspecting"])
                    .order("created_at", { ascending: true });
                setOrders(orderData || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyReturn = async (returnId, decision, fraudFlag = false) => {
        try {
            await fetch(`/api/returns/${returnId}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: decision,
                    fraud_flag: fraudFlag,
                    mismatch_notes: returnVerifyNotes,
                }),
            });
            setSelectedReturn(null);
            setReturnVerifyNotes("");
            // Refresh returns
            const { data: returnData } = await supabase
                .from("returns")
                .select("*, order:orders(*, user:profiles!orders_user_id_fkey(full_name))")
                .in("status", ["received", "verifying"])
                .order("created_at", { ascending: true });
            setReturns(returnData || []);
        } catch (err) {
            console.error(err);
        }
    };

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

    return (
        <div style={{ minHeight: "100vh", background: "var(--canvas)" }}>
            <Navbar />
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "110px 24px 60px" }}>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "2rem", fontWeight: 500, color: "var(--bark)", marginBottom: "8px" }}>
                    Inspector <em style={{ color: "var(--olive)" }}>Dashboard</em>
                </h1>
                <p style={{ color: "var(--stone)", fontSize: "0.9rem", marginBottom: "32px" }}>
                    Inspect orders and verify returns
                </p>

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        gap: "4px",
                        marginBottom: "24px",
                        background: "var(--sand)",
                        borderRadius: "14px",
                        padding: "4px",
                        width: "fit-content",
                    }}
                >
                    {[
                        { key: "orders", label: `Orders (${orders.length})` },
                        { key: "returns", label: `Returns (${returns.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setSelectedOrder(null); setSelectedReturn(null); }}
                            style={{
                                padding: "10px 24px",
                                borderRadius: "10px",
                                border: "none",
                                background: activeTab === tab.key ? "var(--white)" : "transparent",
                                color: activeTab === tab.key ? "var(--olive2)" : "var(--stone)",
                                fontWeight: activeTab === tab.key ? 700 : 500,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                fontFamily: "'Inter', sans-serif",
                                boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                                transition: "all 0.2s",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: selectedOrder || selectedReturn ? "350px 1fr" : "1fr", gap: "20px" }}>
                    {/* Queue */}
                    <div>
                        {activeTab === "orders" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {orders.length === 0 ? (
                                    <div className="sc-card" style={{ textAlign: "center", padding: "40px" }}>
                                        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
                                        <p style={{ color: "var(--stone)", fontSize: "0.88rem" }}>No orders in queue</p>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="sc-card"
                                            onClick={() => handleSelectOrder(order)}
                                            style={{
                                                cursor: "pointer",
                                                borderColor: selectedOrder?.id === order.id ? "var(--olive)" : "var(--sand3)",
                                                borderWidth: selectedOrder?.id === order.id ? "2px" : "1px",
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--bark)", marginBottom: "4px" }}>
                                                        {order.product_name}
                                                    </h3>
                                                    <span className="badge badge-olive" style={{ fontSize: "0.6rem" }}>{order.platform}</span>
                                                </div>
                                                <span className="badge badge-burnt" style={{ fontSize: "0.6rem" }}>{order.status}</span>
                                            </div>
                                            <div style={{ fontSize: "0.78rem", color: "var(--stone)", marginTop: "8px" }}>
                                                Customer: {order.user?.full_name || "Unknown"}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "returns" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {returns.length === 0 ? (
                                    <div className="sc-card" style={{ textAlign: "center", padding: "40px" }}>
                                        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔄</div>
                                        <p style={{ color: "var(--stone)", fontSize: "0.88rem" }}>No returns to verify</p>
                                    </div>
                                ) : (
                                    returns.map((ret) => (
                                        <div
                                            key={ret.id}
                                            className="sc-card"
                                            onClick={() => setSelectedReturn(ret)}
                                            style={{
                                                cursor: "pointer",
                                                borderColor: selectedReturn?.id === ret.id ? "var(--burnt)" : "var(--sand3)",
                                                borderWidth: selectedReturn?.id === ret.id ? "2px" : "1px",
                                            }}
                                        >
                                            <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--bark)", marginBottom: "4px" }}>
                                                {ret.order?.product_name || "Unknown Product"}
                                            </h3>
                                            <p style={{ fontSize: "0.78rem", color: "var(--stone)", marginBottom: "6px" }}>
                                                Reason: {ret.reason}
                                            </p>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <span className="badge badge-burnt">{ret.status}</span>
                                                {ret.fraud_flag && <span className="badge badge-danger">⚠ FRAUD FLAG</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Inspection Detail */}
                    {selectedOrder && inspection && (
                        <div className="sc-card" style={{ animation: "slideDown 0.3s ease" }}>
                            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", fontWeight: 500, color: "var(--bark)", marginBottom: "20px" }}>
                                Inspect: {selectedOrder.product_name}
                            </h2>

                            {/* Photo Upload */}
                            <div style={{ marginBottom: "24px" }}>
                                <label className="sc-label">Upload Inspection Photo</label>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <select
                                        className="sc-select"
                                        style={{ width: "180px" }}
                                        value={photoType}
                                        onChange={(e) => setPhotoType(e.target.value)}
                                    >
                                        {PHOTO_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <label
                                        style={{
                                            background: "var(--olive-pale)",
                                            border: "1px dashed var(--olive-mid)",
                                            borderRadius: "12px",
                                            padding: "10px 20px",
                                            cursor: "pointer",
                                            fontSize: "0.82rem",
                                            fontWeight: 600,
                                            color: "var(--olive2)",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        {uploading ? "Uploading..." : "📷 Upload Photo"}
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden disabled={uploading} />
                                    </label>
                                </div>
                                {photos.length > 0 && (
                                    <div style={{ marginTop: "16px" }}>
                                        <PhotoGallery photos={photos} />
                                    </div>
                                )}
                            </div>

                            {/* Checklist */}
                            <div style={{ marginBottom: "24px" }}>
                                <label className="sc-label">Inspection Checklist</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {CHECKLIST_ITEMS.map(({ key, label }) => (
                                        <label
                                            key={key}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                padding: "12px 14px",
                                                borderRadius: "12px",
                                                background: checklist[key] ? "var(--olive-pale)" : "var(--sand)",
                                                border: checklist[key] ? "1px solid var(--olive-mid)" : "1px solid var(--sand3)",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checklist[key]}
                                                onChange={() => handleChecklistChange(key)}
                                                style={{ width: "18px", height: "18px", accentColor: "var(--olive)" }}
                                            />
                                            <span style={{ fontSize: "0.88rem", fontWeight: checklist[key] ? 600 : 400, color: "var(--bark)" }}>
                                                {label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div style={{ marginBottom: "18px" }}>
                                <label className="sc-label">Notes</label>
                                <textarea
                                    className="sc-textarea"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any observation about this product..."
                                />
                            </div>

                            {/* Defects (for fail) */}
                            <div style={{ marginBottom: "24px" }}>
                                <label className="sc-label">Defects Found (comma-separated)</label>
                                <input
                                    type="text"
                                    className="sc-input"
                                    value={defects}
                                    onChange={(e) => setDefects(e.target.value)}
                                    placeholder="e.g., Scratched screen, Missing cable"
                                />
                            </div>

                            {/* Pass/Fail Buttons */}
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    className="btn-olive"
                                    onClick={() => handleResult("passed")}
                                    disabled={submitting}
                                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                >
                                    {submitting ? "Processing..." : "✓ Pass"}
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleResult("failed")}
                                    disabled={submitting}
                                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                >
                                    {submitting ? "Processing..." : "✗ Fail"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Return Verification Detail */}
                    {selectedReturn && (
                        <div className="sc-card" style={{ animation: "slideDown 0.3s ease" }}>
                            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", fontWeight: 500, color: "var(--bark)", marginBottom: "16px" }}>
                                Verify Return
                            </h2>
                            <div style={{ background: "var(--sand)", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
                                <div style={{ fontSize: "0.85rem", marginBottom: "6px" }}>
                                    <strong>Product:</strong> {selectedReturn.order?.product_name}
                                </div>
                                <div style={{ fontSize: "0.85rem", marginBottom: "6px" }}>
                                    <strong>Customer:</strong> {selectedReturn.order?.user?.full_name}
                                </div>
                                <div style={{ fontSize: "0.85rem" }}>
                                    <strong>Reason:</strong> {selectedReturn.reason}
                                </div>
                            </div>

                            <div style={{ marginBottom: "18px" }}>
                                <label className="sc-label">Verification Notes</label>
                                <textarea
                                    className="sc-textarea"
                                    value={returnVerifyNotes}
                                    onChange={(e) => setReturnVerifyNotes(e.target.value)}
                                    placeholder="Notes on the return condition, comparison with pre-delivery photos..."
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    className="btn-olive"
                                    style={{ flex: 1 }}
                                    onClick={() => handleVerifyReturn(selectedReturn.id, "approved", false)}
                                >
                                    ✓ Approve Return
                                </button>
                                <button
                                    className="btn-soft"
                                    style={{ flex: 1 }}
                                    onClick={() => handleVerifyReturn(selectedReturn.id, "rejected", false)}
                                >
                                    ✗ Reject
                                </button>
                                <button
                                    className="btn-danger"
                                    style={{ flex: 1 }}
                                    onClick={() => handleVerifyReturn(selectedReturn.id, "rejected", true)}
                                >
                                    🚩 Flag Fraud
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
