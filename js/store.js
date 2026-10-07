// store.js - KRUSHIV ATELIER (Complete Storefront Controller)

var supabaseClient = window.supabaseClient || window.db || null;

if (typeof generateSlug !== 'function') {
  window.generateSlug = function(text) {
    if (!text) return 'piece';
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };
}

// -------------------------------------------------------------
// 1. STORE CONFIGURATION & STARTER DATA
// -------------------------------------------------------------
const WHATSAPP_PHONE = window.ZAYA_WHATSAPP_PHONE || "919876543210"; // Enter WhatsApp phone number with country code
const CURRENCY = "₹";
const COD_FEE = 50;

// High-resolution curated editorial hero banners (Luxury ethnic couture & festive pret)
const DEFAULT_HERO_BANNERS = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&auto=format&fit=crop&q=80"
];

// Rich starter catalog covering all boutique categories
const DEFAULT_PRODUCTS = [
  {
    id: "kr-gulab-anarkali",
    slug: "gulab-chanderi-silk-anarkali-set",
    token: "tok_gulab_01",
    title: "Gulab Chanderi Silk Anarkali Set with Organza Dupatta",
    category: "Kurtas",
    price: 3499,
    mrp: 4999,
    tag: "Bestseller",
    stock_qty: 15,
    sizes_stock: { "S": 10, "M": 10, "L": 8, "XL": 6, "XXL": 4, "3XL": 2 },
    rating: "4.9",
    reviews: 142,
    bought_this_month: "420+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Blush Rose", hex: "#E8C5C8" },
      { name: "Sage Green", hex: "#8A9A86" },
      { name: "Ivory Gold", hex: "#F3EAD8" }
    ],
    specs: [
      "Pure Handwoven Chanderi Silk Fabric",
      "Intricate Zari & Sequin Embroidery on Neckline",
      "Matching Organza Dupatta with Scalloped Borders",
      "Breathable Cotton Silk Inner Lining Included",
      "Dry Clean Recommended"
    ],
    is_featured: true
  },
  {
    id: "kr-noor-mulmul",
    slug: "noor-hand-embroidered-mulmul-kurta-set",
    token: "tok_noor_02",
    title: "Noor Handcrafted Mulmul Kurta & Palazzo Set",
    category: "Kurtas",
    price: 2899,
    mrp: 3999,
    tag: "Handcrafted",
    stock_qty: 12,
    sizes_stock: { "S": 8, "M": 10, "L": 6, "XL": 4, "XXL": 2, "3XL": 0 },
    rating: "4.8",
    reviews: 98,
    bought_this_month: "310+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Powder Blue", hex: "#B8C9D9" },
      { name: "Peach Pink", hex: "#F5C8B8" },
      { name: "Mint Mist", hex: "#C7D8C6" }
    ],
    specs: [
      "100% Breathable Organic Mulmul Cotton",
      "Hand-done Chikankari Inspired Threadwork",
      "Comfort-fit Palazzo with Elasticated Waistband",
      "Featherlight for All-Day Festive Comfort",
      "Gentle Hand Wash or Dry Clean"
    ],
    is_featured: true
  },
  {
    id: "kr-emerald-slip",
    slug: "satin-cowl-neck-midi-slip-dress",
    token: "tok_slip_03",
    title: "Emerald Satin Cowl Neck Midi Slip Dress",
    category: "Dresses",
    price: 2499,
    mrp: 3499,
    tag: "Trending",
    stock_qty: 18,
    sizes_stock: { "S": 12, "M": 12, "L": 8, "XL": 5, "XXL": 2, "3XL": 0 },
    rating: "4.9",
    reviews: 86,
    bought_this_month: "280+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Emerald Green", hex: "#1C4E3D" },
      { name: "Champagne Gold", hex: "#EAD6B8" },
      { name: "Noir Black", hex: "#1A1A1A" }
    ],
    specs: [
      "Heavyweight Luxe Satin Crepe Fabric",
      "Flattering Bias-Cut Silhouette with Cowl Neck",
      "Adjustable Spaghetti Straps with Gold Sliders",
      "Subtle Side Slit for Effortless Movement",
      "Dry Clean Only"
    ],
    is_featured: true
  },
  {
    id: "kr-mauve-maxi",
    slug: "pleated-georgette-tiered-maxi-dress",
    token: "tok_maxi_04",
    title: "Dusty Mauve Tiered Pleated Georgette Maxi Dress",
    category: "Dresses",
    price: 2799,
    mrp: 3999,
    tag: "New Launch",
    stock_qty: 9,
    sizes_stock: { "S": 5, "M": 6, "L": 4, "XL": 2, "XXL": 1, "3XL": 0 },
    rating: "4.9",
    reviews: 64,
    bought_this_month: "190+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Dusty Mauve", hex: "#A87B86" },
      { name: "Midnight Navy", hex: "#1B2838" }
    ],
    specs: [
      "Micro-Pleated Premium Georgette",
      "Ruffled Tiered Hemline with Fluid Fall",
      "Smocked Back Bodice for Customized Fit",
      "Full Satin Lining",
      "Dry Clean or Gentle Cold Wash"
    ],
    is_featured: false
  },
  {
    id: "kr-terracotta-coord",
    slug: "zari-linen-blazer-trouser-coord-set",
    token: "tok_coord_05",
    title: "Terracotta Zari Weave Linen Blazer & Trouser Co-ord Set",
    category: "Co-ords",
    price: 3299,
    mrp: 4599,
    tag: "Atelier Special",
    stock_qty: 14,
    sizes_stock: { "S": 6, "M": 8, "L": 6, "XL": 4, "XXL": 2, "3XL": 1 },
    rating: "4.9",
    reviews: 112,
    bought_this_month: "350+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Terracotta", hex: "#B85D43" },
      { name: "Olive Khaki", hex: "#636B46" },
      { name: "Sand Beige", hex: "#D6C6B0" }
    ],
    specs: [
      "Handcrafted Linen-Cotton Blend Fabric",
      "Subtle Metallic Zari Pin-Stripe Weaving",
      "Tailored Relaxed-Fit Blazer with Horn Buttons",
      "High-Waisted Straight-Leg Trousers with Pockets",
      "Dry Clean Only"
    ],
    is_featured: true
  },
  {
    id: "kr-blossom-coord",
    slug: "floral-printed-crop-top-flared-pant-coord",
    token: "tok_coord_06",
    title: "Berry Blossom Floral Crop Top & Wide Leg Co-ord",
    category: "Co-ords",
    price: 2199,
    mrp: 2999,
    tag: "Popular",
    stock_qty: 16,
    sizes_stock: { "S": 8, "M": 10, "L": 8, "XL": 4, "XXL": 2, "3XL": 0 },
    rating: "4.8",
    reviews: 73,
    bought_this_month: "230+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Berry Blossom", hex: "#8F3A52" },
      { name: "Indigo Bloom", hex: "#2C3E50" }
    ],
    specs: [
      "Soft Rayon-Modal Breathable Fabric",
      "Contemporary Bohemian Floral Digital Print",
      "Sweetheart Neckline with Smocked Back",
      "Wide-Leg Flowing Silhouette",
      "Machine Wash Cold on Gentle"
    ],
    is_featured: false
  },
  {
    id: "kr-katan-saree",
    slug: "banarasi-katan-silk-saree-zari-border",
    token: "tok_saree_07",
    title: "Royal Wine Banarasi Katan Silk Saree with Zari Border",
    category: "Sarees",
    price: 4999,
    mrp: 7999,
    tag: "Pure Heritage",
    stock_qty: 8,
    sizes_stock: { "Free Size": 8, "S": 8, "M": 8, "L": 8, "XL": 8, "XXL": 8, "3XL": 8 },
    rating: "5.0",
    reviews: 156,
    bought_this_month: "510+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Royal Wine", hex: "#581825" },
      { name: "Mustard Gold", hex: "#D4A017" },
      { name: "Rani Pink", hex: "#C71585" }
    ],
    specs: [
      "100% Pure Katan Silk Handloom Weaving",
      "Grand Kadwa Floral Zari Weave Pallu",
      "Matching Unstitched Blouse Piece Included (0.8m)",
      "Certified Handloom Mark Authenticity",
      "Dry Clean Strictly"
    ],
    is_featured: true
  },
  {
    id: "kr-organza-saree",
    slug: "tissue-organza-embroidered-festive-saree",
    token: "tok_saree_08",
    title: "Rose Gold Tissue Organza Hand-Embroidered Saree",
    category: "Sarees",
    price: 3899,
    mrp: 5499,
    tag: "Festive Pret",
    stock_qty: 11,
    sizes_stock: { "Free Size": 11, "S": 11, "M": 11, "L": 11, "XL": 11, "XXL": 11, "3XL": 11 },
    rating: "4.9",
    reviews: 119,
    bought_this_month: "390+ sold this month",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Rose Gold", hex: "#B76E79" },
      { name: "Pistachio Green", hex: "#93C572" },
      { name: "Lavender Mist", hex: "#E6E6FA" }
    ],
    specs: [
      "Sheer Shimmer Tissue Organza Body",
      "Hand-Cutwork Scallop Borders with Muted Zari",
      "Includes Satin Lining Fabric & Designer Blouse Piece",
      "Featherlight & Crisp Draping Quality",
      "Dry Clean Only"
    ],
    is_featured: false
  }
];

