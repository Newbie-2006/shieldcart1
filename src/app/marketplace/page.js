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

const PRODUCTS = [
    // ─── PHONES ──────────────────────────────────────
    { id: 1, name: "Apple iPhone 15 (128GB) - Blue", category: "phones", price: 67999, mrp: 79900, platform: "Amazon", image: "📱", rating: 4.6, reviews: 12840, url: "https://www.amazon.in/dp/B0CHX68Z7B", badge: "Best Seller", verified: true },
    { id: 2, name: "Samsung Galaxy S24 Ultra (256GB)", category: "phones", price: 129999, mrp: 134999, platform: "Amazon", image: "📱", rating: 4.5, reviews: 8721, url: "https://www.amazon.in/dp/B0CS5TCLPY", badge: "Premium", verified: true },
    { id: 3, name: "OnePlus 12 (256GB) Silky Black", category: "phones", price: 59999, mrp: 64999, platform: "Flipkart", image: "📱", rating: 4.4, reviews: 15230, url: "https://www.flipkart.com/oneplus-12", verified: true },
    { id: 4, name: "Google Pixel 8a (128GB)", category: "phones", price: 43999, mrp: 52999, platform: "Flipkart", image: "📱", rating: 4.3, reviews: 6540, url: "https://www.flipkart.com/pixel-8a" },
    { id: 5, name: "Realme GT 6T 5G (256GB)", category: "phones", price: 22999, mrp: 27999, platform: "Meesho", image: "📱", rating: 4.1, reviews: 3200, url: "https://meesho.com/realme-gt" },
    { id: 6, name: "iPhone 16 Pro Max (256GB)", category: "phones", price: 144900, mrp: 159900, platform: "Amazon", image: "📱", rating: 4.8, reviews: 4320, url: "https://www.amazon.in/dp/iPhone-16-Pro", badge: "New", verified: true },
    { id: 7, name: "Samsung Galaxy Z Fold 6", category: "phones", price: 154999, mrp: 164999, platform: "Flipkart", image: "📱", rating: 4.4, reviews: 2180, url: "https://www.flipkart.com/galaxy-z-fold-6", badge: "Premium", verified: true },
    { id: 8, name: "Xiaomi 14 Ultra (512GB)", category: "phones", price: 89999, mrp: 99999, platform: "Amazon", image: "📱", rating: 4.3, reviews: 1890, url: "https://www.amazon.in/dp/Xiaomi-14-Ultra", verified: true },
    { id: 9, name: "Nothing Phone (2a) Plus", category: "phones", price: 27999, mrp: 31999, platform: "Flipkart", image: "📱", rating: 4.2, reviews: 8760, url: "https://www.flipkart.com/nothing-phone-2a" },
    { id: 10, name: "Poco X6 Pro 5G (256GB)", category: "phones", price: 16999, mrp: 21999, platform: "Meesho", image: "📱", rating: 4.0, reviews: 14500, url: "https://meesho.com/poco-x6-pro" },

    // ─── LAPTOPS ─────────────────────────────────────
    { id: 11, name: "MacBook Air M3 (16GB/512GB)", category: "laptops", price: 114990, mrp: 134900, platform: "Amazon", image: "💻", rating: 4.8, reviews: 5430, url: "https://www.amazon.in/dp/B0CW5JRCFJ", badge: "Top Rated", verified: true },
    { id: 12, name: "Dell XPS 15 (i7-13700H, 16GB)", category: "laptops", price: 142990, mrp: 159900, platform: "Amazon", image: "💻", rating: 4.5, reviews: 2340, url: "https://www.amazon.in/dp/Dell-XPS-15", verified: true },
    { id: 13, name: "HP Pavilion 14 (Ryzen 5, 16GB)", category: "laptops", price: 54990, mrp: 64999, platform: "Flipkart", image: "💻", rating: 4.2, reviews: 7820, url: "https://www.flipkart.com/hp-pavilion" },
    { id: 14, name: "Lenovo IdeaPad Slim 3 (i5, 8GB)", category: "laptops", price: 47990, mrp: 59990, platform: "Flipkart", image: "💻", rating: 4.1, reviews: 9120, url: "https://www.flipkart.com/lenovo-ideapad" },
    { id: 15, name: "MacBook Pro 14\" M3 Pro (18GB)", category: "laptops", price: 179990, mrp: 199900, platform: "Amazon", image: "💻", rating: 4.9, reviews: 3210, url: "https://www.amazon.in/dp/MacBook-Pro-M3", badge: "Premium", verified: true },
    { id: 16, name: "ASUS ROG Strix G16 (RTX 4060)", category: "laptops", price: 109990, mrp: 129990, platform: "Flipkart", image: "💻", rating: 4.4, reviews: 4560, url: "https://www.flipkart.com/asus-rog-g16", badge: "Gaming", verified: true },
    { id: 17, name: "Acer Aspire 5 (i5, 16GB)", category: "laptops", price: 42990, mrp: 54999, platform: "Amazon", image: "💻", rating: 4.1, reviews: 11200, url: "https://www.amazon.in/dp/Acer-Aspire-5" },
    { id: 18, name: "HP Victus 16 (RTX 4050)", category: "laptops", price: 72990, mrp: 84999, platform: "Flipkart", image: "💻", rating: 4.3, reviews: 6780, url: "https://www.flipkart.com/hp-victus-16" },

    // ─── AUDIO ───────────────────────────────────────
    { id: 19, name: "Sony WH-1000XM5 Wireless", category: "audio", price: 26990, mrp: 34990, platform: "Amazon", image: "🎧", rating: 4.7, reviews: 18450, url: "https://www.amazon.in/dp/B09XS7JWHH", badge: "Best Seller", verified: true },
    { id: 20, name: "Apple AirPods Pro 2 (USB-C)", category: "audio", price: 21490, mrp: 24900, platform: "Amazon", image: "🎧", rating: 4.6, reviews: 22340, url: "https://www.amazon.in/dp/B0CHWRXH8B", verified: true },
    { id: 21, name: "JBL Tune 770NC Wireless", category: "audio", price: 4999, mrp: 7999, platform: "Flipkart", image: "🎧", rating: 4.3, reviews: 5670, url: "https://www.flipkart.com/jbl-tune-770nc" },
    { id: 22, name: "boAt Rockerz 550 Bluetooth", category: "audio", price: 1799, mrp: 3990, platform: "Meesho", image: "🎧", rating: 4.0, reviews: 34200, url: "https://meesho.com/boat-rockerz" },
    { id: 23, name: "Samsung Galaxy Buds 3 Pro", category: "audio", price: 17999, mrp: 21999, platform: "Amazon", image: "🎧", rating: 4.4, reviews: 3450, url: "https://www.amazon.in/dp/Galaxy-Buds-3", verified: true },
    { id: 24, name: "Sony WF-1000XM5 Earbuds", category: "audio", price: 19990, mrp: 26990, platform: "Amazon", image: "🎧", rating: 4.5, reviews: 8900, url: "https://www.amazon.in/dp/Sony-WF-XM5", badge: "Premium", verified: true },
    { id: 25, name: "Marshall Major IV Bluetooth", category: "audio", price: 8999, mrp: 12999, platform: "Flipkart", image: "🎧", rating: 4.4, reviews: 4320, url: "https://www.flipkart.com/marshall-major-iv", verified: true },
    { id: 26, name: "Noise Buds VS104 TWS", category: "audio", price: 899, mrp: 2499, platform: "Meesho", image: "🎧", rating: 3.9, reviews: 42100, url: "https://meesho.com/noise-buds" },

    // ─── TABLETS ──────────────────────────────────────
    { id: 27, name: "iPad Air M2 (128GB, Wi-Fi)", category: "tablets", price: 62990, mrp: 69900, platform: "Amazon", image: "📟", rating: 4.7, reviews: 4560, url: "https://www.amazon.in/dp/B0D3J85M2F", badge: "Premium", verified: true },
    { id: 28, name: "Samsung Galaxy Tab S9 FE (128GB)", category: "tablets", price: 30999, mrp: 44999, platform: "Flipkart", image: "📟", rating: 4.4, reviews: 6780, url: "https://www.flipkart.com/tab-s9-fe" },
    { id: 29, name: "iPad 10th Gen (64GB, Wi-Fi)", category: "tablets", price: 33990, mrp: 39900, platform: "Amazon", image: "📟", rating: 4.5, reviews: 9870, url: "https://www.amazon.in/dp/iPad-10th", verified: true },
    { id: 30, name: "OnePlus Pad Go (128GB)", category: "tablets", price: 19999, mrp: 22999, platform: "Flipkart", image: "📟", rating: 4.2, reviews: 5430, url: "https://www.flipkart.com/oneplus-pad-go" },
    { id: 31, name: "Xiaomi Pad 6 (128GB)", category: "tablets", price: 24999, mrp: 30999, platform: "Amazon", image: "📟", rating: 4.3, reviews: 7650, url: "https://www.amazon.in/dp/Xiaomi-Pad-6" },

    // ─── WATCHES ─────────────────────────────────────
    { id: 32, name: "Apple Watch Series 9 (GPS, 45mm)", category: "watches", price: 41900, mrp: 49900, platform: "Amazon", image: "⌚", rating: 4.6, reviews: 8900, url: "https://www.amazon.in/dp/Apple-Watch-9", verified: true },
    { id: 33, name: "Samsung Galaxy Watch 6 Classic", category: "watches", price: 23999, mrp: 32999, platform: "Flipkart", image: "⌚", rating: 4.3, reviews: 5430, url: "https://www.flipkart.com/galaxy-watch-6" },
    { id: 34, name: "Apple Watch Ultra 2 (GPS+Cell)", category: "watches", price: 79900, mrp: 89900, platform: "Amazon", image: "⌚", rating: 4.8, reviews: 2340, url: "https://www.amazon.in/dp/Watch-Ultra-2", badge: "Premium", verified: true },
    { id: 35, name: "Noise ColorFit Pro 5 Max", category: "watches", price: 3999, mrp: 7999, platform: "Meesho", image: "⌚", rating: 4.1, reviews: 18700, url: "https://meesho.com/noise-colorfit" },
    { id: 36, name: "Fire-Boltt Phoenix Ultra", category: "watches", price: 1499, mrp: 4999, platform: "Meesho", image: "⌚", rating: 3.8, reviews: 28900, url: "https://meesho.com/fire-boltt" },

    // ─── CAMERAS ─────────────────────────────────────
    { id: 37, name: "Canon EOS R50 Body + Kit Lens", category: "cameras", price: 74990, mrp: 84995, platform: "Amazon", image: "📷", rating: 4.5, reviews: 1290, url: "https://www.amazon.in/dp/Canon-R50", verified: true },
    { id: 38, name: "Sony Alpha A6400 (16-50mm Kit)", category: "cameras", price: 86990, mrp: 99990, platform: "Amazon", image: "📷", rating: 4.6, reviews: 3450, url: "https://www.amazon.in/dp/Sony-A6400", badge: "Top Rated", verified: true },
    { id: 39, name: "GoPro HERO 12 Black", category: "cameras", price: 39490, mrp: 44990, platform: "Flipkart", image: "📷", rating: 4.4, reviews: 6780, url: "https://www.flipkart.com/gopro-hero-12", verified: true },
    { id: 40, name: "DJI Mini 4 Pro (Fly More Combo)", category: "cameras", price: 109990, mrp: 119990, platform: "Amazon", image: "📷", rating: 4.7, reviews: 980, url: "https://www.amazon.in/dp/DJI-Mini-4", badge: "Premium", verified: true },
    { id: 41, name: "Fujifilm Instax Mini 12", category: "cameras", price: 5990, mrp: 7999, platform: "Flipkart", image: "📷", rating: 4.3, reviews: 12300, url: "https://www.flipkart.com/instax-mini-12" },

    // ─── GAMING ──────────────────────────────────────
    { id: 42, name: "PlayStation 5 (Slim, 1TB)", category: "gaming", price: 49990, mrp: 54990, platform: "Amazon", image: "🎮", rating: 4.8, reviews: 11200, url: "https://www.amazon.in/dp/PS5-Slim", badge: "Hot", verified: true },
    { id: 43, name: "Nintendo Switch OLED (White)", category: "gaming", price: 28499, mrp: 34999, platform: "Flipkart", image: "🎮", rating: 4.6, reviews: 7890, url: "https://www.flipkart.com/switch-oled", verified: true },
    { id: 44, name: "Xbox Series X (1TB)", category: "gaming", price: 44990, mrp: 49999, platform: "Amazon", image: "🎮", rating: 4.5, reviews: 5670, url: "https://www.amazon.in/dp/Xbox-Series-X", verified: true },
    { id: 45, name: "Meta Quest 3 (128GB VR)", category: "gaming", price: 49999, mrp: 57999, platform: "Amazon", image: "🎮", rating: 4.3, reviews: 3450, url: "https://www.amazon.in/dp/Meta-Quest-3", badge: "New", verified: true },
    { id: 46, name: "Steam Deck OLED (512GB)", category: "gaming", price: 55990, mrp: 62999, platform: "Flipkart", image: "🎮", rating: 4.7, reviews: 2100, url: "https://www.flipkart.com/steam-deck-oled", badge: "Premium", verified: true },
    { id: 47, name: "PS5 DualSense Edge Controller", category: "gaming", price: 18990, mrp: 21990, platform: "Amazon", image: "🎮", rating: 4.4, reviews: 4320, url: "https://www.amazon.in/dp/DualSense-Edge" },

    // ─── APPLIANCES ──────────────────────────────────
    { id: 48, name: "Dyson V15 Detect Vacuum", category: "appliances", price: 52990, mrp: 62900, platform: "Amazon", image: "🏠", rating: 4.6, reviews: 3420, url: "https://www.amazon.in/dp/Dyson-V15", badge: "Best Seller", verified: true },
    { id: 49, name: "Samsung 7kg Front Load Washer", category: "appliances", price: 32990, mrp: 41990, platform: "Flipkart", image: "🏠", rating: 4.3, reviews: 8760, url: "https://www.flipkart.com/samsung-washer" },
    { id: 50, name: "LG 655L Side-by-Side Fridge", category: "appliances", price: 72990, mrp: 89990, platform: "Amazon", image: "🏠", rating: 4.4, reviews: 5430, url: "https://www.amazon.in/dp/LG-655L", verified: true },
    { id: 51, name: "Havells Air Fryer 4L Digital", category: "appliances", price: 4499, mrp: 7999, platform: "Meesho", image: "🏠", rating: 4.1, reviews: 15600, url: "https://meesho.com/havells-air-fryer" },
    { id: 52, name: "Philips 55\" 4K Google TV", category: "appliances", price: 37990, mrp: 49990, platform: "Flipkart", image: "🏠", rating: 4.2, reviews: 9870, url: "https://www.flipkart.com/philips-55-tv" },

    // ─── BEAUTY ──────────────────────────────────────
    { id: 53, name: "Dyson Airwrap Complete Long", category: "beauty", price: 44900, mrp: 49900, platform: "Nykaa", image: "💄", rating: 4.7, reviews: 6540, url: "https://www.nykaa.com/dyson-airwrap", badge: "Premium", verified: true },
    { id: 54, name: "MAC Ruby Woo Lipstick", category: "beauty", price: 1750, mrp: 2100, platform: "Nykaa", image: "💄", rating: 4.5, reviews: 34500, url: "https://www.nykaa.com/mac-ruby-woo", verified: true },
    { id: 55, name: "Philips BT3211 Beard Trimmer", category: "beauty", price: 1399, mrp: 1895, platform: "Amazon", image: "💄", rating: 4.2, reviews: 45600, url: "https://www.amazon.in/dp/Philips-BT3211" },
    { id: 56, name: "Forest Essentials Gift Set", category: "beauty", price: 3450, mrp: 4500, platform: "Nykaa", image: "💄", rating: 4.4, reviews: 2340, url: "https://www.nykaa.com/forest-essentials", badge: "Best Seller" },
    { id: 57, name: "Maybelline Fit Me Foundation", category: "beauty", price: 399, mrp: 599, platform: "Meesho", image: "💄", rating: 4.0, reviews: 52300, url: "https://meesho.com/maybelline-fit-me" },
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
