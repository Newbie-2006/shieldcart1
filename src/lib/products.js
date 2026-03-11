// Product catalog generator — generates ~1000 realistic Indian e-commerce products
// Uses free Unsplash source images for product thumbnails

const BRANDS = {
    phones: [
        { brand: "Apple", models: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 16 Plus", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 15 Plus", "iPhone 14", "iPhone SE 4"], priceRange: [44999, 179900] },
        { brand: "Samsung", models: ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy Z Fold 6", "Galaxy Z Flip 6", "Galaxy A55 5G", "Galaxy A35 5G", "Galaxy A15", "Galaxy M55 5G", "Galaxy F15 5G"], priceRange: [11999, 164999] },
        { brand: "OnePlus", models: ["12 (256GB)", "12R (256GB)", "Nord CE4 Lite", "Nord 4", "Open (Fold)", "13", "13R", "Nord CE4"], priceRange: [14999, 154999] },
        { brand: "Google", models: ["Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 8a", "Pixel 8 Pro", "Pixel 8"], priceRange: [39999, 129999] },
        { brand: "Xiaomi", models: ["14 Ultra", "14 Pro", "14", "Redmi Note 13 Pro+ 5G", "Redmi Note 13 Pro", "Redmi Note 13", "Redmi 13C", "Poco X6 Pro", "Poco F6", "Poco M6 Pro"], priceRange: [8999, 99999] },
        { brand: "Realme", models: ["GT 6T 5G", "GT Neo 6 SE", "Narzo 70 Pro", "12 Pro+ 5G", "C67 5G", "12+ 5G", "Narzo 60 Pro"], priceRange: [9999, 34999] },
        { brand: "Vivo", models: ["X200 Pro", "X200", "V40 Pro", "V40", "T3 Ultra", "T3 Pro", "Y200 Pro", "Y100 5G"], priceRange: [14999, 89999] },
        { brand: "Nothing", models: ["Phone (2a) Plus", "Phone (2a)", "Phone (2)", "Phone (1)"], priceRange: [19999, 44999] },
        { brand: "iQOO", models: ["13", "12", "Neo 9 Pro", "Neo 7 Pro", "Z9 Turbo", "Z9s Pro"], priceRange: [16999, 59999] },
        { brand: "Motorola", models: ["Edge 50 Ultra", "Edge 50 Pro", "Edge 50 Fusion", "Razr 50 Ultra", "G85 5G", "G64 5G"], priceRange: [12999, 59999] },
    ],
    laptops: [
        { brand: "Apple", models: ["MacBook Air M3 15\"", "MacBook Air M3 13\"", "MacBook Pro 14\" M3", "MacBook Pro 14\" M3 Pro", "MacBook Pro 16\" M3 Pro", "MacBook Pro 16\" M3 Max"], priceRange: [99900, 399900] },
        { brand: "Dell", models: ["XPS 15 (i7)", "XPS 13 Plus", "Inspiron 15 (i5)", "Inspiron 14 (Ryzen 5)", "Latitude 5540", "G16 Gaming (RTX 4060)"], priceRange: [42990, 159990] },
        { brand: "HP", models: ["Pavilion 14 (Ryzen 5)", "Pavilion 15 (i5)", "Spectre x360 14", "Victus 16 (RTX 4050)", "Victus 15 (RTX 4060)", "OMEN 16 (RTX 4070)"], priceRange: [44990, 169990] },
        { brand: "Lenovo", models: ["IdeaPad Slim 3 (i5)", "IdeaPad 5 Pro (Ryzen 7)", "ThinkPad E16 Gen 2", "Legion 5i (RTX 4060)", "Yoga 9i 14\"", "Yoga Slim 7 Carbon"], priceRange: [39990, 139990] },
        { brand: "ASUS", models: ["ROG Strix G16 (RTX 4060)", "ROG Zephyrus G14", "TUF Gaming F15", "Vivobook S15 OLED", "Zenbook 14 OLED", "ProArt Studiobook 16"], priceRange: [49990, 249990] },
        { brand: "Acer", models: ["Aspire 5 (i5, 16GB)", "Aspire Go 15 (Ryzen 5)", "Nitro V 15 (RTX 4050)", "Predator Helios Neo 16", "Swift Go 14 OLED"], priceRange: [34990, 149990] },
        { brand: "MSI", models: ["Katana 15 (RTX 4050)", "Stealth 16 Studio", "Thin GF63 (RTX 4050)", "Creator Z16 HX"], priceRange: [59990, 189990] },
    ],
    audio: [
        { brand: "Sony", models: ["WH-1000XM5", "WF-1000XM5", "WH-1000XM4", "WF-C700N", "ULT Wear", "LinkBuds S"], priceRange: [4990, 34990] },
        { brand: "Apple", models: ["AirPods Pro 2 (USB-C)", "AirPods 4 (ANC)", "AirPods 4", "AirPods Max (USB-C)", "AirPods 3"], priceRange: [12900, 59900] },
        { brand: "Samsung", models: ["Galaxy Buds 3 Pro", "Galaxy Buds 3", "Galaxy Buds FE", "Galaxy Buds 2 Pro"], priceRange: [4999, 21999] },
        { brand: "JBL", models: ["Tune 770NC", "Tune 760NC", "Tune 520BT", "Live 770NC", "Flip 6 Speaker", "Charge 5 Speaker", "PartyBox 110"], priceRange: [2499, 34999] },
        { brand: "boAt", models: ["Rockerz 550", "Airdopes 141", "Airdopes 161", "Stone 1200", "BassHeads 100", "Nirvana Ion TWS"], priceRange: [499, 4999] },
        { brand: "Marshall", models: ["Major IV", "Monitor II ANC", "Minor III", "Emberton II Speaker", "Stanmore III Speaker"], priceRange: [6999, 39999] },
        { brand: "Bose", models: ["QuietComfort Ultra Headphones", "QuietComfort Ultra Earbuds", "SoundLink Flex Speaker", "QuietComfort Headphones", "SoundLink Max"], priceRange: [12990, 42990] },
        { brand: "Sennheiser", models: ["Momentum 4 Wireless", "Momentum True Wireless 4", "HD 560S", "ACCENTUM Plus", "IE 200"], priceRange: [2990, 34990] },
    ],
    tablets: [
        { brand: "Apple", models: ["iPad Pro M4 13\"", "iPad Pro M4 11\"", "iPad Air M2 13\"", "iPad Air M2 11\"", "iPad 10th Gen", "iPad Mini 7"], priceRange: [33990, 159900] },
        { brand: "Samsung", models: ["Galaxy Tab S9 Ultra", "Galaxy Tab S9+", "Galaxy Tab S9 FE+", "Galaxy Tab S9 FE", "Galaxy Tab A9+", "Galaxy Tab A9"], priceRange: [14999, 108999] },
        { brand: "OnePlus", models: ["Pad 2", "Pad Go"], priceRange: [19999, 39999] },
        { brand: "Xiaomi", models: ["Pad 6 (128GB)", "Pad 6 (256GB)", "Redmi Pad Pro"], priceRange: [17999, 32999] },
        { brand: "Lenovo", models: ["Tab P12 Pro", "Tab P11 Pro Gen 2", "Tab M11"], priceRange: [14999, 44999] },
    ],
    watches: [
        { brand: "Apple", models: ["Watch Ultra 2", "Watch Series 9 (45mm GPS)", "Watch Series 9 (41mm GPS)", "Watch SE 2 (44mm)", "Watch SE 2 (40mm)"], priceRange: [26900, 89900] },
        { brand: "Samsung", models: ["Galaxy Watch Ultra", "Galaxy Watch 6 Classic 47mm", "Galaxy Watch 6 Classic 43mm", "Galaxy Watch 6 44mm", "Galaxy Watch FE"], priceRange: [16999, 59999] },
        { brand: "Garmin", models: ["Fenix 8", "Forerunner 965", "Venu 3", "Venu 3S", "Instinct 2X Solar"], priceRange: [24990, 89990] },
        { brand: "Noise", models: ["ColorFit Pro 5 Max", "ColorFit Pro 5", "ColorFit Ultra 3", "Evolve 2 Play"], priceRange: [1499, 5999] },
        { brand: "Fire-Boltt", models: ["Phoenix Ultra", "Invincible Plus", "Dream Wristphone", "Ninja Fit Pro"], priceRange: [999, 4999] },
        { brand: "Amazfit", models: ["T-Rex Ultra", "GTR 4", "GTS 4 Mini", "Bip 5", "Balance"], priceRange: [3999, 34999] },
    ],
    cameras: [
        { brand: "Canon", models: ["EOS R5 Mark II (Body)", "EOS R6 Mark II (Body)", "EOS R50 (Kit)", "EOS R100 (Kit)", "EOS 1500D (Kit)", "PowerShot V10"], priceRange: [23990, 359990] },
        { brand: "Sony", models: ["Alpha A7 IV (Body)", "Alpha A6700 (Kit)", "Alpha A6400 (Kit)", "ZV-E10 II (Kit)", "ZV-1 II Vlog Camera"], priceRange: [44990, 249990] },
        { brand: "Nikon", models: ["Z8 (Body)", "Z6 III (Body)", "Z50 II (Kit)", "Z30 (Kit)", "Coolpix P950"], priceRange: [39990, 329990] },
        { brand: "GoPro", models: ["HERO 13 Black", "HERO 12 Black", "HERO 12 Black Creator Edition"], priceRange: [34490, 59990] },
        { brand: "DJI", models: ["Mini 4 Pro (Fly More Combo)", "Air 3 (Fly More Combo)", "Osmo Action 4", "Osmo Pocket 3", "Mavic 3 Pro"], priceRange: [27990, 249990] },
        { brand: "Fujifilm", models: ["X-T5 (Body)", "X-S20 (Kit)", "X100VI", "Instax Mini 12", "Instax Mini 40"], priceRange: [5490, 179990] },
    ],
    gaming: [
        { brand: "Sony", models: ["PlayStation 5 Slim (1TB)", "PlayStation 5 Digital Edition", "PS5 DualSense Edge Controller", "PS5 DualSense Controller", "PlayStation Portal"], priceRange: [5990, 54990] },
        { brand: "Microsoft", models: ["Xbox Series X (1TB)", "Xbox Series S (512GB)", "Xbox Elite Controller Series 2", "Xbox Wireless Controller"], priceRange: [5490, 49999] },
        { brand: "Nintendo", models: ["Switch OLED (White)", "Switch OLED (Neon)", "Switch Lite (Yellow)", "Switch Lite (Gray)"], priceRange: [19999, 34999] },
        { brand: "Valve", models: ["Steam Deck OLED (512GB)", "Steam Deck OLED (1TB)"], priceRange: [55990, 69990] },
        { brand: "Meta", models: ["Quest 3 (128GB)", "Quest 3 (512GB)", "Quest 3S (128GB)"], priceRange: [34999, 59999] },
        { brand: "Logitech", models: ["G Pro X Superlight 2", "G502 HERO", "G733 Headset", "G915 TKL Keyboard", "G29 Racing Wheel"], priceRange: [4499, 34999] },
        { brand: "Razer", models: ["DeathAdder V3 Pro", "BlackWidow V4 75%", "Kraken V3 Pro", "Viper V3 HyperSpeed", "Basilisk V3 X"], priceRange: [3499, 19999] },
    ],
    appliances: [
        { brand: "Dyson", models: ["V15 Detect Absolute", "V12 Detect Slim", "Pure Cool TP07", "Supersonic Hair Dryer", "Hot+Cool AM09"], priceRange: [21990, 54990] },
        { brand: "Samsung", models: ["7kg Front Load Washer", "8kg Top Load Washer", "655L Side-by-Side Fridge", "336L Double Door Fridge", "32L Convection Microwave"], priceRange: [11990, 79990] },
        { brand: "LG", models: ["655L Side-by-Side Fridge", "8kg Front Load Washer", "1.5 Ton 5 Star Split AC", "32L Charcoal Microwave", "55\" 4K OLED TV", "43\" 4K Smart TV"], priceRange: [12990, 149990] },
        { brand: "Philips", models: ["55\" 4K Google TV", "43\" LED Smart TV", "Air Fryer XL (6.2L)", "Mixer Grinder 750W"], priceRange: [3999, 49990] },
        { brand: "Havells", models: ["Air Fryer 4L Digital", "Induction Cooktop", "Water Purifier RO+UV", "Tower Fan 3-Speed", "Instant Geyser 3L"], priceRange: [2499, 14999] },
        { brand: "IFB", models: ["7kg Front Load Washer", "Microwave 20L Solo", "Dishwasher 12 Place"], priceRange: [12990, 39990] },
        { brand: "Voltas", models: ["1.5 Ton 3 Star Split AC", "1 Ton 5 Star Window AC", "185L Direct Cool Fridge"], priceRange: [12990, 39990] },
    ],
    beauty: [
        { brand: "Dyson", models: ["Airwrap Complete Long", "Airwrap Complete", "Corrale Straightener", "Supersonic Hair Dryer"], priceRange: [34900, 49900] },
        { brand: "MAC", models: ["Ruby Woo Lipstick", "Powder Kiss Lipstick", "Fix+ Setting Spray", "Studio Fix Foundation", "Prep + Prime Lip"], priceRange: [1250, 3200] },
        { brand: "Maybelline", models: ["Fit Me Foundation", "Lash Sensational Mascara", "Superstay Matte Ink", "Colossal Kajal", "Age Rewind Concealer"], priceRange: [249, 899] },
        { brand: "Forest Essentials", models: ["Soundarya Radiance Cream", "Kumkumadi Night Serum", "Gift Box Luxury", "Body Lotion Mashobra Honey", "Face Wash Kashmiri Saffron"], priceRange: [975, 6750] },
        { brand: "Philips", models: ["BT3211 Beard Trimmer", "BT5515 Beard Trimmer", "HP8120 Hair Dryer", "BG3006 Body Groomer", "S1223 Electric Shaver"], priceRange: [999, 3999] },
        { brand: "L'Oréal", models: ["Revitalift Serum", "True Match Foundation", "Voluminous Mascara", "Total Repair 5 Shampoo", "UV Perfect Sunscreen"], priceRange: [299, 1999] },
        { brand: "Lakme", models: ["9 to 5 CC Cream", "Absolute Skin Dew Serum Foundation", "Eyeconic Kajal", "Classic Lipstick Red", "Blush & Glow Blush"], priceRange: [199, 1299] },
        { brand: "The Body Shop", models: ["Tea Tree Face Wash", "Vitamin E Moisturizer", "Shea Butter Body Butter", "British Rose Gift Set", "Drops of Youth Serum"], priceRange: [545, 3995] },
    ],
};

