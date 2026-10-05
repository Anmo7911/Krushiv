/*
 * ZAYA Supabase client
 *
 * IMPORTANT:
 * A browser storefront must use the Supabase publishable/anon key only.
 * Never put a Supabase service_role/secret key in this file.
 *
 * Set these two values before deployment:
 *   SUPABASE_URL
 *   SUPABASE_PUBLISHABLE_KEY
 *
 * Because this is a static vanilla site, Vercel cannot inject server-side
 * environment variables into browser JavaScript at runtime. The publishable
 * key is intentionally safe for browser use when RLS is correctly configured.
 */


// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://tjrvvqefycjrgdbtecqn.supabase.co"; // e.g. https://xyz.supabase.co
const SUPABASE_ANON_KEY = "sb_publishable_v_j1wZtERXZcBNMWX80LmQ_q3gODXKq";

const WHATSAPP_PHONE = "919876543210"; // Enter your WhatsApp phone number
const CURRENCY = "₹";
const COD_FEE = 50;

// Initialize Supabase Client if script loaded
let supabaseClient = null;
if (typeof supabase !== "undefined" && SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL") {
supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Built-in verified catalog fallback (Used if Supabase is still connecting)
const fallbackProducts = [
{
id: "ZY-101",
title: "Mulmul Embroidered Anarkali Set",
category: "Kurtas",
price: 2499,
mrp: 3499,
tag: "Bestseller",
rating: "4.9",
reviews: "328",
boughtThisMonth: "640+ bought this month",
images: [
"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&h=933&q=80"
],
colors: [
{ name: "Sage Green", hex: "#8A9A86" },
{ name: "Blush Pink", hex: "#E8C5C8" },
{ name: "Ivory Cream", hex: "#FDFBF7" }
],
specs: [
"Fabric: 100% Pure Breathable Mulmul Cotton",
"Work: Intricate Handcrafted Chikankari & Mirror Lace",
"Fit: Flared Anarkali Silhouette with Handcrafted Tassels",
"Set Contains: 1 Flared Kurta, 1 Straight Pant, 1 Organza Dupatta",
"Exchange: Eligible for Easy Doorstep Size & Color Exchange",
"Care: Hand wash gently in cold water or dry clean"
]
},
{
id: "ZY-102",
title: "Micro-Pleated Satin Evening Slip Dress",
category: "Dresses",
price: 2799,
mrp: 3899,
tag: "Trending",
rating: "4.8",
reviews: "214",
boughtThisMonth: "420+ bought this month",
images: [
"https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&h=933&q=80"
],
colors: [
{ name: "Champagne Gold", hex: "#E6D3B3" },
{ name: "Midnight Noir", hex: "#1C1B1A" },
{ name: "Rose Wine", hex: "#8E4A49" }
],
specs: [
"Fabric: Fluid Micro-Pleated Premium Heavy Satin",
"Neckline: Soft Cowl Square Neck with adjustable criss-cross straps",
"Fit: Body-skimming contour drape that flows effortlessly",
"Exchange: Eligible for Easy Doorstep Size & Color Exchange",
"Care: Dry clean only to preserve fine pleat memory"
]
},
{
id: "ZY-103",
title: "Belgian Linen Blazer & Trouser Co-ord",
category: "Co-ords",
price: 3299,
mrp: 4499,
tag: "New",
rating: "4.7",
reviews: "186",
boughtThisMonth: "310+ bought this month",
images: [
"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&h=933&q=80"
],
colors: [
{ name: "Warm Oatmeal", hex: "#D6C7B2" },
{ name: "Earthy Olive", hex: "#686D5A" },
{ name: "Charcoal Slate", hex: "#3A3D40" }
],
specs: [
"Fabric: Pure Washed Belgian Linen (Pre-shrunk)",
"Blazer: Relaxed-fit single-breasted jacket with tortoiseshell buttons",
"Trousers: High-waist tailored pants with deep slant pockets",
"Exchange: Eligible for Easy Doorstep Size & Color Exchange",
"Care: Machine wash gentle cycle or professional dry clean"
]
},
{
id: "ZY-104",
title: "Hand-Painted Floral Organza Saree",
category: "Sarees",
price: 4499,
mrp: 5999,
tag: "Exclusive",
rating: "5.0",
reviews: "92",
boughtThisMonth: "190+ bought this month",
images: [
"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&h=933&q=80",
"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&h=933&q=80"
],
colors: [
{ name: "Powder Pink", hex: "#F3D3D9" },
{ name: "Sky Lavender", hex: "#DCD0E8" },
{ name: "Mint Whisper", hex: "#D1E7DD" }
],
specs: [
"Fabric: Lightweight translucent pure organza silk",
"Artistry: Hand-painted watercolor botanical blossoms",
"Borders: Fine scalloped golden zari embroidery with cutwork",
"Includes: 5.5 meters saree + 0.8 meter matching unstitched blouse",
"Exchange: Doorstep exchange available if transit damage occurs"
]
}
];

// Universal helper to load all products
async function fetchProducts() {
if (supabaseClient) {
try {
const { data, error } = await supabaseClient.from('products').select('*');
if (!error && data && data.length > 0) {
return data;
}
} catch (e) {
console.warn("Supabase fetch failed, falling back to local catalog:", e);
}
}
return fallbackProducts;
}

// Universal helper to get single product by ID
async function fetchProductById(id) {
const all = await fetchProducts();
return all.find(p => p.id === id) || all[0];
}
