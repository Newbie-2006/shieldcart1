"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-browser";

const CATEGORIES = [
    { key: "all", label: "All Products", icon: "🏠" },
    { key: "phones", label: "Smartphones", icon: "📱" },
    { key: "laptops", label: "Laptops", icon: "💻" },
    { key: "audio", label: "Audio", icon: "🎧" },
    { key: "tablets", label: "Tablets", icon: "📟" },
    { key: "watches", label: "Watches", icon: "⌚" },
    { key: "cameras", label: "Cameras", icon: "📷" },
    { key: "gaming", label: "Gaming", icon: "🎮" },
];

const PLATFORMS = [
    { key: "all", label: "All Platforms" },
    { key: "Amazon", label: "Amazon India", color: "#FF9900", bg: "#FFF7ED" },
    { key: "Flipkart", label: "Flipkart", color: "#2874F0", bg: "#EFF6FF" },
    { key: "Meesho", label: "Meesho", color: "#9B2DE8", bg: "#F5F3FF" },
];

const PRODUCTS = [
    // Phones
    { id: 1, name: "Apple iPhone 15 (128GB)", category: "phones", price: 67999, mrp: 79900, platform: "Amazon", image: "📱", rating: 4.6, reviews: 12840, url: "https://www.amazon.in/dp/B0CHX68Z7B", badge: "Best Seller", verified: true },
    { id: 2, name: "Samsung Galaxy S24 Ultra", category: "phones", price: 129999, mrp: 134999, platform: "Amazon", image: "📱", rating: 4.5, reviews: 8721, url: "https://www.amazon.in/dp/B0CS5TCLPY", badge: "Premium", verified: true },
    { id: 3, name: "OnePlus 12 (256GB)", category: "phones", price: 59999, mrp: 64999, platform: "Flipkart", image: "📱", rating: 4.4, reviews: 15230, url: "https://www.flipkart.com/oneplus-12", verified: true },
    { id: 4, name: "Google Pixel 8a", category: "phones", price: 43999, mrp: 52999, platform: "Flipkart", image: "📱", rating: 4.3, reviews: 6540, url: "https://www.flipkart.com/pixel-8a" },
    { id: 5, name: "Realme GT 6T", category: "phones", price: 22999, mrp: 27999, platform: "Meesho", image: "📱", rating: 4.1, reviews: 3200, url: "https://meesho.com/realme-gt" },
    // Laptops
    { id: 6, name: "MacBook Air M3 (16GB)", category: "laptops", price: 114990, mrp: 134900, platform: "Amazon", image: "💻", rating: 4.8, reviews: 5430, url: "https://www.amazon.in/dp/B0CW5JRCFJ", badge: "Top Rated", verified: true },
    { id: 7, name: "Dell XPS 15 (i7, 16GB)", category: "laptops", price: 142990, mrp: 159900, platform: "Amazon", image: "💻", rating: 4.5, reviews: 2340, url: "https://www.amazon.in/dp/Dell-XPS-15", verified: true },
    { id: 8, name: "HP Pavilion 14 (Ryzen 5)", category: "laptops", price: 54990, mrp: 64999, platform: "Flipkart", image: "💻", rating: 4.2, reviews: 7820, url: "https://www.flipkart.com/hp-pavilion" },
    { id: 9, name: "Lenovo IdeaPad 3 (i5)", category: "laptops", price: 47990, mrp: 59990, platform: "Flipkart", image: "💻", rating: 4.1, reviews: 9120, url: "https://www.flipkart.com/lenovo-ideapad" },
    // Audio
    { id: 10, name: "Sony WH-1000XM5", category: "audio", price: 26990, mrp: 34990, platform: "Amazon", image: "🎧", rating: 4.7, reviews: 18450, url: "https://www.amazon.in/dp/B09XS7JWHH", badge: "Best Seller", verified: true },
    { id: 11, name: "Apple AirPods Pro 2", category: "audio", price: 21490, mrp: 24900, platform: "Amazon", image: "🎧", rating: 4.6, reviews: 22340, url: "https://www.amazon.in/dp/B0CHWRXH8B", verified: true },
    { id: 12, name: "JBL Tune 770NC", category: "audio", price: 4999, mrp: 7999, platform: "Flipkart", image: "🎧", rating: 4.3, reviews: 5670, url: "https://www.flipkart.com/jbl-tune-770nc" },
    { id: 13, name: "boAt Rockerz 550", category: "audio", price: 1799, mrp: 3990, platform: "Meesho", image: "🎧", rating: 4.0, reviews: 34200, url: "https://meesho.com/boat-rockerz" },
    // Tablets
    { id: 14, name: "iPad Air M2 (128GB)", category: "tablets", price: 62990, mrp: 69900, platform: "Amazon", image: "📟", rating: 4.7, reviews: 4560, url: "https://www.amazon.in/dp/B0D3J85M2F", badge: "Premium", verified: true },
    { id: 15, name: "Samsung Galaxy Tab S9 FE", category: "tablets", price: 30999, mrp: 44999, platform: "Flipkart", image: "📟", rating: 4.4, reviews: 6780, url: "https://www.flipkart.com/tab-s9-fe" },
    // Watches
    { id: 16, name: "Apple Watch Series 9", category: "watches", price: 41900, mrp: 49900, platform: "Amazon", image: "⌚", rating: 4.6, reviews: 8900, url: "https://www.amazon.in/dp/Apple-Watch-9", verified: true },
    { id: 17, name: "Samsung Galaxy Watch 6", category: "watches", price: 23999, mrp: 32999, platform: "Flipkart", image: "⌚", rating: 4.3, reviews: 5430, url: "https://www.flipkart.com/galaxy-watch-6" },
    // Cameras
    { id: 18, name: "Canon EOS R50 (Kit)", category: "cameras", price: 74990, mrp: 84995, platform: "Amazon", image: "📷", rating: 4.5, reviews: 1290, url: "https://www.amazon.in/dp/Canon-R50", verified: true },
    // Gaming
    { id: 19, name: "PlayStation 5 (Slim)", category: "gaming", price: 49990, mrp: 54990, platform: "Amazon", image: "🎮", rating: 4.8, reviews: 11200, url: "https://www.amazon.in/dp/PS5-Slim", badge: "Hot", verified: true },
    { id: 20, name: "Nintendo Switch OLED", category: "gaming", price: 28499, mrp: 34999, platform: "Flipkart", image: "🎮", rating: 4.6, reviews: 7890, url: "https://www.flipkart.com/switch-oled", verified: true },
];