// Dynamic Config & State from Supabase
let activeCoupons = {
  "FESTIVE20": { code: "FESTIVE20", type: "percent", val: 20, desc: "20% Flat Discount" },
  "KRUSHIV500": { code: "KRUSHIV500", type: "flat", val: 500, desc: "₹500 Off on orders above ₹2,500" }
};
let blockedCodPincodes = [];
let countdownTimerInterval = null;
let heroBannerImages = [...DEFAULT_HERO_BANNERS];
let heroBannerTimer = null;
let currentHeroBannerIndex = 0;
let topBarMessages = [];
let currentTopBarIndex = 0;
let topBarCrossfadeTimer = null;

// Reviews Data
const customerReviews = [
  { name: "Priya S.", city: "Delhi", stars: "★★★★★", text: "Got this for clg farewell last week.. fabric is pure mulmul not transparent at all. 10/10 fit for me" },
  { name: "Ananya Mehta", city: "Mumbai", stars: "★★★★★", text: "delivered in 3 days in malad. colour is slightly darker thn pic but looks v pretty after wearing ❤️" },
  { name: "Sneha P.", city: "Ahmedabad", stars: "★★★★★", text: "3xl size milna muskil hota h usually but this suit fits so comfortably at bust!! thnx krushiv team" },
  { name: "Ritu K.", city: "Kolkata", stars: "★★★★★", text: "honestly was scared to order from insta ad but quality is legit good.. ordered L size fits perfect" },
  { name: "Kavita R.", city: "Bangalore", stars: "★★★★★", text: "kurti ka kapda bhot acha hai, washed once no color bleeding at all. totally worth 2.5k" },
  { name: "Meera D.", city: "Pune", stars: "★★★★★", text: "waist was slightly loose for me but mom adjusted it.. looking very classy & direct whatsapp pe tracking mil gayi thi!" },
  { name: "Tanya G.", city: "Noida", stars: "★★★★★", text: "satin slip dress is pure love yar.. wore it to my frnd bday party got so many compliments haha" },
  { name: "Aarti B.", city: "Lucknow", stars: "★★★★★", text: "exchange process was super fast whatsapp pe msg kiya next day pickup ho gaya tha.. thnx!" }
];

// App State
let products = [...DEFAULT_PRODUCTS];
let currentCategory = "All";
let cart = [];
let appliedCoupon = null;
let selectedPayment = "UPI";
let currentProduct = null;
let currentSize = "S";
let currentColor = null;
let carouselTimers = {};
let toastTimer = null;

// Customer Auth State
let currentCustomer = null;
let currentAuthTab = "signin";
let currentAccSubtab = "address";

// -------------------------------------------------------------
// 2. SOCIAL PROOF & GHOST SKELETON HELPERS
// -------------------------------------------------------------
function getDeterministicReviews(idStr) {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  return 85 + (Math.abs(hash) % 75);
}

function getDeterministicBought(idStr) {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 3) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  return `${180 + (Math.abs(hash) % 240)}+ bought this month`;
}

function renderGhostSkeletons() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const skeletonHtml = Array.from({ length: 6 }).map(() => `
    <div class="prod-card skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="prod-info" style="padding: 12px 6px;">
        <div class="skeleton skeleton-pill" style="width: 45%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-price"></div>
      </div>
    </div>
  `).join("");

  grid.innerHTML = skeletonHtml;
}

// -------------------------------------------------------------
// 3. STORE SETTINGS & TOP BAR CROSSFADE
// -------------------------------------------------------------
async function loadStoreSettings() {
  let topText = "Festive Pret Collection. Easy Doorstep Exchange. Use Code FESTIVE20 for 20% Off";
  let countdownEnd = null;

  try {
    if (window.supabaseClient) {
      const { data } = await supabaseClient
        .from("store_settings")
        .select("*");

      if (data && data.length > 0) {
        data.forEach(item => {
          if (item.key === "top_bar_text" && item.value) topText = item.value;
          if (item.key === "countdown_end") countdownEnd = item.value;
          if (item.key === "hero_banners" && item.value) {
            try {
              const parsed = JSON.parse(item.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                heroBannerImages = parsed;
              }
            } catch(e) {}
          }
          if (item.key === "blocked_cod_pincodes" && item.value) {
            try { blockedCodPincodes = JSON.parse(item.value || "[]"); } catch(e) {}
          }
        });
      }
    }
  } catch (e) {
    console.warn("Using default store settings:", e);
  }

  setupTopBarCrossfade(topText);
  if (countdownEnd) startCountdownTimer(countdownEnd);
  renderHeroBannerCarousel();
}