const PLATFORMS_LIST = ["Amazon", "Flipkart", "Meesho", "Myntra", "Nykaa"];
const BADGES = ["Best Seller", "Top Rated", "Premium", "Hot", "New", null, null, null, null, null];

const IMG_BASE = "https://images.unsplash.com/photo-";
const CATEGORY_IMAGES = {
    phones: [
        `${IMG_BASE}1511707171634-5f897ff02aa9?w=400&h=400&fit=crop`,
        `${IMG_BASE}1592750475338-74b7b21085ab?w=400&h=400&fit=crop`,
        `${IMG_BASE}1565849904461-04a58ad377e0?w=400&h=400&fit=crop`,
        `${IMG_BASE}1580910051074-3eb694886f1b?w=400&h=400&fit=crop`,
        `${IMG_BASE}1512054502232-10a0a035d672?w=400&h=400&fit=crop`,
    ],
    laptops: [
        `${IMG_BASE}1496181133206-80ce9b88a853?w=400&h=400&fit=crop`,
        `${IMG_BASE}1525547719351-1f3e5c1e863c?w=400&h=400&fit=crop`,
        `${IMG_BASE}1588872657578-7efd1f1555ed?w=400&h=400&fit=crop`,
        `${IMG_BASE}1517336714731-489689fd1ca8?w=400&h=400&fit=crop`,
        `${IMG_BASE}1541807084-5c52b6b3adef?w=400&h=400&fit=crop`,
    ],
    audio: [
        `${IMG_BASE}1505740420928-5e560c06d30e?w=400&h=400&fit=crop`,
        `${IMG_BASE}1590658268037-6bf12f032741?w=400&h=400&fit=crop`,
        `${IMG_BASE}1583394838336-acd977736f90?w=400&h=400&fit=crop`,
        `${IMG_BASE}1546435770-a3e426bf472b?w=400&h=400&fit=crop`,
        `${IMG_BASE}1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop`,
    ],
    tablets: [
        `${IMG_BASE}1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop`,
        `${IMG_BASE}1561154464-82e9aab32564?w=400&h=400&fit=crop`,
        `${IMG_BASE}1585790050230-5dd28404ccb9?w=400&h=400&fit=crop`,
        `${IMG_BASE}1632882765546-1ee75f53becb?w=400&h=400&fit=crop`,
    ],
    watches: [
        `${IMG_BASE}1523275335684-37898b6baf30?w=400&h=400&fit=crop`,
        `${IMG_BASE}1546868871-af0de0e3975e?w=400&h=400&fit=crop`,
        `${IMG_BASE}1579586337278-3befd40fd17a?w=400&h=400&fit=crop`,
        `${IMG_BASE}1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop`,
    ],
    cameras: [
        `${IMG_BASE}1516035069371-29a1b244cc32?w=400&h=400&fit=crop`,
        `${IMG_BASE}1502920917128-1aa500764bed?w=400&h=400&fit=crop`,
        `${IMG_BASE}1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop`,
        `${IMG_BASE}1617005082133-0c9768c78e22?w=400&h=400&fit=crop`,
    ],
    gaming: [
        `${IMG_BASE}1606144042614-b2417e99c4e3?w=400&h=400&fit=crop`,
        `${IMG_BASE}1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop`,
        `${IMG_BASE}1578303512597-81e6cc155b3e?w=400&h=400&fit=crop`,
        `${IMG_BASE}1625805866449-3589be0adcea?w=400&h=400&fit=crop`,
    ],
    appliances: [
        `${IMG_BASE}1556909114-f6e7ad7d3136?w=400&h=400&fit=crop`,
        `${IMG_BASE}1585771724684-38269d6639fd?w=400&h=400&fit=crop`,
        `${IMG_BASE}1584568694244-14fbdf83bd30?w=400&h=400&fit=crop`,
        `${IMG_BASE}1558618666-fcd25c85f82e?w=400&h=400&fit=crop`,
    ],
    beauty: [
        `${IMG_BASE}1596462502278-27bfdc403348?w=400&h=400&fit=crop`,
        `${IMG_BASE}1571781926291-c477ebfd024b?w=400&h=400&fit=crop`,
        `${IMG_BASE}1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop`,
        `${IMG_BASE}1512496015851-a90fb38ba796?w=400&h=400&fit=crop`,
    ],
};

