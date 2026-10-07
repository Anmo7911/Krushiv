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
const WHATSAPP_PHONE = window.ZAYA_WHATSAPP_PHONE || "919876543210";
const CURRENCY = "₹";
const COD_FEE = 50;

// High-resolution curated editorial hero banners
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
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Blush Rose", hex: "#E8C5C8" },
      { name: "Sage Green", hex: "#8A9A86" }
    ],
    specs: ["Pure Handwoven Chanderi Silk Fabric", "Organza Dupatta with Scalloped Borders", "Dry Clean Recommended"],
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
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Emerald Green", hex: "#1C4E3D" },
      { name: "Champagne Gold", hex: "#EAD6B8" }
    ],
    specs: ["Heavyweight Luxe Satin Crepe Fabric", "Flattering Bias-Cut Silhouette", "Dry Clean Only"],
    is_featured: true
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
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Terracotta", hex: "#B85D43" },
      { name: "Olive Khaki", hex: "#636B46" }
    ],
    specs: ["Handcrafted Linen-Cotton Blend Fabric", "Tailored Relaxed-Fit Blazer", "Dry Clean Only"],
    is_featured: true
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
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
    ],
    colors: [
      { name: "Royal Wine", hex: "#581825" },
      { name: "Mustard Gold", hex: "#D4A017" }
    ],
    specs: ["100% Pure Katan Silk Handloom Weaving", "Includes Unstitched Blouse Piece", "Dry Clean Strictly"],
    is_featured: true
  }
];

let heroBannerImages = [...DEFAULT_HERO_BANNERS];
let products = [...DEFAULT_PRODUCTS];
let currentCategory = "All";
let cart = [];
let appliedCoupon = null;
let selectedPayment = "UPI";
let currentProduct = null;
let currentSize = "S";
let currentColor = null;
let currentHeroBannerIndex = 0;
let heroBannerTimer = null;

// -------------------------------------------------------------
// 2. HERO CAROUSEL CONTROLLER
// -------------------------------------------------------------
function formatDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim().replace(/^['"]|['"]$/g, '');
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return 'https://drive.google.com/uc?export=view&id=' + match[1];
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
    '<div class="hero-edge-slide-box" id="heroEdgeBox" onclick="scrollSmoothToProducts()">' +
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
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

// -------------------------------------------------------------
// 3. CATALOG & PRODUCT DETAILS (SAFE VIEW SWITCHING)
// -------------------------------------------------------------
async function loadProductsFromSupabase() {
  try {
    if (window.supabaseClient) {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
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
            reviews: p.reviews ? Number(p.reviews) : 120,
            bought_this_month: p.bought_this_month || "300+ sold this month",
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop'],
            colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: "Standard", hex: "#12100F" }],
            specs: Array.isArray(p.specs) && p.specs.length > 0 ? p.specs : ["Pure Breathable Fabric", "Artisanal Handcraft", "Gentle Dry Clean Only"],
            is_featured: !!p.is_featured
          }));
        }
      }
    }
  } catch (err) {
    console.warn("Supabase products note:", err);
  }

  if (!products || products.length === 0) {
    products = [...DEFAULT_PRODUCTS];
  }

  renderCatalog();
}

function openHomeView() {
  const catalog = document.getElementById("catalogView") || document.getElementById("homeView");
  const pdp = document.getElementById("pdpView");
  if (pdp) pdp.classList.remove("active");
  if (catalog) catalog.classList.add("active");
  document.body.classList.remove("pdp-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showProductDetails(id) {
  const item = products.find(p => String(p.id) === String(id));
  if (!item) return;

  currentProduct = item;
  currentColor = (item.colors && item.colors.length > 0) ? item.colors[0].name : "Standard";

  const catEl = document.getElementById("pdpCatName");
  if (catEl) catEl.textContent = item.category;

  const titleEl = document.getElementById("pdpItemTitle");
  if (titleEl) titleEl.textContent = item.title;

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

  // Peek Slider
  const track = document.getElementById("pdpPeekSlider") || document.getElementById("pdpSliderTrack");
  const dotsContainer = document.getElementById("pdpSliderDots") || document.getElementById("pdpDotsContainer");
  const imgs = (item.images && item.images.length > 0) ? item.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop'];

  if (track) {
    track.innerHTML = imgs.map(url => `
      <div class="pdp-peek-slide pdp-slide">
        <img src="${url}" alt="${item.title}">
      </div>
    `).join("");
  }
  if (dotsContainer) {
    dotsContainer.innerHTML = imgs.map((_, i) => `
      <span class="pdp-dot ${i === 0 ? 'active' : ''}" onclick="scrollPdpSlide(${i})"></span>
    `).join("");
  }

  // Switch view safely
  const catalog = document.getElementById("catalogView") || document.getElementById("homeView");
  const pdp = document.getElementById("pdpView");
  if (catalog) catalog.classList.remove("active");
  if (pdp) pdp.classList.add("active");
  document.body.classList.add("pdp-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------------------------------------------
// 4. ACTION HANDLERS
// -------------------------------------------------------------
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

function closeTrackModalDirect() {
  const m = document.getElementById("trackModal");
  if (m) m.classList.remove("active");
}

function closeLegalModalDirect() {
  const m = document.getElementById("legalModal");
  if (m) m.classList.remove("active");
}

// Initialization on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  renderGhostSkeletons();
  loadStoreSettings();
  loadCouponsFromDb();
  loadProductsFromSupabase();
  if (window.lucide) window.lucide.createIcons();
});
