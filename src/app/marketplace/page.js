"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-browser";
import { ALL_PRODUCTS } from "@/lib/products";

const CATEGORIES = [
    { key: "all", label: "All", icon: "🏠" },
    { key: "phones", label: "Smartphones", icon: "📱" },
    { key: "laptops", label: "Laptops", icon: "💻" },
    { key: "audio", label: "Audio", icon: "🎧" },
    { key: "tablets", label: "Tablets", icon: "📟" },
    { key: "watches", label: "Watches", icon: "⌚" },
    { key: "cameras", label: "Cameras", icon: "📷" },
    { key: "gaming", label: "Gaming", icon: "🎮" },
    { key: "appliances", label: "Appliances", icon: "🏠" },
    { key: "beauty", label: "Beauty", icon: "💄" },
];

const PLATFORMS = [
    { key: "all", label: "All Platforms" },
    { key: "Amazon", label: "Amazon India", color: "#FF9900", bg: "#FFF7ED" },
    { key: "Flipkart", label: "Flipkart", color: "#2874F0", bg: "#EFF6FF" },
    { key: "Meesho", label: "Meesho", color: "#9B2DE8", bg: "#F5F3FF" },
    { key: "Myntra", label: "Myntra", color: "#FF3E6C", bg: "#FFF1F2" },
    { key: "Nykaa", label: "Nykaa", color: "#FC2779", bg: "#FFF1F2" },
];

const ITEMS_PER_PAGE = 24;