// Deterministic seeded random
function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function generateProducts() {
    const products = [];
    let id = 1;

    const categories = Object.keys(BRANDS);

    for (const category of categories) {
        const brandList = BRANDS[category];
        const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.phones;

        for (const { brand, models, priceRange } of brandList) {
            // Determine which platforms this brand appears on
            let allowedPlatforms;
            if (category === "beauty") {
                allowedPlatforms = ["Amazon", "Nykaa", "Meesho", "Flipkart", "Myntra"];
            } else {
                allowedPlatforms = ["Amazon", "Flipkart", "Meesho"];
            }

            for (let mi = 0; mi < models.length; mi++) {
                const model = models[mi];
                const seed = id * 7 + mi * 13;
                const rand = seededRandom(seed);

                // Price based on position within range
                const priceFraction = mi / Math.max(models.length - 1, 1);
                const basePrice = Math.round(priceRange[0] + (priceRange[1] - priceRange[0]) * (1 - priceFraction));
                const price = Math.round(basePrice / 10) * 10 - (basePrice > 10000 ? 1 : 0); // e.g., 67999
                const mrpMultiplier = 1.1 + rand * 0.2; // 10-30% markup for MRP
                const mrp = Math.round((price * mrpMultiplier) / 100) * 100 - 1;

                // Platform — distribute across platforms
                const platIdx = (id + mi) % allowedPlatforms.length;
                const platform = allowedPlatforms[platIdx];

                // Rating
                const rating = Math.round((3.8 + rand * 1.1) * 10) / 10;

                // Reviews
                const reviews = Math.round(500 + rand * 40000);

                // Badge
                const badge = BADGES[Math.floor(seededRandom(seed + 3) * BADGES.length)];

                // Verified
                const verified = seededRandom(seed + 5) > 0.35;

                // Image
                const imgIdx = (id + mi * 3) % images.length;
                const imageUrl = images[imgIdx];

                products.push({
                    id: id++,
                    name: `${brand} ${model}`,
                    category,
                    price,
                    mrp,
                    platform,
                    imageUrl,
                    rating,
                    reviews,
                    url: `https://www.${platform.toLowerCase()}.${platform === "Amazon" ? "in" : "com"}/${encodeURIComponent(brand + " " + model).replace(/%20/g, "-")}`,
                    badge,
                    verified,
                    brand,
                });
            }
        }
    }

    return products;
}

export const ALL_PRODUCTS = generateProducts();
