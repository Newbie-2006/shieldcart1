"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase-browser";

export default function AdminPage() {
    const router = useRouter();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [inspections, setInspections] = useState([]);
    const [returns, setReturns] = useState([]);
    const [inspectors, setInspectors] = useState([]);
    const [blacklist, setBlacklist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignModal, setAssignModal] = useState(null);
    const [selectedInspector, setSelectedInspector] = useState("");

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            // Fetch all data
            const [ordersRes, inspectionsRes, returnsRes, inspectorsRes, blacklistRes] = await Promise.all([
                supabase.from("orders").select("*, user:profiles!orders_user_id_fkey(full_name, email), inspector:profiles!orders_inspector_id_fkey(full_name)").order("created_at", { ascending: false }),
                supabase.from("inspections").select("*, inspector:profiles!inspections_inspector_id_fkey(full_name), order:orders(product_name, platform)").order("inspected_at", { ascending: false }),
                supabase.from("returns").select("*, order:orders(product_name, user:profiles!orders_user_id_fkey(full_name)), verified_by_profile:profiles!returns_verified_by_fkey(full_name)").order("created_at", { ascending: false }),
                supabase.from("profiles").select("*").eq("role", "inspector"),
                supabase.from("blacklist").select("*, user:profiles!blacklist_user_id_fkey(full_name, email), flagger:profiles!blacklist_flagged_by_fkey(full_name)").order("flagged_at", { ascending: false }),
            ]);

            setOrders(ordersRes.data || []);
            setInspections(inspectionsRes.data || []);
            setReturns(returnsRes.data || []);
            setInspectors(inspectorsRes.data || []);
            setBlacklist(blacklistRes.data || []);
            setLoading(false);
        };
        init();
    }, []);

    const handleAssignInspector = async () => {
        if (!assignModal || !selectedInspector) return;
        try {
            await fetch(`/api/orders/${assignModal}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inspector_id: selectedInspector,
                    status: "arrived",
                }),
            });
            // Refresh
            const { data } = await supabase.from("orders").select("*, user:profiles!orders_user_id_fkey(full_name, email), inspector:profiles!orders_inspector_id_fkey(full_name)").order("created_at", { ascending: false });
            setOrders(data || []);
            setAssignModal(null);
            setSelectedInspector("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleRefund = async (orderId) => {
        if (!confirm("Are you sure you want to refund this order?")) return;
        try {
            const order = orders.find((o) => o.id === orderId);
            await fetch("/api/payment/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpay_payment_id: order.razorpay_order_id,
                    order_id: orderId,
                }),
            });
            // Refresh
            const { data } = await supabase.from("orders").select("*, user:profiles!orders_user_id_fkey(full_name, email), inspector:profiles!orders_inspector_id_fkey(full_name)").order("created_at", { ascending: false });
            setOrders(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApproveBlacklist = async (returnItem) => {
        try {
            const res = await fetch("/api/returns/" + returnItem.id + "/verify", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "rejected", fraud_flag: true, mismatch_notes: "Admin flagged" }),
            });
            // Refresh
            const { data } = await supabase.from("returns").select("*, order:orders(product_name, user:profiles!orders_user_id_fkey(full_name)), verified_by_profile:profiles!returns_verified_by_fkey(full_name)").order("created_at", { ascending: false });
            setReturns(data || []);
            const { data: bl } = await supabase.from("blacklist").select("*, user:profiles!blacklist_user_id_fkey(full_name, email), flagger:profiles!blacklist_flagged_by_fkey(full_name)").order("flagged_at", { ascending: false });
            setBlacklist(bl || []);
        } catch (err) {
            console.error(err);
        }
    };

    const tabs = [
        { key: "orders", label: "Orders", count: orders.length },
        { key: "inspections", label: "Inspections", count: inspections.length },
        { key: "returns", label: "Returns", count: returns.length },
        { key: "inspectors", label: "Inspectors", count: inspectors.length },
        { key: "blacklist", label: "Blacklist", count: blacklist.length },
    ];

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
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "110px 24px 60px" }}>
                <h1 style={{ fontFamily: "'Lora', serif", fontSize: "2rem", fontWeight: 500, color: "var(--bark)", marginBottom: "8px" }}>
                    Admin <em style={{ color: "var(--olive)" }}>Panel</em>
                </h1>
                <p style={{ color: "var(--stone)", fontSize: "0.9rem", marginBottom: "32px" }}>
                    Manage orders, inspections, returns, and team
                </p>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--sand)", borderRadius: "14px", padding: "4px", flexWrap: "wrap" }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "10px",
                                border: "none",
                                background: activeTab === tab.key ? "var(--white)" : "transparent",
                                color: activeTab === tab.key ? "var(--olive2)" : "var(--stone)",
                                fontWeight: activeTab === tab.key ? 700 : 500,
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                fontFamily: "'Manrope', sans-serif",
                                boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                                transition: "all 0.2s",
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                            <thead>
                                <tr>
                                    {["Product", "Platform", "Customer", "Price", "Status", "Inspector", "Actions"].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                textAlign: "left",
                                                padding: "12px 16px",
                                                background: "var(--sand2)",
                                                color: "var(--stone)",
                                                fontWeight: 700,
                                                fontSize: "0.72rem",
                                                letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                borderBottom: "1px solid var(--sand3)",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: "1px solid var(--sand2)" }}>
                                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--bark)" }}>{order.product_name}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span className="badge badge-olive" style={{ fontSize: "0.6rem" }}>{order.platform}</span>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--stone)" }}>{order.user?.full_name || "—"}</td>
                                        <td style={{ padding: "12px 16px", color: "var(--bark)", fontWeight: 600 }}>₹{Number(order.price).toLocaleString("en-IN")}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span className={`badge ${order.status === "delivered" ? "badge-olive" : order.status === "failed" ? "badge-danger" : "badge-burnt"}`} style={{ fontSize: "0.6rem" }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--stone)" }}>
                                            {order.inspector?.full_name || (
                                                <button
                                                    className="btn-small btn-soft"
                                                    style={{ fontSize: "0.72rem", padding: "4px 12px" }}
                                                    onClick={() => { setAssignModal(order.id); setSelectedInspector(""); }}
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            {order.payment_status === "paid" && order.status !== "refunded" && (
                                                <button
                                                    className="btn-danger btn-small"
                                                    style={{ fontSize: "0.68rem", padding: "4px 10px" }}
                                                    onClick={() => handleRefund(order.id)}
                                                >
                                                    Refund
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* INSPECTIONS TAB */}
                {activeTab === "inspections" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {inspections.map((insp) => (
                            <div key={insp.id} className="sc-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--bark)" }}>
                                            {insp.order?.product_name || "Unknown"}
                                        </h3>
                                        <div style={{ fontSize: "0.78rem", color: "var(--stone)", marginTop: "4px" }}>
                                            Inspector: {insp.inspector?.full_name || "—"} · {new Date(insp.inspected_at).toLocaleDateString("en-IN")}
                                        </div>
                                    </div>
                                    <span className={`badge ${insp.status === "passed" ? "badge-olive" : insp.status === "failed" ? "badge-danger" : "badge-sand"}`}>
                                        {insp.status || "Pending"}
                                    </span>
                                </div>
                                {insp.notes && (
                                    <p style={{ fontSize: "0.82rem", color: "var(--stone)", marginTop: "8px", background: "var(--sand)", padding: "10px 14px", borderRadius: "10px" }}>
                                        {insp.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* RETURNS TAB */}
                {activeTab === "returns" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {returns.map((ret) => (
                            <div key={ret.id} className="sc-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--bark)" }}>
                                            {ret.order?.product_name || "Unknown"}
                                        </h3>
                                        <p style={{ fontSize: "0.82rem", color: "var(--stone)", marginTop: "4px" }}>
                                            Reason: {ret.reason}
                                        </p>
                                        <p style={{ fontSize: "0.78rem", color: "var(--stone2)", marginTop: "2px" }}>
                                            Customer: {ret.order?.user?.full_name || "—"}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "6px", flexDirection: "column", alignItems: "flex-end" }}>
                                        <span className={`badge ${ret.status === "approved" ? "badge-olive" : ret.status === "rejected" ? "badge-danger" : "badge-burnt"}`}>
                                            {ret.status}
                                        </span>
                                        {ret.fraud_flag && <span className="badge badge-danger">🚩 Fraud</span>}
                                    </div>
                                </div>
                                {ret.fraud_flag && ret.status !== "rejected" && (
                                    <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                                        <button className="btn-danger btn-small" onClick={() => handleApproveBlacklist(ret)}>
                                            Approve & Blacklist
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* INSPECTORS TAB */}
                {activeTab === "inspectors" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                        {inspectors.map((insp) => (
                            <div key={insp.id} className="sc-card">
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <div
                                        style={{
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "50%",
                                            background: "var(--olive-pale)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.2rem",
                                            fontWeight: 800,
                                            color: "var(--olive2)",
                                        }}
                                    >
                                        {insp.full_name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: "var(--bark)", fontSize: "0.92rem" }}>{insp.full_name}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--stone)" }}>{insp.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <span className="badge badge-olive">Inspector</span>
                                    {insp.phone && <span style={{ fontSize: "0.75rem", color: "var(--stone2)" }}>📱 {insp.phone}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* BLACKLIST TAB */}
                {activeTab === "blacklist" && (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                            <thead>
                                <tr>
                                    {["User", "Seller", "Reason", "Flagged By", "Date"].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                textAlign: "left",
                                                padding: "12px 16px",
                                                background: "var(--sand2)",
                                                color: "var(--stone)",
                                                fontWeight: 700,
                                                fontSize: "0.72rem",
                                                letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                borderBottom: "1px solid var(--sand3)",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {blacklist.map((bl) => (
                                    <tr key={bl.id} style={{ borderBottom: "1px solid var(--sand2)" }}>
                                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--bark)" }}>
                                            {bl.user?.full_name || "—"}<br />
                                            <span style={{ fontSize: "0.75rem", color: "var(--stone)" }}>{bl.user?.email || ""}</span>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--stone)" }}>{bl.seller_name || "—"}</td>
                                        <td style={{ padding: "12px 16px", color: "var(--bark)" }}>{bl.reason}</td>
                                        <td style={{ padding: "12px 16px", color: "var(--stone)" }}>{bl.flagger?.full_name || "—"}</td>
                                        <td style={{ padding: "12px 16px", color: "var(--stone2)", fontSize: "0.82rem" }}>
                                            {new Date(bl.flagged_at).toLocaleDateString("en-IN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assign Inspector Modal */}
            {assignModal && (
                <div
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(59,47,30,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s ease" }}
                    onClick={() => setAssignModal(null)}
                >
                    <div
                        style={{ background: "var(--white)", borderRadius: "24px", padding: "36px", maxWidth: "420px", width: "100%", boxShadow: "0 20px 60px rgba(59,47,30,0.2)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.2rem", color: "var(--bark)", marginBottom: "16px" }}>
                            Assign Inspector
                        </h3>
                        <select
                            className="sc-select"
                            value={selectedInspector}
                            onChange={(e) => setSelectedInspector(e.target.value)}
                            style={{ marginBottom: "20px" }}
                        >
                            <option value="">Select an inspector</option>
                            {inspectors.map((insp) => (
                                <option key={insp.id} value={insp.id}>{insp.full_name}</option>
                            ))}
                        </select>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button className="btn-soft btn-small" onClick={() => setAssignModal(null)}>Cancel</button>
                            <button className="btn-olive btn-small" onClick={handleAssignInspector} disabled={!selectedInspector}>
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