export default function MarketplacePage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedPlatform, setSelectedPlatform] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("popular");

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        init();
    }, []);

    const filtered = PRODUCTS
        .filter(p => selectedCategory === "all" || p.category === selectedCategory)
        .filter(p => selectedPlatform === "all" || p.platform === selectedPlatform)
        .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "price-low") return a.price - b.price;
            if (sortBy === "price-high") return b.price - a.price;
            if (sortBy === "rating") return b.rating - a.rating;
            return b.reviews - a.reviews; // popular
        });

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
                    top: -100px;
                    right: -100px;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                .mp-hero::after {
                    content: '';
                    position: absolute;
                    bottom: -100px;
                    left: -100px;
                    width: 300px;
                    height: 300px;
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
                    left: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.1rem;
                    opacity: 0.5;
                }
                .mp-categories {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding: 0 24px 8px;
                    scrollbar-width: none;
                }
                .mp-categories::-webkit-scrollbar { display: none; }
                .mp-cat-btn {
                    padding: 10px 18px;
                    border-radius: 12px;
                    border: 1.5px solid transparent;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
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
                    background: linear-gradient(135deg, #F3F4F6, #F9FAFB);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    position: relative;
                }
                .product-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                }
                .product-verified {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #10B981, #059669);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    box-shadow: 0 2px 6px rgba(16,185,129,0.3);
                }
                .product-info {
                    padding: 16px 18px 18px;
                }
                .product-platform-chip {
                    display: inline-flex;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .product-name {
                    font-size: 0.92rem;
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 8px;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .product-rating {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 12px;
                }
                .product-price-row {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 14px;
                }
                .order-btn {
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    border: none;
                    background: linear-gradient(135deg, #2563EB, #1D4ED8);
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.25);
                }
                .order-btn:hover {
                    box-shadow: 0 4px 16px rgba(37,99,235,0.4);
                    transform: translateY(-1px);
                }
                @media (max-width: 768px) {
                    .mp-hero { padding: 100px 16px 40px; }
                }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
                <Navbar />

                {/* Hero / Search */}
                <div className="mp-hero">
                    <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
                        <h1 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "2rem", fontWeight: 800,
                            color: "white", letterSpacing: "-0.02em",
                            marginBottom: "8px",
                        }}>
                            Shop with <span style={{ background: "linear-gradient(90deg, #3B82F6, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Confidence</span>
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", marginBottom: "28px" }}>
                            Browse verified products from top marketplaces. Every purchase is inspected before delivery.
                        </p>

                        <div className="mp-search-container">
                            <span className="mp-search-icon">🔍</span>
                            <input
                                className="mp-search-input"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div style={{
                    maxWidth: "1200px", margin: "0 auto",
                    padding: "20px 24px 0",
                }}>
                    {/* Platform Tabs */}
                    <div style={{
                        display: "flex", gap: "4px",
                        background: "#F3F4F6", borderRadius: "12px", padding: "4px",
                        marginBottom: "16px", width: "fit-content",
                    }}>
                        {PLATFORMS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => setSelectedPlatform(p.key)}
                                style={{
                                    padding: "8px 18px", borderRadius: "10px", border: "none",
                                    background: selectedPlatform === p.key ? "white" : "transparent",
                                    color: selectedPlatform === p.key ? (p.color || "#2563EB") : "#6B7280",
                                    fontWeight: selectedPlatform === p.key ? 700 : 500,
                                    fontSize: "0.82rem", cursor: "pointer",
                                    fontFamily: "'Inter', sans-serif",
                                    boxShadow: selectedPlatform === p.key ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                                    transition: "all 0.2s",
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
                                fontSize: "0.82rem", fontWeight: 500,
                                color: "#374151", cursor: "pointer",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            <option value="popular">Most Popular</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                <div style={{
                    maxWidth: "1200px", margin: "0 auto",
                    padding: "24px",
                }}>
                    <div style={{ marginBottom: "16px", fontSize: "0.85rem", color: "#6B7280" }}>
                        Showing <strong style={{ color: "#111827" }}>{filtered.length}</strong> products
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "20px",
                    }}>
                        {filtered.map((product, idx) => {
                            const platData = PLATFORMS.find(p => p.key === product.platform);
                            return (
                                <div
                                    key={product.id}
                                    className="product-card"
                                    style={{ animation: `riseUp 0.4s ${0.03 * idx}s ease both` }}
                                >
                                    <div className="product-image">
                                        <span>{product.image}</span>
                                        {product.badge && (
                                            <div className="product-badge" style={{
                                                background: product.badge === "Hot" ? "#FEE2E2" : product.badge === "Premium" ? "#E0E7FF" : "#D1FAE5",
                                                color: product.badge === "Hot" ? "#DC2626" : product.badge === "Premium" ? "#4338CA" : "#065F46",
                                            }}>
                                                {product.badge}
                                            </div>
                                        )}
                                        {product.verified && (
                                            <div className="product-verified" title="Verified by ShieldCart">
                                                ✓
                                            </div>
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
                                            <span style={{ fontSize: "0.78rem", color: "#F59E0B" }}>★</span>
                                            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827" }}>{product.rating}</span>
                                            <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>({product.reviews.toLocaleString()})</span>
                                        </div>
                                        <div className="product-price-row">
                                            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>
                                                ₹{product.price.toLocaleString("en-IN")}
                                            </span>
                                            <span style={{ fontSize: "0.82rem", color: "#9CA3AF", textDecoration: "line-through" }}>
                                                ₹{product.mrp.toLocaleString("en-IN")}
                                            </span>
                                            <span style={{
                                                fontSize: "0.72rem", fontWeight: 700, color: "#10B981",
                                            }}>
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
                        <div style={{
                            textAlign: "center", padding: "80px 20px",
                            background: "white", borderRadius: "16px",
                            border: "1px solid #E5E7EB",
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
                            <h3 style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "1.2rem", fontWeight: 700, color: "#111827",
                                marginBottom: "8px",
                            }}>No products found</h3>
                            <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                                Try adjusting your filters or search term
                            </p>
                        </div>
                    )}

                    {/* Trust Banner */}
                    <div style={{
                        marginTop: "48px",
                        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                        borderRadius: "20px",
                        padding: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "24px",
                    }}>
                        <div>
                            <h3 style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "1.3rem", fontWeight: 800, color: "white",
                                marginBottom: "8px",
                            }}>
                                Every product is verified before delivery
                            </h3>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", maxWidth: "480px" }}>
                                Our certified inspection hubs check every product for authenticity, defects, and completeness. Shop worry-free.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "20px" }}>
                            {[
                                { icon: "🛡️", label: "Verified Products" },
                                { icon: "🔄", label: "Easy Returns" },
                                { icon: "💰", label: "Secure Payments" },
                            ].map((f) => (
                                <div key={f.label} style={{
                                    textAlign: "center",
                                    padding: "16px",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}>
                                    <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{f.icon}</div>
                                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem", fontWeight: 600 }}>{f.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer style={{
                    marginTop: "48px",
                    padding: "24px",
                    textAlign: "center",
                    borderTop: "1px solid #E5E7EB",
                    color: "#9CA3AF",
                    fontSize: "0.82rem",
                }}>
                    © 2026 ShieldCart. All rights reserved.
                </footer>
            </div>
        </>
    );
}