function setupTopBarCrossfade(rawText) {
  const bar = document.querySelector(".top-bar");
  if (!bar) return;

  const parts = rawText
    .split(/[.•|]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (parts.length <= 1) {
    bar.innerHTML = `<span>${rawText}</span>`;
    return;
  }

  topBarMessages = parts;
  currentTopBarIndex = 0;

  bar.innerHTML = `
    <span id="topBarMessage" style="display:inline-block; transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out; opacity: 1;">
      ${topBarMessages[0]}
    </span>
  `;

  if (topBarCrossfadeTimer) clearInterval(topBarCrossfadeTimer);

  topBarCrossfadeTimer = setInterval(() => {
    const el = document.getElementById("topBarMessage");
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(-4px)";

    setTimeout(() => {
      currentTopBarIndex = (currentTopBarIndex + 1) % topBarMessages.length;
      el.textContent = topBarMessages[currentTopBarIndex];
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 500);
  }, 4000);
}

function startCountdownTimer(targetIso) {
  const container = document.getElementById("countdownTimerContainer");
  if (!container) return;

  const targetDate = new Date(targetIso).getTime();
  if (isNaN(targetDate)) return;

  container.style.display = "inline-flex";

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      container.style.display = "none";
      if (countdownTimerInterval) clearInterval(countdownTimerInterval);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = n => String(n).padStart(2, '0');
    const elH = document.getElementById("timerHours");
    const elM = document.getElementById("timerMinutes");
    const elS = document.getElementById("timerSeconds");

    if (elH) elH.textContent = pad(hours);
    if (elM) elM.textContent = pad(mins);
    if (elS) elS.textContent = pad(secs);
  }

  update();
  countdownTimerInterval = setInterval(update, 1000);
}

// -------------------------------------------------------------
// 4. COUPONS & PRODUCT CATALOG FROM SUPABASE
// -------------------------------------------------------------
async function loadCouponsFromDb() {
  try {
    if (window.supabaseClient) {
      const { data } = await supabaseClient
        .from("coupons")
        .select("*")
        .eq("is_active", true);

      if (data && data.length > 0) {
        data.forEach(c => {
          activeCoupons[c.code] = {
            code: c.code,
            type: c.discount_type,
            val: Number(c.discount_value),
            min: Number(c.min_order_amount || 0),
            desc: c.discount_type === "percent"
              ? `${c.discount_value}% Flat Off`
              : `₹${c.discount_value} Off on ₹${c.min_order_amount || 0}+`
          };
        });
      }
    }
  } catch (e) {
    console.warn("Using default promo coupons", e);
  }
  renderCartCouponsList();
}

function renderCartCouponsList() {
  const container = document.getElementById("quickCouponsList") || document.querySelector(".pills-group");
  if (!container) return;

  const list = Object.values(activeCoupons);
  if (list.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="coupon-pill" onclick="quickCoupon('${item.code}')">
      <strong>${item.code}</strong> • ${item.desc}
    </div>
  `).join("");
}

async function loadProductsFromSupabase() {
  try {
    if (window.supabaseClient) {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Only take active products (or products where is_active is not explicitly false)
        const activeList = data.filter(p => p.is_active !== false);
        if (activeList.length > 0) {
          products = activeList.map(p => ({
            id: p.id,
            slug: p.slug || generateSlug(p.title),
            token: p.token || '',
            title: p.title,
            category: p.category,
            price: Number(p.price),
            mrp: Number(p.mrp || p.price),
            tag: p.tag || '',
            stock_qty: p.stock_qty !== undefined ? Number(p.stock_qty) : 10,
            sizes_stock: p.sizes_stock || { "S": 10, "M": 10, "L": 10, "XL": 10, "XXL": 10, "3XL": 10 },
            rating: p.rating ? Number(p.rating).toFixed(1) : "4.9",
            reviews: p.reviews ? Number(p.reviews) : getDeterministicReviews(String(p.id)),
            bought_this_month: p.bought_this_month || getDeterministicBought(String(p.id)),
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop'],
            colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: "Standard", hex: "#12100F" }],
            specs: Array.isArray(p.specs) && p.specs.length > 0 ? p.specs : ["Pure Breathable Fabric", "Artisanal Handcraft", "Gentle Dry Clean Only"],
            is_featured: !!p.is_featured
          }));
        }
      }
    }
  } catch (err) {
    console.warn("Supabase products fetch note:", err);
  }

  // If products array is empty for any reason, fall back to curated starter collection
  if (!products || products.length === 0) {
    products = [...DEFAULT_PRODUCTS];
  }

  renderCatalog();
  handleUrlRouting();
}

// -------------------------------------------------------------
// 5. EDGE-TO-EDGE LUXURY HERO BANNER CAROUSEL
// -------------------------------------------------------------
function formatDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim().replace(/^['"]|['"]$/g, '');
  
  // Auto-convert Google Drive sharing links
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return 'https://drive.google.com/uc?export=view&id=' + match[1];
    }
  }
  
  // Auto-compress Blogger raw images from /s0/ to /s1400/
  if (url.includes('blogger.googleusercontent.com') && url.includes('/s0/')) {
    url = url.replace('/s0/', '/s1400/');
  }
  
  return url;
}

function renderHeroBannerCarousel() {
  const container = document.getElementById("featuredCarouselContainer");
  if (!container) return;

  if (heroBannerTimer) clearInterval(heroBannerTimer);

  let cleanImages = (heroBannerImages || []).map(formatDirectImageUrl).filter(Boolean);
  if (cleanImages.length === 0) {
    cleanImages = DEFAULT_HERO_BANNERS.map(formatDirectImageUrl).filter(Boolean);
    heroBannerImages = [...DEFAULT_HERO_BANNERS];
  }

  currentHeroBannerIndex = 0;

  let dotsHtml = "";
  if (cleanImages.length > 1) {
    dotsHtml = '<div class="hero-edge-dots" id="heroEdgeDots">' +
      cleanImages.map((_, idx) => '<span class="h-dot ' + (idx === 0 ? 'active' : '') + '" onclick="event.stopPropagation(); setHeroBannerIndex(' + idx + ')"></span>').join("") +
      '</div>';
  }

  container.innerHTML = '<div class="hero-edge-wrap fade-up-init">' +
    '<div class="hero-edge-slide-box" id="heroEdgeBox" onclick="handleHeroBannerClick()">' +
      '<img id="heroEdgeImg" class="hero-edge-img visible" src="' + cleanImages[0] + '" alt="KRUSHIV Hero Collection" referrerpolicy="no-referrer" loading="eager" fetchpriority="high" />' +
      '<div class="hero-edge-scrim"></div>' +
      '<div class="hero-explore-pill-wrap">' +
        '<button class="btn-hero-explore-pill" onclick="event.stopPropagation(); scrollSmoothToProducts()">' +
          '<span>Explore Collection</span>' +
          '<i data-lucide="arrow-down" style="width:12px; height:12px;"></i>' +
        '</button>' +
      '</div>' +
      dotsHtml +
    '</div>' +
  '</div>';

  if (window.lucide) window.lucide.createIcons();

  if (cleanImages.length > 1) {
    heroBannerTimer = setInterval(() => {
      setHeroBannerIndex((currentHeroBannerIndex + 1) % cleanImages.length);
    }, 4500);
  }
}

function handleHeroBannerClick() {
  scrollSmoothToProducts();
}

function setHeroBannerIndex(index) {
  const cleanImages = (heroBannerImages && heroBannerImages.length > 0 ? heroBannerImages : DEFAULT_HERO_BANNERS).map(formatDirectImageUrl).filter(Boolean);
  if (!cleanImages || cleanImages.length <= 1) return;
  currentHeroBannerIndex = index;
  const img = document.getElementById("heroEdgeImg");
  const dots = document.querySelectorAll("#heroEdgeDots .h-dot");

  if (img) {
    img.style.opacity = "0.2";
    setTimeout(() => {
      img.src = cleanImages[currentHeroBannerIndex];
      img.style.opacity = "1";
    }, 200);
  }

  dots.forEach((d, i) => {
    d.classList.toggle("active", i === currentHeroBannerIndex);
  });
}

function scrollSmoothToProducts() {
  const target = document.querySelector(".cat-scroll") || document.getElementById("productGrid");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// -------------------------------------------------------------
// 6. SLUG & TOKEN URL ROUTING
// -------------------------------------------------------------
function handleUrlRouting() {
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get("p");
  const tokenParam = params.get("token") || params.get("t");

  if (slugParam) {
    const matched = products.find(p => p.slug === slugParam || String(p.id) === slugParam);
    if (matched) {
      showProductDetails(matched.id);
      return;
    }
  }

  if (tokenParam) {
    const matched = products.find(p => p.token === tokenParam);
    if (matched) {
      showProductDetails(matched.id);
      return;
    }
  }

  const path = window.location.pathname;
  if (path.startsWith("/p/")) {
    const slug = path.replace("/p/", "").split("/")[0];
    const matched = products.find(p => p.slug === slug || String(p.id) === slug);
    if (matched) showProductDetails(matched.id);
  } else if (path.startsWith("/t/")) {
    const tok = path.replace("/t/", "").split("/")[0];
    const matched = products.find(p => p.token === tok);
    if (matched) showProductDetails(matched.id);
  }
}

// -------------------------------------------------------------
// 7. CATALOG & PRODUCT GRID
// -------------------------------------------------------------
function renderCatalog() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  Object.values(carouselTimers).forEach(timerObj => {
    if (timerObj.timeout) clearTimeout(timerObj.timeout);
    if (timerObj.interval) clearInterval(timerObj.interval);
  });
  carouselTimers = {};

  const list = currentCategory === "All"
    ? products
    : products.filter(p => {
        const pCat = (p.category || "").toLowerCase();
        const curCat = currentCategory.toLowerCase();
        return pCat === curCat || pCat.includes(curCat) || curCat.includes(pCat);
      });

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-grid-msg">
        <div style="font-size: 1.5rem; margin-bottom: 6px;">👗</div>
        <div>No pieces available in "${currentCategory}" right now.</div>
        <div style="font-size: 0.8rem; color: var(--muted); margin-top: 4px;">Select "All Pieces" to view our complete festive collection.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(item => {
    const offPct = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
    const firstImg = (item.images && item.images.length > 0)
      ? item.images[0]
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop';

    const isOutOfStock = item.stock_qty <= 0;
    const isLowStock = item.stock_qty > 0 && item.stock_qty <= 5;

    let stockChip = "";
    if (isOutOfStock) {
      stockChip = `<span class="tag-chip" style="background:#B91C1C; color:#fff;">Out of Stock</span>`;
    } else if (isLowStock) {
      stockChip = `<span class="tag-chip" style="background:#FEF3C7; color:#B45309;">Only ${item.stock_qty} left!</span>`;
    } else if (item.tag) {
      stockChip = `<span class="tag-chip">${item.tag}</span>`;
    }

    return `
      <article class="prod-card fade-up-init" style="${isOutOfStock ? 'opacity: 0.85;' : ''}">
        <div class="carousel-box" onclick="showProductDetails('${item.id}')">
          ${stockChip}

          <div class="carousel-track" id="track-${item.id}">
            ${(item.images.length > 0 ? item.images : [firstImg]).map(imgUrl => `
              <div class="carousel-slide">
                <img src="${imgUrl}" alt="${item.title}" loading="lazy">
              </div>
            `).join("")}
          </div>

          ${item.images.length > 1 ? `
            <div class="carousel-dots" id="dots-${item.id}">
              ${item.images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join("")}
            </div>
          ` : ''}
        </div>

        <div class="prod-info">
          <!-- Inline Rating Badge & Sold Status -->
          <div class="rating-strip-inline">
            <span class="rating-badge-green">★ ${item.rating || '4.9'} (${item.reviews || '120'})</span>
            <span class="rating-sold-txt">🔥 ${item.bought_this_month || '300+ sold this month'}</span>
          </div>

          <span class="prod-cat">${item.category}</span>
          <h3 class="prod-name" title="${item.title}">${item.title}</h3>

          <div class="prod-price-row">
            <span class="val-sale">${CURRENCY}${item.price.toLocaleString('en-IN')}</span>
            ${item.mrp > item.price ? `<span class="val-mrp">${CURRENCY}${item.mrp.toLocaleString('en-IN')}</span>` : ''}
            ${offPct > 0 ? `<span class="val-off">${offPct}% OFF</span>` : ''}
          </div>

          <button class="btn-add-cart-single" onclick="showProductDetails('${item.id}')" style="${isOutOfStock ? 'background:#666; border-color:#666;' : ''}">
            ${isOutOfStock ? 'View (Sold Out)' : 'View & Buy'}
          </button>
        </div>
      </article>
    `;
  }).join("");

  const durations = [3200, 4200, 3600, 4800, 3900, 5200];
  list.forEach((item, index) => {
    if (item.images && item.images.length > 1) {
      setupCardImageCycle(item.id, item.images.length, (index * 600) % 2400, durations[index % durations.length]);
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

function setupCardImageCycle(id, totalSlides, startDelay, cycleSpeed) {
  let activeIndex = 0;
  const timeoutId = setTimeout(() => {
    const intervalId = setInterval(() => {
      activeIndex = (activeIndex + 1) % totalSlides;
      const track = document.getElementById(`track-${id}`);
      const dots = document.getElementById(`dots-${id}`);

      if (track) {
        track.style.transform = `translateX(-${activeIndex * 100}%)`;
      }
      if (dots) {
        Array.from(dots.children).forEach((d, i) => {
          d.classList.toggle("active", i === activeIndex);
        });
      }
    }, cycleSpeed);

    if (carouselTimers[id]) {
      carouselTimers[id].interval = intervalId;
    }
  }, startDelay);

  carouselTimers[id] = { timeout: timeoutId, interval: null };
}

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(btn => {
    const txt = btn.textContent.trim();
    if (cat === "All" && txt.includes("All")) {
      btn.classList.add("active");
    } else if (cat !== "All" && txt.toLowerCase().includes(cat.toLowerCase())) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  renderCatalog();
}

// -------------------------------------------------------------
// 8. PRODUCT DETAILS PAGE (PDP)
// -------------------------------------------------------------
function showProductDetails(id) {
  const item = products.find(p => String(p.id) === String(id));
  if (!item) return;

  currentProduct = item;
  currentColor = (item.colors && item.colors.length > 0) ? item.colors[0].name : "Standard";

  const catEl = document.getElementById("pdpCatName");
  if (catEl) catEl.textContent = item.category;

  const titleEl = document.getElementById("pdpItemTitle");
  if (titleEl) titleEl.textContent = item.title;

  const starsEl = document.getElementById("pdpRatingStars");
  if (starsEl) starsEl.textContent = `★ ${item.rating || '4.9'}`;

  const revEl = document.getElementById("pdpRatingReviews");
  if (revEl) revEl.textContent = `(${item.reviews || '0'} Reviews)`;

  const boughtElem = document.getElementById("pdpBoughtStats");
  if (boughtElem) {
    if (item.stock_qty <= 0) {
      boughtElem.textContent = "❌ Out of Stock";
      boughtElem.style.background = "#FEE2E2";
      boughtElem.style.color = "#B91C1C";
      boughtElem.style.display = "inline-block";
    } else if (item.stock_qty <= 5) {
      boughtElem.textContent = `🔥 Only ${item.stock_qty} pieces left in stock!`;
      boughtElem.style.background = "#FEF3C7";
      boughtElem.style.color = "#B45309";
      boughtElem.style.display = "inline-block";
    } else if (item.bought_this_month) {
      boughtElem.textContent = `🔥 ${item.bought_this_month}`;
      boughtElem.style.background = "#F3EFEA";
      boughtElem.style.color = "#8A6D3B";
      boughtElem.style.display = "inline-block";
    } else {
      boughtElem.style.display = "none";
    }
  }

  // Price handling (supports both pdpPriceVal and pdpPriceCurrent)
  const priceEl = document.getElementById("pdpPriceVal") || document.getElementById("pdpPriceCurrent");
  if (priceEl) priceEl.textContent = `${CURRENCY}${item.price.toLocaleString('en-IN')}`;

  const mrpEl = document.getElementById("pdpMrpVal") || document.getElementById("pdpPriceOriginal");
  const discountEl = document.getElementById("pdpOffVal") || document.getElementById("pdpDiscountTag");

  if (item.mrp > item.price) {
    if (mrpEl) {
      mrpEl.textContent = `${CURRENCY}${item.mrp.toLocaleString('en-IN')}`;
      mrpEl.style.display = "inline";
    }
    const pct = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    if (discountEl) {
      discountEl.textContent = `${pct}% OFF`;
      discountEl.style.display = "inline-block";
    }
  } else {
    if (mrpEl) mrpEl.style.display = "none";
    if (discountEl) discountEl.style.display = "none";
  }

  // Multi-image peek slider with clickable dots
  const track = document.getElementById("pdpPeekSlider") || document.getElementById("pdpSliderTrack");
  const dotsContainer = document.getElementById("pdpSliderDots") || document.getElementById("pdpDotsContainer");
  const imgs = (item.images && item.images.length > 0)
    ? item.images
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop'];

  if (track) {
    track.innerHTML = imgs.map(url => `
      <div class="pdp-peek-slide pdp-slide">
        <img src="${url}" alt="${item.title}">
      </div>
    `).join("");

    track.onscroll = () => {
      const slideWidth = track.clientWidth * 0.85;
      const activeIndex = Math.round(track.scrollLeft / slideWidth);
      if (dotsContainer) {
        dotsContainer.querySelectorAll(".pdp-dot").forEach((d, i) => {
          d.classList.toggle("active", i === activeIndex);
        });
      }
    };
  }

  if (dotsContainer) {
    dotsContainer.innerHTML = imgs.map((_, i) => `
      <span class="pdp-dot ${i === 0 ? 'active' : ''}" onclick="scrollPdpSlide(${i})"></span>
    `).join("");
  }

  // Color Swatches
  const colorArea = document.getElementById("pdpColorsGroup") || document.getElementById("pdpColorSwatches");
  if (colorArea) {
    colorArea.innerHTML = (item.colors || []).map((col, idx) => `
      <button class="color-swatch-btn color-swatch ${idx === 0 ? 'selected active' : ''}" style="background-color: ${col.hex};" title="${col.name}" onclick="pickColor('${col.name}', this)"></button>
    `).join("");
  }
  const colorNameEl = document.getElementById("pdpSelectedColorName");
  if (colorNameEl) colorNameEl.textContent = currentColor;

  // Size Options & Size-Level Stock check
  const sizeWrap = document.getElementById("pdpSizesGroup") || document.getElementById("pdpSizePills");
  const allSizes = ["S", "M", "L", "XL", "XXL", "3XL"];
  const stockMap = item.sizes_stock || {};

  let firstValidSize = null;
  if (sizeWrap) {
    sizeWrap.innerHTML = allSizes.map(sz => {
      const qtyForSize = stockMap[sz] !== undefined ? Number(stockMap[sz]) : item.stock_qty;
      const isOut = qtyForSize <= 0;
      if (!isOut && !firstValidSize) firstValidSize = sz;

      return `
        <button 
          class="size-btn-pill size-pill ${isOut ? 'out-of-stock' : ''}" 
          onclick="pickSize('${sz}', this, ${isOut})"
          ${isOut ? 'disabled title="Size out of stock"' : ''}
        >
          <span>${sz}</span>
        </button>
      `;
    }).join("");

    currentSize = firstValidSize || "S";
    const defaultPill = Array.from(sizeWrap.querySelectorAll(".size-btn-pill, .size-pill")).find(p => p.textContent.trim() === currentSize);
    if (defaultPill) {
      defaultPill.classList.add("selected");
      defaultPill.classList.add("active");
    }
  }

  // Specs & Highlights
  const specsList = document.getElementById("pdpSpecsList");
  if (specsList) {
    specsList.innerHTML = (item.specs || []).map(s => `<li><span class="spec-bullet">✓</span> ${s}</li>`).join("");
  }

  // Pre-fill delivery info if logged in
  if (currentCustomer) {
    loadCustomerProfile(currentCustomer.id);
  }

  renderCustomerReviews();
  renderSimilarProducts(item);

  // Switch View safely
  const catalog = document.getElementById("catalogView") || document.getElementById("homeView");
  const pdp = document.getElementById("pdpView");
  if (catalog) catalog.classList.remove("active");
  if (pdp) pdp.classList.add("active");
  document.body.classList.add("pdp-active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (window.history.pushState) {
    const url = item.slug ? `/p/${item.slug}` : `?p=${item.id}`;
    window.history.pushState({ page: 'pdp', id: item.id }, '', url);
  }

  if (window.lucide) window.lucide.createIcons();
}

function scrollPdpSlide(index) {
  const track = document.getElementById("pdpPeekSlider") || document.getElementById("pdpSliderTrack");
  if (!track) return;
  const slideWidth = track.clientWidth * 0.88;
  track.scrollTo({ left: index * slideWidth, behavior: "smooth" });
}

function pickColor(name, btn) {
  currentColor = name;
  const colorNameEl = document.getElementById("pdpSelectedColorName");
  if (colorNameEl) colorNameEl.textContent = name;
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll(".color-swatch-btn, .color-swatch").forEach(b => {
      b.classList.remove("selected");
      b.classList.remove("active");
    });
  }
  btn.classList.add("selected");
  btn.classList.add("active");
}

function pickSize(sz, btn, isOut) {
  if (isOut) return;
  currentSize = sz;
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll(".size-btn-pill, .size-pill").forEach(b => {
      b.classList.remove("selected");
      b.classList.remove("active");
    });
  }
  btn.classList.add("selected");
  btn.classList.add("active");
}

function addCurrentPdp(isInstantOrder) {
  if (!currentProduct) return;
  if (currentProduct.stock_qty <= 0) {
    showToast("This piece is currently out of stock.");
    return;
  }
  const size = currentSize || "S";
  const color = currentColor || (currentProduct.colors && currentProduct.colors.length > 0 ? currentProduct.colors[0].name : "Standard");
  addToBag(currentProduct, size, color);
  if (isInstantOrder) {
    toggleBagDrawer(true);
  }
}

function togglePdpAccordion(headerEl) {
  const box = headerEl.closest(".accordion-box");
  if (!box) return;
  const content = box.querySelector(".accordion-content");
  const icon = box.querySelector(".acc-toggle-icon");
  if (!content) return;
  const isOpen = content.style.display === "block";
  content.style.display = isOpen ? "none" : "block";
  if (icon) icon.textContent = isOpen ? "+" : "−";
}

function renderCustomerReviews() {
  const container = document.getElementById("reviewsTrack") || document.getElementById("pdpReviewsList");
  if (!container) return;

  // Render twice for endless smooth marquee looping
  const combined = [...customerReviews, ...customerReviews];
  container.innerHTML = combined.map(r => `
    <div class="review-bubble">
      <div class="review-user-row">
        <span class="review-name">${r.name}</span>
        <span class="verified-chip">Verified Buyer</span>
      </div>
      <div class="review-stars">${r.stars}</div>
      <div class="review-comment">"${r.text}"</div>
    </div>
  `).join("");
}

function renderSimilarProducts(currentItem) {
  const similar = products.filter(p => p.id !== currentItem.id).slice(0, 4);
  const grid = document.getElementById("similarGrid");
  if (!grid) return;

  grid.innerHTML = similar.map(p => `
    <div class="prod-card" style="cursor:pointer;" onclick="showProductDetails('${p.id}')">
      <div style="aspect-ratio:3/4; overflow:hidden; border-radius:var(--radius-sm); background:#EAE6DF;">
        <img src="${(p.images && p.images[0]) || ''}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">
      </div>
      <div style="padding:8px 2px;">
        <div style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">${p.category}</div>
        <div style="font-size:0.82rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</div>
        <div style="font-weight:700; font-size:0.9rem; margin-top:2px;">${CURRENCY}${p.price.toLocaleString('en-IN')}</div>
      </div>
    </div>
  `).join("");
}

function openHomeView() {
  const catalog = document.getElementById("catalogView") || document.getElementById("homeView");
  const pdp = document.getElementById("pdpView");
  if (pdp) pdp.classList.remove("active");
  if (catalog) catalog.classList.add("active");
  document.body.classList.remove("pdp-active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (window.history.pushState) {
    window.history.pushState({ page: 'home' }, '', '/');
  }
  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener("popstate", (e) => {
  if (e.state && e.state.page === "pdp" && e.state.id) {
    showProductDetails(e.state.id);
  } else {
    openHomeView();
  }
});

// -------------------------------------------------------------
// 9. ORDER TRACKING & LEGAL MODALS
// -------------------------------------------------------------
function openTrackModal() {
  const m = document.getElementById("trackModal");
  if (m) m.classList.add("active");
  const res = document.getElementById("trackResult");
  if (res) res.innerHTML = "";
  const inp = document.getElementById("trackInput") || document.getElementById("trackOrderInput");
  if (inp) inp.value = "";
}

function closeTrackModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const m = document.getElementById("trackModal");
  if (m) m.classList.remove("active");
}

function closeTrackModalDirect() {
  const m = document.getElementById("trackModal");
  if (m) m.classList.remove("active");
}

async function submitTrackingInquiry() {
  const inp = document.getElementById("trackInput") || document.getElementById("trackOrderInput");
  const query = inp ? inp.value.trim() : "";
  if (!query) {
    showToast("Please enter your Order Code or Mobile Number");
    return;
  }

  let orderInfo = "";
  try {
    if (window.supabaseClient) {
      const { data } = await supabaseClient
        .from("orders")
        .select("*")
        .or(`order_id.eq.${query},customer_phone.eq.${query}`)
        .limit(1);

      if (data && data.length > 0) {
        const o = data[0];
        orderInfo = `\nOrder Found: ${o.order_id}\nStatus: ${o.order_status || 'Confirmed'}\nTotal: ₹${o.total}`;
      }
    }
  } catch (e) {
    console.warn("Order lookup:", e);
  }

  const text = encodeURIComponent(`Hi KRUSHIV Atelier! I would like to check the status of my order.\nOrder/Phone: ${query}${orderInfo}`);
  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, "_blank");
  closeTrackModalDirect();
}

const legalContent = {
  exchange: {
    title: "Doorstep Exchange & Returns",
    body: "<p>We offer a 100% hassle-free 7-day doorstep exchange service across India.</p><br><p><strong>Exchange Process:</strong> Simply message our WhatsApp helpdesk with your order ID and the desired size/color. We will arrange reverse pickup directly from your doorstep and dispatch your replacement.</p><br><p><strong>Conditions:</strong> Garments must be unworn, unwashed with all original designer tags intact.</p>"
  },
  shipping: {
    title: "Shipping Information",
    body: "<p><strong>Dispatch:</strong> All in-stock pret pieces are dispatched within 24–48 business hours from our atelier.</p><br><p><strong>Delivery Timelines:</strong> Metro cities: 2–4 business days. Rest of India: 4–6 business days.</p><br><p><strong>Courier Partners:</strong> Bluedart, Delhivery, DTDC & Express Air Logistics.</p><br><p><strong>Prepaid Orders:</strong> 100% Free Express Shipping across India.</p>"
  },
  privacy: {
    title: "Privacy Policy",
    body: "<p>At KRUSHIV Atelier, we respect your confidentiality. Your name, phone number, and address are solely used for courier dispatch and order confirmation via WhatsApp.</p><br><p>We never share, sell, or rent your personal information to third-party marketing networks.</p>"
  },
  terms: {
    title: "Terms & Conditions",
    body: "<p>By placing an order via our WhatsApp or website checkout, you agree to our standard terms of purchase.</p><br><p>Handloom fabrics naturally possess unique weave variations that testify to genuine artisanal craft. All prices include applicable GST.</p>"
  },
  payment: {
    title: "Payment Security",
    body: "<p>We support 100% secure payments via UPI (Google Pay, PhonePe, Paytm, BHIM) and Cash on Delivery (COD).</p><br><p>Online transfers are processed directly through authorized banking gateways with end-to-end encryption.</p>"
  }
};

function openLegalModal(key) {
  const data = legalContent[key];
  if (!data) return;
  const titleEl = document.getElementById("legalModalTitle");
  const bodyEl = document.getElementById("legalModalBody");
  if (titleEl) titleEl.textContent = data.title;
  if (bodyEl) bodyEl.innerHTML = data.body;
  const m = document.getElementById("legalModal");
  if (m) m.classList.add("active");
}

function closeLegalModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const m = document.getElementById("legalModal");
  if (m) m.classList.remove("active");
}

function closeLegalModalDirect() {
  const m = document.getElementById("legalModal");
  if (m) m.classList.remove("active");
}

function toggleSidebar(open) {
  const sidebar = document.getElementById("mobileSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.toggle("open", open);
  if (overlay) overlay.classList.toggle("open", open);
}

// -------------------------------------------------------------
// 10. SHOPPING BAG & CHECKOUT
// -------------------------------------------------------------
function addToBag(item, size, color) {
  const match = cart.find(c => String(c.id) === String(item.id) && c.size === size && c.color === color);
  if (match) {
    match.qty += 1;
  } else {
    cart.push({ ...item, size, color, qty: 1 });
  }
  showToast(`Added: ${item.title} (${color} / ${size})`);
  updateBagDisplay();
}

function changeQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateBagDisplay();
}

function toggleBagDrawer(open) {
  const drawer = document.getElementById("bagDrawer");
  const scrim = document.getElementById("drawerScrim");
  if (drawer) drawer.classList.toggle("open", open);
  if (scrim) scrim.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "auto";
  if (window.lucide) window.lucide.createIcons();
}

const bagTrigger = document.getElementById("openBagTrigger");
if (bagTrigger) {
  bagTrigger.addEventListener("click", () => toggleBagDrawer(true));
}

function quickCoupon(code) {
  const input = document.getElementById("couponInput");
  if (input) input.value = code;
  applyCoupon();
}

function applyCoupon() {
  const input = document.getElementById("couponInput");
  const status = document.getElementById("couponStatus");
  if (!input || !status) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    appliedCoupon = null;
    status.textContent = "";
    updateBagDisplay();
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const found = activeCoupons[code];

  if (!found) {
    status.style.color = "#B91C1C";
    status.textContent = "Invalid coupon code.";
    appliedCoupon = null;
    updateBagDisplay();
    return;
  }

  if (found.min && subtotal < found.min) {
    status.style.color = "#B91C1C";
    status.textContent = `Coupon requires minimum order of ₹${found.min.toLocaleString('en-IN')}.`;
    appliedCoupon = null;
    updateBagDisplay();
    return;
  }

  appliedCoupon = found;
  status.style.color = "#2E7D32";
  status.textContent = `✓ Coupon "${code}" applied! ${found.desc}`;
  updateBagDisplay();
}

function selectPaymentMethod(mode) {
  selectedPayment = mode;
  const upiCard = document.getElementById("payCardUpi");
  const codCard = document.getElementById("payCardCod");
  if (upiCard) upiCard.classList.toggle("active", mode === "UPI");
  if (codCard) codCard.classList.toggle("active", mode === "COD");
  updateBagDisplay();
}

function updateBagDisplay() {
  triggerCloudCartSync();
  const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const realSubtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const countBadge = document.getElementById("headerBagCount");
  const drawerBadge = document.getElementById("drawerCount");
  if (countBadge) countBadge.textContent = totalCount;
  if (drawerBadge) drawerBadge.textContent = totalCount;

  const subtotalEl = document.getElementById("ledgerSubtotal");
  if (subtotalEl) subtotalEl.textContent = `${CURRENCY}${realSubtotal.toLocaleString('en-IN')}`;

  let discountAmount = 0;
  if (appliedCoupon && realSubtotal > 0) {
    discountAmount = appliedCoupon.type === "percent"
      ? Math.round((realSubtotal * appliedCoupon.val) / 100)
      : appliedCoupon.val;
  }

  const discountRow = document.getElementById("ledgerDiscountRow");
  const discountLabel = document.getElementById("ledgerDiscountLabel");
  const discountVal = document.getElementById("ledgerDiscountVal");

  if (discountRow) {
    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      if (discountLabel) discountLabel.textContent = `Discount (${appliedCoupon.code}):`;
      if (discountVal) discountVal.textContent = `-${CURRENCY}${discountAmount.toLocaleString('en-IN')}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  const codFee = selectedPayment === "COD" ? COD_FEE : 0;
  const codRow = document.getElementById("ledgerCodRow");
  if (codRow) {
    codRow.style.display = codFee > 0 ? "flex" : "none";
  }

  const finalTotal = Math.max(0, realSubtotal - discountAmount + codFee);
  const totalEl = document.getElementById("ledgerTotal");
  if (totalEl) totalEl.textContent = `${CURRENCY}${finalTotal.toLocaleString('en-IN')}`;

  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById("bagItemsContainer") || document.getElementById("drawerItemsList");
  const footer = document.getElementById("bagFooter") || document.querySelector(".drawer-footer") || document.querySelector(".bag-footer");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 50px 10px; color: var(--muted);">
        <div style="font-size: 2rem; margin-bottom: 6px;">🛍️</div>
        <div style="font-size: 0.95rem; font-weight: 600; color: var(--noir);">Your shopping bag is empty</div>
        <div style="font-size: 0.8rem; margin-top: 4px;">Explore our pieces and add your favorites.</div>
      </div>
    `;
    if (footer) footer.style.display = "none";
    return;
  }

  if (footer) footer.style.display = "block";
  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item-row" style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid var(--border);">
      <img src="${(item.images && item.images[0]) || ''}" alt="${item.title}" class="cart-item-img" style="width:65px; height:80px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0;">
      <div class="cart-item-meta" style="flex:1;">
        <div class="cart-item-title" style="font-size:0.85rem; font-weight:600; line-height:1.3;">${item.title}</div>
        <div class="cart-item-specs" style="font-size:0.75rem; color:var(--muted); margin:3px 0;">Color: ${item.color} | Size: ${item.size}</div>
        <div class="cart-item-price" style="font-size:0.9rem; font-weight:700;">${CURRENCY}${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-qty-bar" style="display:inline-flex; align-items:center; gap:8px; border:1px solid var(--border); border-radius:4px; padding:2px 8px; margin-top:6px;">
          <button class="btn-qty" onclick="changeQty(${idx}, -1)" style="border:none; background:none; cursor:pointer; font-weight:bold; font-size:0.9rem;">−</button>
          <span style="font-size:0.82rem; font-weight:600;">${item.qty}</span>
          <button class="btn-qty" onclick="changeQty(${idx}, 1)" style="border:none; background:none; cursor:pointer; font-weight:bold; font-size:0.9rem;">+</button>
        </div>
      </div>
    </div>
  `).join("");
}

function showToast(msg) {
  const t = document.getElementById("toastNotice");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
  }, 2600);
}

