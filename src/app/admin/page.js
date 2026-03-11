"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-browser";

const STATUS_COLORS = {
    ordered: { bg: "#FEF3C7", color: "#92400E", label: "Ordered" },
    arrived: { bg: "#DBEAFE", color: "#1E40AF", label: "At Hub" },
    arrived_at_hub: { bg: "#DBEAFE", color: "#1E40AF", label: "At Hub" },
    inspecting: { bg: "#E0E7FF", color: "#3730A3", label: "Inspecting" },
    passed: { bg: "#D1FAE5", color: "#065F46", label: "Passed" },
    failed: { bg: "#FEE2E2", color: "#991B1B", label: "Failed" },
    dispatched: { bg: "#DBEAFE", color: "#1E40AF", label: "Dispatched" },
    delivered: { bg: "#D1FAE5", color: "#065F46", label: "Delivered" },
    refunded: { bg: "#F3F4F6", color: "#374151", label: "Refunded" },
    pending: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
    approved: { bg: "#D1FAE5", color: "#065F46", label: "Approved" },
    rejected: { bg: "#FEE2E2", color: "#991B1B", label: "Rejected" },
};

function StatusBadge({ status }) {
    const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "4px 12px", borderRadius: "100px",
            fontSize: "0.72rem", fontWeight: 700,
            background: s.bg, color: s.color,
            textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
            <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: s.color, flexShrink: 0,
            }} />
            {s.label}
        </span>
    );
}

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
    const [statusModal, setStatusModal] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    const fetchOrders = async () => {
        const { data } = await supabase.from("orders").select("*, user:profiles!orders_user_id_fkey(full_name, email), inspector:profiles!orders_inspector_id_fkey(full_name)").order("created_at", { ascending: false });
        setOrders(data || []);
    };

    const fetchAll = async () => {
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
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            if (profile?.role !== "admin") { router.push("/dashboard"); return; }

            await fetchAll();
            setLoading(false);
        };
        init();
    }, []);

    const handleAssignInspector = async () => {
        if (!assignModal || !selectedInspector) return;
        await fetch(`/api/orders/${assignModal}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inspector_id: selectedInspector, status: "arrived" }),
        });
        await fetchOrders();
        setAssignModal(null);
        setSelectedInspector("");
    };

    const handleUpdateStatus = async () => {
        if (!statusModal || !newStatus) return;
        await fetch(`/api/orders/${statusModal}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        await fetchOrders();
        setStatusModal(null);
        setNewStatus("");
    };

    const handleRefund = async (orderId) => {
        if (!confirm("Are you sure you want to refund this order?")) return;
        const order = orders.find((o) => o.id === orderId);
        await fetch("/api/payment/refund", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ razorpay_payment_id: order.razorpay_order_id, order_id: orderId }),
        });
        await fetchOrders();
    };

    const handleApproveBlacklist = async (returnItem) => {
        await fetch("/api/returns/" + returnItem.id + "/verify", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "rejected", fraud_flag: true, mismatch_notes: "Admin flagged" }),
        });
        await fetchAll();
    };

    const tabs = [
        { key: "orders", label: "Orders", icon: "📦", count: orders.length },
        { key: "inspections", label: "Inspections", icon: "🔍", count: inspections.length },
        { key: "returns", label: "Returns", icon: "🔄", count: returns.length },
        { key: "inspectors", label: "Inspectors", icon: "👤", count: inspectors.length },
        { key: "blacklist", label: "Blacklist", icon: "🚫", count: blacklist.length },
    ];

    const statCards = [
        { label: "Total Orders", value: orders.length, icon: "📦", color: "#2563EB" },
        { label: "Pending Review", value: orders.filter(o => ["ordered", "arrived", "arrived_at_hub"].includes(o.status)).length, icon: "⏳", color: "#F59E0B" },
        { label: "Inspections Done", value: inspections.filter(i => i.status === "passed" || i.status === "failed").length, icon: "✅", color: "#10B981" },
        { label: "Active Returns", value: returns.filter(r => r.status === "pending").length, icon: "🔄", color: "#8B5CF6" },
    ];

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
                <Navbar />
                <div style={{ textAlign: "center", paddingTop: "200px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                    <p style={{ color: "#6B7280", marginTop: "16px", fontSize: "0.88rem" }}>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                .admin-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    font-size: 0.85rem;
                }
                .admin-table thead th {
                    text-align: left;
                    padding: 12px 16px;
                    background: #F9FAFB;
                    color: #6B7280;
                    font-weight: 600;
                    font-size: 0.72rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    border-bottom: 2px solid #E5E7EB;
                    white-space: nowrap;
                }
                .admin-table tbody tr {
                    transition: background 0.15s;
                }
                .admin-table tbody tr:hover {
                    background: #F9FAFB;
                }
                .admin-table tbody td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #F3F4F6;
                    color: #374151;
                }
                .action-btn {
                    padding: 6px 14px;
                    border-radius: 8px;
                    border: none;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'Inter', sans-serif;
                }
                .action-btn:hover { transform: translateY(-1px); }
                .btn-inspect {
                    background: linear-gradient(135deg, #6366F1, #4F46E5);
                    color: white;
                    box-shadow: 0 2px 6px rgba(99,102,241,0.3);
                }
                .btn-inspect:hover { box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
                .btn-assign-action {
                    background: linear-gradient(135deg, #2563EB, #1D4ED8);
                    color: white;
                    box-shadow: 0 2px 6px rgba(37,99,235,0.3);
                }
                .btn-assign-action:hover { box-shadow: 0 4px 12px rgba(37,99,235,0.4); }
                .btn-refund {
                    background: #FEE2E2;
                    color: #DC2626;
                }
                .btn-refund:hover { background: #FECACA; }
                .btn-status {
                    background: #EFF6FF;
                    color: #2563EB;
                    border: 1px solid rgba(37,99,235,0.15);
                }
                .btn-status:hover { background: #DBEAFE; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
                <Navbar />
                <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "100px 24px 60px" }}>
                    {/* Header */}
                    <div style={{ marginBottom: "32px", animation: "riseUp 0.5s ease both" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                            <div style={{
                                width: "42px", height: "42px",
                                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                                borderRadius: "12px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.2rem",
                            }}>⚙️</div>
                            <h1 style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "1.8rem", fontWeight: 800,
                                color: "#111827", letterSpacing: "-0.02em",
                            }}>
                                Verification <span style={{ color: "#2563EB" }}>Hub</span>
                            </h1>
                        </div>
                        <p style={{ color: "#6B7280", fontSize: "0.9rem", marginLeft: "54px" }}>
                            Manage orders, inspections, returns, and your team
                        </p>
                    </div>

                    {/* Stat Cards */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "16px",
                        marginBottom: "28px",
                    }}>
                        {statCards.map((s) => (
                            <div key={s.label} style={{
                                background: "white",
                                borderRadius: "16px",
                                padding: "20px 22px",
                                border: "1px solid #E5E7EB",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                animation: "riseUp 0.5s ease both",
                            }}>
                                <div style={{
                                    width: "46px", height: "46px",
                                    background: `${s.color}12`,
                                    borderRadius: "12px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.3rem",
                                }}>{s.icon}</div>
                                <div>
                                    <div style={{
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        fontSize: "1.5rem", fontWeight: 800,
                                        color: s.color, letterSpacing: "-0.02em",
                                    }}>{s.value}</div>
                                    <div style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: "flex", gap: "4px",
                        background: "#F3F4F6", borderRadius: "14px", padding: "4px",
                        marginBottom: "24px", flexWrap: "wrap",
                    }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "10px", border: "none",
                                    background: activeTab === tab.key ? "white" : "transparent",
                                    color: activeTab === tab.key ? "#2563EB" : "#6B7280",
                                    fontWeight: activeTab === tab.key ? 700 : 500,
                                    fontSize: "0.82rem", cursor: "pointer",
                                    fontFamily: "'Inter', sans-serif",
                                    boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                                    transition: "all 0.2s",
                                    display: "flex", alignItems: "center", gap: "6px",
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                                <span style={{
                                    background: activeTab === tab.key ? "#EFF6FF" : "#E5E7EB",
                                    color: activeTab === tab.key ? "#2563EB" : "#6B7280",
                                    padding: "2px 8px", borderRadius: "100px",
                                    fontSize: "0.7rem", fontWeight: 700,
                                }}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* ORDERS TAB */}
                    {activeTab === "orders" && (
                        <div style={{
                            background: "white", borderRadius: "16px",
                            border: "1px solid #E5E7EB",
                            overflow: "hidden",
                        }}>
                            <div style={{
                                padding: "18px 20px",
                                borderBottom: "1px solid #F3F4F6",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <h2 style={{
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontSize: "1.05rem", fontWeight: 700, color: "#111827",
                                }}>All Orders</h2>
                                <span style={{ fontSize: "0.82rem", color: "#6B7280" }}>{orders.length} total</span>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            {["Order ID", "Product", "Marketplace", "Customer", "Amount", "Status", "Inspector", "Actions"].map((h) => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#6B7280" }}>
                                                    #{order.id?.slice(0, 8)}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#111827" }}>{order.product_name}</td>
                                                <td>
                                                    <span style={{
                                                        padding: "3px 10px", borderRadius: "8px",
                                                        fontSize: "0.72rem", fontWeight: 600,
                                                        background: order.platform === "Amazon" ? "#FFF7ED" : order.platform === "Flipkart" ? "#EFF6FF" : "#F3F4F6",
                                                        color: order.platform === "Amazon" ? "#C2410C" : order.platform === "Flipkart" ? "#1D4ED8" : "#374151",
                                                    }}>
                                                        {order.platform}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{order.user?.full_name || "—"}</div>
                                                    <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{order.user?.email || ""}</div>
                                                </td>
                                                <td style={{ fontWeight: 700, color: "#111827" }}>₹{Number(order.price).toLocaleString("en-IN")}</td>
                                                <td><StatusBadge status={order.status} /></td>
                                                <td>
                                                    {order.inspector?.full_name || (
                                                        <button
                                                            className="action-btn btn-assign-action"
                                                            onClick={() => { setAssignModal(order.id); setSelectedInspector(""); }}
                                                        >
                                                            Assign
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                        <button
                                                            className="action-btn btn-inspect"
                                                            onClick={() => router.push(`/order/${order.id}`)}
                                                        >
                                                            Inspect
                                                        </button>
                                                        <button
                                                            className="action-btn btn-status"
                                                            onClick={() => { setStatusModal(order.id); setNewStatus(""); }}
                                                        >
                                                            Edit
                                                        </button>
                                                        {order.payment_status === "paid" && order.status !== "refunded" && (
                                                            <button className="action-btn btn-refund" onClick={() => handleRefund(order.id)}>
                                                                Refund
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>
                                                    No orders yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* INSPECTIONS TAB */}
                    {activeTab === "inspections" && (
                        <div style={{
                            background: "white", borderRadius: "16px",
                            border: "1px solid #E5E7EB", overflow: "hidden",
                        }}>
                            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
                                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>
                                    Inspection History
                                </h2>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            {["Product", "Platform", "Inspector", "Status", "Date", "Notes"].map((h) => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inspections.map((insp) => (
                                            <tr key={insp.id}>
                                                <td style={{ fontWeight: 600, color: "#111827" }}>{insp.order?.product_name || "—"}</td>
                                                <td>{insp.order?.platform || "—"}</td>
                                                <td>{insp.inspector?.full_name || "—"}</td>
                                                <td><StatusBadge status={insp.status || "pending"} /></td>
                                                <td style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                                                    {new Date(insp.inspected_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </td>
                                                <td style={{ maxWidth: "200px", fontSize: "0.82rem", color: "#6B7280" }}>
                                                    {insp.notes || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                        {inspections.length === 0 && (
                                            <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>No inspections yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* RETURNS TAB */}
                    {activeTab === "returns" && (
                        <div style={{
                            background: "white", borderRadius: "16px",
                            border: "1px solid #E5E7EB", overflow: "hidden",
                        }}>
                            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
                                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>
                                    Return Requests
                                </h2>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            {["Product", "Customer", "Reason", "Status", "Fraud", "Actions"].map((h) => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returns.map((ret) => (
                                            <tr key={ret.id}>
                                                <td style={{ fontWeight: 600, color: "#111827" }}>{ret.order?.product_name || "—"}</td>
                                                <td>{ret.order?.user?.full_name || "—"}</td>
                                                <td style={{ maxWidth: "220px", fontSize: "0.82rem" }}>{ret.reason}</td>
                                                <td><StatusBadge status={ret.status} /></td>
                                                <td>
                                                    {ret.fraud_flag ? (
                                                        <span style={{
                                                            background: "#FEE2E2", color: "#DC2626",
                                                            padding: "3px 10px", borderRadius: "100px",
                                                            fontSize: "0.7rem", fontWeight: 700,
                                                        }}>🚩 Fraud</span>
                                                    ) : (
                                                        <span style={{ color: "#9CA3AF", fontSize: "0.82rem" }}>—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {ret.fraud_flag && ret.status !== "rejected" && (
                                                        <button className="action-btn btn-refund" onClick={() => handleApproveBlacklist(ret)}>
                                                            Blacklist
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {returns.length === 0 && (
                                            <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>No returns yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* INSPECTORS TAB */}
                    {activeTab === "inspectors" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                            {inspectors.map((insp) => (
                                <div key={insp.id} style={{
                                    background: "white", borderRadius: "16px",
                                    padding: "24px", border: "1px solid #E5E7EB",
                                    transition: "all 0.3s",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                                        <div style={{
                                            width: "48px", height: "48px", borderRadius: "12px",
                                            background: "linear-gradient(135deg, #2563EB, #10B981)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "1.1rem", fontWeight: 700, color: "white",
                                        }}>
                                            {insp.full_name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>{insp.full_name}</div>
                                            <div style={{ fontSize: "0.78rem", color: "#6B7280" }}>{insp.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <span style={{
                                            padding: "4px 12px", borderRadius: "100px",
                                            background: "#EFF6FF", color: "#2563EB",
                                            fontSize: "0.7rem", fontWeight: 700,
                                            textTransform: "uppercase", letterSpacing: "0.06em",
                                        }}>Inspector</span>
                                        {insp.phone && <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>📱 {insp.phone}</span>}
                                    </div>
                                </div>
                            ))}
                            {inspectors.length === 0 && (
                                <div style={{ textAlign: "center", padding: "48px", color: "#9CA3AF", gridColumn: "1 / -1" }}>
                                    No inspectors registered
                                </div>
                            )}
                        </div>
                    )}

                    {/* BLACKLIST TAB */}
                    {activeTab === "blacklist" && (
                        <div style={{
                            background: "white", borderRadius: "16px",
                            border: "1px solid #E5E7EB", overflow: "hidden",
                        }}>
                            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
                                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>
                                    Blacklisted Users
                                </h2>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            {["User", "Seller", "Reason", "Flagged By", "Date"].map((h) => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blacklist.map((bl) => (
                                            <tr key={bl.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: "#111827" }}>{bl.user?.full_name || "—"}</div>
                                                    <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{bl.user?.email || ""}</div>
                                                </td>
                                                <td>{bl.seller_name || "—"}</td>
                                                <td style={{ maxWidth: "200px", fontSize: "0.82rem" }}>{bl.reason}</td>
                                                <td>{bl.flagger?.full_name || "—"}</td>
                                                <td style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                                                    {new Date(bl.flagged_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </td>
                                            </tr>
                                        ))}
                                        {blacklist.length === 0 && (
                                            <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "#9CA3AF" }}>No blacklisted users</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Assign Inspector Modal */}
                {assignModal && (
                    <div
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(15,23,42,0.5)", zIndex: 500,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "20px", animation: "fadeIn 0.2s ease",
                        }}
                        onClick={() => setAssignModal(null)}
                    >
                        <div
                            style={{
                                background: "white", borderRadius: "20px", padding: "32px",
                                maxWidth: "420px", width: "100%",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "1.2rem", fontWeight: 700,
                                color: "#111827", marginBottom: "16px",
                            }}>Assign Inspector</h3>
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

                {/* Update Status Modal */}
                {statusModal && (
                    <div
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(15,23,42,0.5)", zIndex: 500,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "20px", animation: "fadeIn 0.2s ease",
                        }}
                        onClick={() => setStatusModal(null)}
                    >
                        <div
                            style={{
                                background: "white", borderRadius: "20px", padding: "32px",
                                maxWidth: "420px", width: "100%",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "1.2rem", fontWeight: 700,
                                color: "#111827", marginBottom: "16px",
                            }}>Update Order Status</h3>
                            <select
                                className="sc-select"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={{ marginBottom: "20px" }}
                            >
                                <option value="">Select new status</option>
                                {["ordered", "arrived", "inspecting", "passed", "failed", "dispatched", "delivered"].map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                <button className="btn-soft btn-small" onClick={() => setStatusModal(null)}>Cancel</button>
                                <button className="btn-olive btn-small" onClick={handleUpdateStatus} disabled={!newStatus}>
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