export default function MarketplacePage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedPlatform, setSelectedPlatform] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("popular");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        init();
    }, []);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [selectedCategory, selectedPlatform, searchQuery, sortBy]);

    const filtered = useMemo(() => {
        return ALL_PRODUCTS
            .filter(p => selectedCategory === "all" || p.category === selectedCategory)
            .filter(p => selectedPlatform === "all" || p.platform === selectedPlatform)
            .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortBy === "price-low") return a.price - b.price;
                if (sortBy === "price-high") return b.price - a.price;
                if (sortBy === "rating") return b.rating - a.rating;
                return b.reviews - a.reviews;
            });
    }, [selectedCategory, selectedPlatform, searchQuery, sortBy]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleOrder = (product) => {
        if (!user) {
            router.push("/login?redirect=/marketplace");
            return;
        }
        const params = new URLSearchParams({
            product_name: product.name,
            platform: product.platform,
            price: product.price.toString(),
            product_url: product.url,
        });
        router.push(`/order/new?${params.toString()}`);
    };

    const discount = (p) => Math.round(((p.mrp - p.price) / p.mrp) * 100);

    return (
        <>
            <style jsx>{`
                .mp-hero {
                    background: linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%);
                    padding: 110px 24px 50px;
                    position: relative;
                    overflow: hidden;
                }
                .mp-hero::before {
                    content: '';
                    position: absolute;
                    top: -100px; right: -100px;
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                .mp-hero::after {
                    content: '';
                    position: absolute;
                    bottom: -100px; left: -100px;
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
                    pointer-events: none;
                }
                .mp-search-container {
                    max-width: 640px;
                    margin: 0 auto;
                    position: relative;
                }
                .mp-search-input {
                    width: 100%;
                    padding: 16px 20px 16px 50px;
                    border-radius: 14px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(10px);
                    color: white;
                    font-size: 0.95rem;
                    font-family: 'Inter', sans-serif;
                    outline: none;
                    transition: all 0.3s;
                }
                .mp-search-input::placeholder { color: rgba(255,255,255,0.4); }
                .mp-search-input:focus {
                    border-color: rgba(37,99,235,0.5);
                    background: rgba(255,255,255,0.12);
                    box-shadow: 0 0 0 4px rgba(37,99,235,0.15);
                }
                .mp-search-icon {
                    position: absolute;
                    left: 18px; top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.1rem; opacity: 0.5;
                }
                .mp-categories {
                    display: flex;
                    gap: 6px;
                    overflow-x: auto;
                    padding: 0 0 8px;
                    scrollbar-width: none;
                }
                .mp-categories::-webkit-scrollbar { display: none; }
                .mp-cat-btn {
                    padding: 8px 14px;
                    border-radius: 10px;
                    border: 1.5px solid transparent;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .mp-cat-btn.active {
                    background: #EFF6FF;
                    color: #2563EB;
                    border-color: #2563EB;
                }
                .mp-cat-btn:not(.active) {
                    background: white;
                    color: #6B7280;
                    border-color: #E5E7EB;
                }
                .mp-cat-btn:not(.active):hover {
                    border-color: #D1D5DB;
                    color: #374151;
                }
                .product-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #E5E7EB;
                    overflow: hidden;
                    transition: all 0.3s;
                    cursor: pointer;
                    position: relative;
                }
                .product-card:hover {
                    box-shadow: 0 12px 40px rgba(0,0,0,0.1);
                    transform: translateY(-4px);
                    border-color: #D1D5DB;
                }
                .product-image {
                    height: 200px;
                    background: #F9FAFB;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s;
                }
                .product-card:hover .product-image img {
                    transform: scale(1.05);
                }
                .product-badge {
                    position: absolute;
                    top: 10px; left: 10px;
                    padding: 3px 9px;
                    border-radius: 6px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    z-index: 2;
                    backdrop-filter: blur(4px);
                }
                .product-verified {
                    position: absolute;
                    top: 10px; right: 10px;
                    width: 26px; height: 26px;
                    background: linear-gradient(135deg, #10B981, #059669);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem; color: white;
                    box-shadow: 0 2px 6px rgba(16,185,129,0.3);
                    z-index: 2;
                }
                .product-info { padding: 14px 16px 16px; }
                .product-platform-chip {
                    display: inline-flex;
                    padding: 2px 7px;
                    border-radius: 5px;
                    font-size: 0.62rem;
                    font-weight: 700;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .product-name {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 6px;
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    min-height: 2.4em;
                }
                .product-rating {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-bottom: 10px;
                }
                .product-price-row {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }
                .order-btn {
                    width: 100%;
                    padding: 10px;
                    border-radius: 10px;
                    border: none;
                    background: linear-gradient(135deg, #2563EB, #1D4ED8);
                    color: white;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.25);
                }
                .order-btn:hover {
                    box-shadow: 0 4px 16px rgba(37,99,235,0.4);
                    transform: translateY(-1px);
                }
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 32px;
                    flex-wrap: wrap;
                }
                .page-btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: 1px solid #E5E7EB;
                    background: white;
                    color: #374151;
                    font-size: 0.82rem;
                    font-weight: 500;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s;
                }
                .page-btn:hover { border-color: #2563EB; color: #2563EB; }
                .page-btn.active {
                    background: #2563EB;
                    color: white;
                    border-color: #2563EB;
                }
                .page-btn:disabled {
                    opacity: 0.4;
                    cursor: default;
                }
                @media (max-width: 768px) {
                    .mp-hero { padding: 100px 16px 40px; }
                }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
                <Navbar />

                {/* Hero */}
                <div className="mp-hero">
                    <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
                        <h1 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "2rem", fontWeight: 800,
                            color: "white", letterSpacing: "-0.02em",
                            marginBottom: "6px",
                        }}>
                            Shop with <span style={{ background: "linear-gradient(90deg, #3B82F6, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Confidence</span>
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.92rem", marginBottom: "24px" }}>
                            {ALL_PRODUCTS.length}+ verified products from top marketplaces. Every purchase is inspected before delivery.
                        </p>
                        <div className="mp-search-container">
                            <span className="mp-search-icon">🔍</span>
                            <input
                                className="mp-search-input"
                                placeholder="Search by product name or brand..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px 0" }}>
                    {/* Platform Tabs */}
                    <div style={{
                        display: "flex", gap: "4px",
                        background: "#F3F4F6", borderRadius: "12px", padding: "4px",
                        marginBottom: "14px", width: "fit-content",
                        overflowX: "auto",
                    }}>
                        {PLATFORMS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => setSelectedPlatform(p.key)}
                                style={{
                                    padding: "8px 16px", borderRadius: "10px", border: "none",
                                    background: selectedPlatform === p.key ? "white" : "transparent",
                                    color: selectedPlatform === p.key ? (p.color || "#2563EB") : "#6B7280",
                                    fontWeight: selectedPlatform === p.key ? 700 : 500,
                                    fontSize: "0.8rem", cursor: "pointer",
                                    fontFamily: "'Inter', sans-serif",
                                    boxShadow: selectedPlatform === p.key ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                                    transition: "all 0.2s", whiteSpace: "nowrap",
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Category + Sort */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <div className="mp-categories">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.key}
                                    className={`mp-cat-btn ${selectedCategory === cat.key ? "active" : ""}`}
                                    onClick={() => setSelectedCategory(cat.key)}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: "8px 14px", borderRadius: "10px",
                                border: "1.5px solid #E5E7EB", background: "white",
                                fontSize: "0.8rem", fontWeight: 500,
                                color: "#374151", cursor: "pointer",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            <option value="popular">Most Popular</option>
                            <option value="price-low">Price: Low → High</option>
                            <option value="price-high">Price: High → Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Products */}
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px 60px" }}>
                    <div style={{ marginBottom: "14px", fontSize: "0.85rem", color: "#6B7280" }}>
                        Showing <strong style={{ color: "#111827" }}>{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong style={{ color: "#111827" }}>{filtered.length}</strong> products
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                        gap: "18px",
                    }}>
                        {paginatedProducts.map((product, idx) => {
                            const platData = PLATFORMS.find(p => p.key === product.platform);
                            return (
                                <div key={product.id} className="product-card" style={{ animation: `riseUp 0.35s ${0.02 * idx}s ease both` }}>
                                    <div className="product-image">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            loading="lazy"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        {product.badge && (
                                            <div className="product-badge" style={{
                                                background: product.badge === "Hot" ? "#FEE2E2" : product.badge === "Premium" ? "#E0E7FF" : product.badge === "New" ? "#DBEAFE" : product.badge === "Gaming" ? "#F3E8FF" : "#D1FAE5",
                                                color: product.badge === "Hot" ? "#DC2626" : product.badge === "Premium" ? "#4338CA" : product.badge === "New" ? "#1D4ED8" : product.badge === "Gaming" ? "#7C3AED" : "#065F46",
                                            }}>
                                                {product.badge}
                                            </div>
                                        )}
                                        {product.verified && (
                                            <div className="product-verified" title="Verified by ShieldCart">✓</div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <span className="product-platform-chip" style={{
                                            background: platData?.bg || "#F3F4F6",
                                            color: platData?.color || "#374151",
                                        }}>
                                            {product.platform}
                                        </span>
                                        <div className="product-name">{product.name}</div>
                                        <div className="product-rating">
                                            <span style={{ fontSize: "0.75rem", color: "#F59E0B" }}>★</span>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111827" }}>{product.rating}</span>
                                            <span style={{ fontSize: "0.68rem", color: "#9CA3AF" }}>({product.reviews.toLocaleString()})</span>
                                        </div>
                                        <div className="product-price-row">
                                            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
                                                ₹{product.price.toLocaleString("en-IN")}
                                            </span>
                                            <span style={{ fontSize: "0.78rem", color: "#9CA3AF", textDecoration: "line-through" }}>
                                                ₹{product.mrp.toLocaleString("en-IN")}
                                            </span>
                                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#10B981" }}>
                                                {discount(product)}% off
                                            </span>
                                        </div>
                                        <button className="order-btn" onClick={() => handleOrder(product)}>
                                            🛡️ Order via ShieldCart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
                            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>No products found</h3>
                            <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>Try adjusting your filters or search term</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                ← Prev
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 7) {
                                    pageNum = i + 1;
                                } else if (page <= 4) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 3) {
                                    pageNum = totalPages - 6 + i;
                                } else {
                                    pageNum = page - 3 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`page-btn ${page === pageNum ? "active" : ""}`}
                                        onClick={() => { setPage(pageNum); window.scrollTo({ top: 340, behavior: 'smooth' }); }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                Next →
                            </button>
                        </div>
                    )}

                    {/* Trust Banner */}
                    <div style={{
                        marginTop: "48px",
                        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                        borderRadius: "20px", padding: "40px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexWrap: "wrap", gap: "24px",
                    }}>
                        <div>
                            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: "8px" }}>
                                Every product is verified before delivery
                            </h3>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", maxWidth: "480px" }}>
                                Our certified inspection hubs check every product for authenticity, defects, and completeness. Shop worry-free.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "16px" }}>
                            {[
                                { icon: "🛡️", label: "Verified" },
                                { icon: "🔄", label: "Easy Returns" },
                                { icon: "💰", label: "Secure Pay" },
                            ].map((f) => (
                                <div key={f.label} style={{
                                    textAlign: "center", padding: "14px",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}>
                                    <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{f.icon}</div>
                                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", fontWeight: 600 }}>{f.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer style={{
                    padding: "24px", textAlign: "center",
                    borderTop: "1px solid #E5E7EB",
                    color: "#9CA3AF", fontSize: "0.82rem",
                }}>
                    © 2026 ShieldCart. All rights reserved.
                </footer>
            </div>
        </>
    );
}