// -------------------------------------------------------------
// 11. WHATSAPP ORDER SUBMISSION & AUDIT LOGGING
// -------------------------------------------------------------
async function submitOrderToWhatsApp() {
  if (cart.length === 0) {
    alert("Your shopping bag is empty.");
    return;
  }

  const name = (document.getElementById("custName")?.value || "").trim();
  const phone = (document.getElementById("custPhone")?.value || "").trim();
  const addrEl = document.getElementById("custAddr1") || document.getElementById("custAddress");
  const addr1 = (addrEl?.value || "").trim();
  const nearby = (document.getElementById("custNearby")?.value || "").trim();
  const pincode = (document.getElementById("custPincode")?.value || "").trim();

  if (!name || !phone || !addr1 || !pincode) {
    alert("Please fill in your Name, 10-digit Phone, Delivery Address, and Pincode.");
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    alert("Please enter a valid 10-digit Indian phone number.");
    return;
  }

  if (!/^\d{6}$/.test(pincode)) {
    alert("Please enter a valid 6-digit postal pincode.");
    return;
  }

  if (selectedPayment === "COD" && blockedCodPincodes.includes(pincode)) {
    alert(`We apologize, but Cash on Delivery (COD) is unavailable for pincode ${pincode}. Please select Online UPI payment.`);
    selectPaymentMethod("UPI");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    discount = appliedCoupon.type === "percent"
      ? Math.round((subtotal * appliedCoupon.val) / 100)
      : appliedCoupon.val;
  }
  const codExtra = (selectedPayment === "COD") ? COD_FEE : 0;
  const payable = Math.max(0, subtotal - discount + codExtra);

  // Generate order code
  const orderId = `KR-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    if (window.supabaseClient) {
      await supabaseClient.from("orders").insert([{
        order_id: orderId,
        user_id: currentCustomer ? currentCustomer.id : null,
        customer_name: name,
        customer_phone: phone,
        delivery_address: addr1,
        landmark: nearby,
        pincode: pincode,
        payment_method: selectedPayment,
        subtotal: subtotal,
        discount: discount,
        total: payable,
        items: cart.map(i => ({ id: i.id, title: i.title, color: i.color, size: i.size, qty: i.qty, price: i.price }))
      }]);
    }
  } catch (e) {
    console.warn("Audit order log note:", e);
  }

  const itemsSummary = cart.map((item, i) =>
    `${i + 1}. *${item.title}*\n • Color: ${item.color}\n • Size: ${item.size}\n • Qty: ${item.qty}\n • Price: ${CURRENCY}${(item.price * item.qty).toLocaleString('en-IN')}`
  ).join("\n\n");

  const message = `✨ *NEW ORDER REQUEST — KRUSHIV ATELIER* ✨\n` +
    `-----------------------------------------\n` +
    `🔖 *ORDER ID: ${orderId}*\n` +
    `👤 *CUSTOMER DETAILS:*\n` +
    `• Name: ${name}\n` +
    `• Phone: +91 ${phone}\n` +
    `• Delivery Address: ${addr1}\n` +
    (nearby ? `• Landmark: ${nearby}\n` : '') +
    `• Pincode: ${pincode}\n` +
    `-----------------------------------------\n` +
    `🛍️ *ITEMS IN BAG:*\n\n${itemsSummary}\n` +
    `-----------------------------------------\n` +
    `💳 *PAYMENT & BILLING SUMMARY:*\n` +
    `• Bag Subtotal: ${CURRENCY}${subtotal.toLocaleString('en-IN')}\n` +
    (discount > 0 ? `• Applied Offer: -${CURRENCY}${discount.toLocaleString('en-IN')} (${appliedCoupon.code})\n` : '') +
    (codExtra > 0 ? `• COD Convenience Fee: +${CURRENCY}${codExtra}\n` : '') +
    `• Standard Delivery: FREE\n` +
    `• *Total Payable: ${CURRENCY}${payable.toLocaleString('en-IN')}*\n` +
    `• Payment Mode: *${selectedPayment === 'COD' ? 'Cash on Delivery' : 'Online / UPI (GPay/PhonePe/Paytm)'}*\n` +
    `-----------------------------------------\n` +
    `Please confirm my order and share dispatch tracking details. Thank you!`;

  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank");
}

function openGeneralChatWhatsApp() {
  const text = `Hi KRUSHIV Atelier! I am browsing your online store and have a query regarding a piece.`;
  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
}

// -------------------------------------------------------------
// 12. CUSTOMER ACCOUNTS, CLOUD CART & PROFILE SYNC
// -------------------------------------------------------------
function parseLoginIdentifier(input) {
  const cleaned = input.trim();
  if (/^\d{10}$/.test(cleaned)) {
    return { email: `in_${cleaned}@krushiv.store`, phone: cleaned, isPhone: true };
  }
  return { email: cleaned.toLowerCase(), phone: null, isPhone: false };
}

async function initCustomerAuth() {
  try {
    if (!window.supabaseClient) return;
    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session && data.session.user) {
      handleCustomerSessionActive(data.session.user);
    } else {
      handleCustomerSessionLoggedOut();
    }

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        handleCustomerSessionActive(session.user);
      } else {
        handleCustomerSessionLoggedOut();
      }
    });
  } catch (err) {
    console.warn("Customer auth session note:", err);
    handleCustomerSessionLoggedOut();
  }
}

function handleCustomerSessionActive(user) {
  currentCustomer = user;
  const dot = document.getElementById("headerAuthDot");
  if (dot) dot.style.display = "block";

  const loggedOutView = document.getElementById("authLoggedOutView");
  const loggedInView = document.getElementById("authLoggedInView");
  if (loggedOutView) loggedOutView.style.display = "none";
  if (loggedInView) loggedInView.style.display = "block";

  const dispName = user.user_metadata?.full_name || (user.email.startsWith("in_") ? user.email.replace("in_", "").replace("@krushiv.store", "") : user.email.split("@")[0]);
  const avatarEl = document.getElementById("accUserAvatar");
  const nameEl = document.getElementById("accUserName");
  const identEl = document.getElementById("accUserIdentifier");

  if (avatarEl) avatarEl.textContent = (dispName.charAt(0) || "K").toUpperCase();
  if (nameEl) nameEl.textContent = dispName;
  if (identEl) identEl.textContent = user.email.startsWith("in_") ? `+91 ${user.email.replace("in_", "").replace("@krushiv.store", "")}` : user.email;

  const sideAvatar = document.getElementById("sidebarAvatar");
  const sideName = document.getElementById("sidebarUserName");
  const sideAction = document.getElementById("sidebarUserAction");
  if (sideAvatar) sideAvatar.textContent = (dispName.charAt(0) || "K").toUpperCase();
  if (sideName) sideName.textContent = dispName;
  if (sideAction) sideAction.textContent = "View Account / Orders";

  syncCustomerCartOnLogin(user.id);
  loadCustomerProfile(user.id);
}

function handleCustomerSessionLoggedOut() {
  currentCustomer = null;
  const dot = document.getElementById("headerAuthDot");
  if (dot) dot.style.display = "none";

  const loggedOutView = document.getElementById("authLoggedOutView");
  const loggedInView = document.getElementById("authLoggedInView");
  if (loggedOutView) loggedOutView.style.display = "block";
  if (loggedInView) loggedInView.style.display = "none";

  const sideAvatar = document.getElementById("sidebarAvatar");
  const sideName = document.getElementById("sidebarUserName");
  const sideAction = document.getElementById("sidebarUserAction");
  if (sideAvatar) sideAvatar.textContent = "K";
  if (sideName) sideName.textContent = "Sign In / Register";
  if (sideAction) sideAction.textContent = "Save your bag & track orders";
}

function toggleAccountDrawer(show) {
  const drawer = document.getElementById("accountDrawer");
  const overlay = document.getElementById("accountOverlay");
  if (!drawer || !overlay) return;

  if (show) {
    drawer.classList.add("active");
    overlay.classList.add("active");
    if (window.lucide) window.lucide.createIcons();
    if (currentCustomer) {
      loadCustomerOrders(currentCustomer.id);
    }
  } else {
    drawer.classList.remove("active");
    overlay.classList.remove("active");
  }
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  const btnIn = document.getElementById("tabSignIn");
  const btnUp = document.getElementById("tabSignUp");
  const nameField = document.getElementById("fieldFullName");
  const submitBtn = document.getElementById("authSubmitBtn");
  const toggleNote = document.getElementById("authToggleNote");
  const errorAlert = document.getElementById("authErrorAlert");

  if (errorAlert) errorAlert.style.display = "none";

  if (tab === "signup") {
    if (btnIn) btnIn.classList.remove("active");
    if (btnUp) btnUp.classList.add("active");
    if (nameField) nameField.style.display = "block";
    if (submitBtn) submitBtn.textContent = "Create Account";
    if (toggleNote) toggleNote.innerHTML = 'Already have an account? <a href="javascript:void(0)" onclick="switchAuthTab(\'signin\')">Sign in</a>';
  } else {
    if (btnIn) btnIn.classList.add("active");
    if (btnUp) btnUp.classList.remove("active");
    if (nameField) nameField.style.display = "none";
    if (submitBtn) submitBtn.textContent = "Sign In to KRUSHIV";
    if (toggleNote) toggleNote.innerHTML = 'Don\'t have an account? <a href="javascript:void(0)" onclick="switchAuthTab(\'signup\')">Create one now</a>';
  }
}

function switchAccSubtab(tab) {
  currentAccSubtab = tab;
  const tabAddr = document.getElementById("subtabAddress");
  const tabOrders = document.getElementById("subtabOrders");
  const panelAddr = document.getElementById("accAddressPanel");
  const panelOrders = document.getElementById("accOrdersPanel");

  if (tab === "orders") {
    if (tabAddr) tabAddr.classList.remove("active");
    if (tabOrders) tabOrders.classList.add("active");
    if (panelAddr) panelAddr.style.display = "none";
    if (panelOrders) panelOrders.style.display = "block";
    if (currentCustomer) loadCustomerOrders(currentCustomer.id);
  } else {
    if (tabAddr) tabAddr.classList.add("active");
    if (tabOrders) tabOrders.classList.remove("active");
    if (panelAddr) panelAddr.style.display = "block";
    if (panelOrders) panelOrders.style.display = "none";
  }
  if (window.lucide) window.lucide.createIcons();
}

async function handleCustomerAuthSubmit(e) {
  e.preventDefault();
  const identVal = (document.getElementById("authIdentifier")?.value || "").trim();
  const passVal = document.getElementById("authPassword")?.value || "";
  const nameVal = (document.getElementById("authFullName")?.value || "").trim();
  const errBox = document.getElementById("authErrorAlert");
  const submitBtn = document.getElementById("authSubmitBtn");

  if (errBox) errBox.style.display = "none";
  if (!identVal || !passVal) return;

  const parsed = parseLoginIdentifier(identVal);
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
  }

  try {
    if (!window.supabaseClient) throw new Error("Supabase client not initialized.");

    if (currentAuthTab === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({
        email: parsed.email,
        password: passVal,
        options: {
          data: {
            full_name: nameVal || "Valued Customer",
            raw_phone: parsed.phone || null
          }
        }
      });
      if (error) throw error;
      if (data && data.user) {
        showToast("Account created successfully!");
        if (data.session) {
          handleCustomerSessionActive(data.user);
        } else {
          showToast("Account created! Please sign in.");
          switchAuthTab("signin");
        }
      }
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: parsed.email,
        password: passVal
      });
      if (error) throw error;
      if (data && data.user) {
        showToast("Welcome back to KRUSHIV!");
        handleCustomerSessionActive(data.user);
      }
    }
  } catch (err) {
    if (errBox) {
      errBox.textContent = err.message || "Authentication failed.";
      errBox.style.display = "block";
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = currentAuthTab === "signup" ? "Create Account" : "Sign In to KRUSHIV";
    }
  }
}

async function handleCustomerLogout() {
  if (window.supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  handleCustomerSessionLoggedOut();
  showToast("Logged out successfully.");
}

async function syncCustomerCartOnLogin(userId) {
  try {
    if (!window.supabaseClient) return;
    const { data } = await supabaseClient
      .from("customer_carts")
      .select("cart_data")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && Array.isArray(data.cart_data) && data.cart_data.length > 0) {
      data.cart_data.forEach(cloudItem => {
        const local = cart.find(c => String(c.id) === String(cloudItem.id) && c.size === cloudItem.size && c.color === cloudItem.color);
        if (local) {
          local.qty = Math.max(local.qty, cloudItem.qty);
        } else {
          cart.push(cloudItem);
        }
      });
      updateBagDisplay();
    }
  } catch (err) {
    console.warn("Cart sync note:", err);
  }
}

function triggerCloudCartSync() {
  if (!currentCustomer || !window.supabaseClient) return;
  try {
    supabaseClient.from("customer_carts").upsert({
      user_id: currentCustomer.id,
      cart_data: cart,
      updated_at: new Date().toISOString()
    }).then();
  } catch(e) {}
}

async function loadCustomerProfile(userId) {
  try {
    if (!window.supabaseClient) return;
    const { data } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      if (document.getElementById("accFullName")) document.getElementById("accFullName").value = data.full_name || "";
      if (document.getElementById("accPhone")) document.getElementById("accPhone").value = data.phone || "";
      if (document.getElementById("accAddress")) document.getElementById("accAddress").value = data.address_line1 || "";
      if (document.getElementById("accLandmark")) document.getElementById("accLandmark").value = data.landmark || "";
      if (document.getElementById("accPincode")) document.getElementById("accPincode").value = data.pincode || "";

      // Also pre-fill Bag Drawer fields
      if (document.getElementById("custName") && !document.getElementById("custName").value) {
        document.getElementById("custName").value = data.full_name || "";
      }
      if (document.getElementById("custPhone") && !document.getElementById("custPhone").value) {
        document.getElementById("custPhone").value = data.phone || "";
      }
      const addrEl = document.getElementById("custAddr1") || document.getElementById("custAddress");
      if (addrEl && !addrEl.value) {
        addrEl.value = data.address_line1 || "";
      }
      if (document.getElementById("custNearby") && !document.getElementById("custNearby").value) {
        document.getElementById("custNearby").value = data.landmark || "";
      }
      if (document.getElementById("custPincode") && !document.getElementById("custPincode").value) {
        document.getElementById("custPincode").value = data.pincode || "";
      }
    }
  } catch(err) {
    console.warn("Customer profile load note:", err);
  }
}

async function handleSaveCustomerAddress(e) {
  e.preventDefault();
  if (!currentCustomer || !window.supabaseClient) return;

  const fullName = (document.getElementById("accFullName")?.value || "").trim();
  const phone = (document.getElementById("accPhone")?.value || "").trim();
  const address = (document.getElementById("accAddress")?.value || "").trim();
  const landmark = (document.getElementById("accLandmark")?.value || "").trim();
  const pincode = (document.getElementById("accPincode")?.value || "").trim();

  const btn = document.getElementById("btnSaveAddress");
  if (btn) btn.textContent = "Saving...";

  try {
    const { error } = await supabaseClient.from("profiles").upsert({
      id: currentCustomer.id,
      full_name: fullName,
      phone: phone,
      address_line1: address,
      landmark: landmark,
      pincode: pincode,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    showToast("Delivery address saved successfully!");

    // Also update bag inputs
    if (document.getElementById("custName")) document.getElementById("custName").value = fullName;
    if (document.getElementById("custPhone")) document.getElementById("custPhone").value = phone;
    const addrEl = document.getElementById("custAddr1") || document.getElementById("custAddress");
    if (addrEl) addrEl.value = address;
    if (document.getElementById("custNearby")) document.getElementById("custNearby").value = landmark;
    if (document.getElementById("custPincode")) document.getElementById("custPincode").value = pincode;
  } catch (err) {
    alert("Could not save address: " + err.message);
  } finally {
    if (btn) btn.textContent = "Save Delivery Details";
  }
}

async function loadCustomerOrders(userId) {
  const container = document.getElementById("customerOrdersList");
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:25px; color:var(--muted); font-size:0.85rem;">Loading your orders...</div>`;

  try {
    if (!window.supabaseClient) throw new Error("No client");
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:35px 10px; color:var(--muted);">
          <div style="font-size:1.8rem; margin-bottom:6px;">📦</div>
          <div style="font-weight:600; font-size:0.95rem; color:var(--noir);">No orders placed yet</div>
          <div style="font-size:0.78rem; margin-top:4px;">When you place an order via WhatsApp, it will appear here.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = data.map(o => {
      const itemsList = Array.isArray(o.items) ? o.items : [];
      const dateStr = new Date(o.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

      return `
        <div style="background:#FFF; border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:700; font-size:0.85rem; color:var(--noir);">${o.order_id || 'Order'}</span>
            <span style="font-size:0.7rem; background:#E8F5E9; color:#2E7D32; font-weight:700; padding:2px 8px; border-radius:10px;">${o.order_status || 'Confirmed'}</span>
          </div>
          <div style="font-size:0.75rem; color:var(--muted); margin-bottom:8px;">Placed on ${dateStr} • ${o.payment_method || 'UPI'}</div>
          <div style="font-size:0.8rem; border-top:1px dashed var(--border); padding-top:8px;">
            ${itemsList.map(it => `<div>• <strong>${it.title || 'Piece'}</strong> (${it.color || ''} / ${it.size || ''}) × ${it.qty || 1}</div>`).join("")}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px solid var(--border);">
            <span style="font-size:0.8rem; color:var(--muted);">Total:</span>
            <span style="font-weight:700; font-size:0.95rem;">${CURRENCY}${Number(o.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;
    }).join("");
  } catch(err) {
    container.innerHTML = `
      <div style="text-align:center; padding:20px; color:var(--muted); font-size:0.8rem;">
        <div>Check your order status directly on WhatsApp.</div>
        <button class="btn btn-dark btn-sm" style="margin-top:8px;" onclick="openGeneralChatWhatsApp()">Chat on WhatsApp</button>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// 13. INITIALIZATION ON DOM READY
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderGhostSkeletons();
  initCustomerAuth();
  loadStoreSettings();
  loadCouponsFromDb();
  loadProductsFromSupabase();

  if (window.lucide) window.lucide.createIcons();
});
