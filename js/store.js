// js/store.js - KRUSHIV ATELIER

// 1. STORE CONFIGURATION
const WHATSAPP_PHONE = "919876543210"; // Enter your WhatsApp phone number with country code
const CURRENCY = "₹";
const COD_FEE = 50;

// DYNAMIC CONFIG & COUPONS FROM SUPABASE
let activeCoupons = {};
let blockedCodPincodes = [];
let countdownTimerInterval = null;
let featuredAutoTimer = null;
let currentFeaturedIndex = 0;
let featuredProductsList = [];

// REVIEWS
const customerReviews = [
{ name: "Priya S.", city: "Delhi", stars: "★★★★★", text: "Got this for clg farewell last week.. fabric is pure mulmul not transparent at all. 10/10 fit for me" },
{ name: "Ananya Mehta", city: "Mumbai", stars: "★★★★★", text: "delivered in 3 days in malad. colour is slightly darker thn pic but looks v pretty after wearing ❤️" },
{ name: "Sneha P.", city: "Ahmedabad", stars: "★★★★★", text: "3xl size milna muskil hota h usually but this suit fits so comfortably at bust!! thnx zaya team" },
{ name: "Ritu K.", city: "Kolkata", stars: "★★★★★", text: "honestly was scared to order from insta ad but quality is legit good.. ordered L size fits perfect" },
{ name: "Kavita R.", city: "Bangalore", stars: "★★★★★", text: "kurti ka kapda bhot acha hai, washed once no color bleeding at all. totally worth 2.5k" },
{ name: "Meera D.", city: "Pune", stars: "★★★★★", text: "waist was slightly loose for me but mom adjusted it.. looking very classy & direct whatsapp pe tracking mil gayi thi!" },
{ name: "Tanya G.", city: "Noida", stars: "★★★★★", text: "satin slip dress is pure love yar.. wore it to my frnd bday party got so many compliments haha" },
{ name: "Aarti B.", city: "Lucknow", stars: "★★★★★", text: "exchange process was super fast whatsapp pe msg kiya next day pickup ho gaya tha.. thnx!" }
];

// APP STATE
let products = [];
let currentCategory = "All";
let cart = [];
let appliedCoupon = null;
let selectedPayment = "UPI";
let currentProduct = null;
let currentSize = "S";
let currentColor = null;
let carouselTimers = {};
let toastTimer = null;

// USER AUTHENTICATION & CUSTOMER STATE
let currentUser = null;
let savedAddresses = [];
let userOrders = [];

// -------------------------------------------------------------
// DETERMINISTIC SOCIAL PROOF HELPERS (CONSISTENT NUMBERS)
// -------------------------------------------------------------
function getDeterministicReviews(idStr) {
let hash = 0;
for (let i = 0; i < idStr.length; i++) {
hash = (hash << 5) - hash + idStr.charCodeAt(i);
hash |= 0;
}
return 85 + Math.abs(hash % 265); // 85 to 350 reviews
}

function getDeterministicSold(idStr) {
let hash = 0;
for (let i = 0; i < idStr.length; i++) {
hash = (hash << 3) - hash + idStr.charCodeAt(i);
hash |= 0;
}
return 180 + Math.abs(hash % 420); // 180 to 600 sold
}

// -------------------------------------------------------------
// 2. FETCH STORE SETTINGS, TIMER, COUPONS & PRODUCTS
// -------------------------------------------------------------
async function initStore() {
renderGhostSkeletons();
loadStoreSettings();
loadCouponsFromDb();
loadProductsFromSupabase();
setupPincodeListener();
initAuth();
}

// A2. GHOST / SKELETON PRODUCT PATTERN LOADING
function renderGhostSkeletons() {
const grid = document.getElementById("productGrid");
if (!grid) return;

const skeletonHtml = Array(6).fill(0).map(() => `
<div class="skeleton-card">
<div class="skeleton-box skeleton-img"></div>
<div class="skeleton-info">
<div class="skeleton-box skeleton-line-sm"></div>
<div class="skeleton-box skeleton-line-title"></div>
<div class="skeleton-box skeleton-line-price"></div>
<div class="skeleton-box skeleton-btn"></div>
</div>
</div>
`).join("");

grid.innerHTML = skeletonHtml;
}

let heroBannerImages = [];
let heroBannerTimer = null;
let currentHeroBannerIndex = 0;
let topBarMessages = [];
let currentTopBarIndex = 0;
let topBarCrossfadeTimer = null;

async function loadStoreSettings() {
try {
const { data } = await supabaseClient
.from("store_settings")
.select("*");

let topText = "Festive Pret Collection. Easy Doorstep Exchange. Use Code FESTIVE20 for 20% Off";
let countdownEnd = null;

if (data) {
data.forEach(item => {
if (item.key === "top_bar_text" && item.value) topText = item.value;
if (item.key === "countdown_end") countdownEnd = item.value;
if (item.key === "hero_banners") {
try { heroBannerImages = JSON.parse(item.value || "[]"); } catch(e) {}
}
if (item.key === "blocked_cod_pincodes") {
try { blockedCodPincodes = JSON.parse(item.value || "[]"); } catch(e) {}
}
});
}

setupTopBarCrossfade(topText);
if (countdownEnd) startCountdownTimer(countdownEnd);
renderHeroBannerCarousel();
} catch (e) {
console.warn("Using default settings", e);
}
}

// TOP BANNER CROSSFADE ON FULL STOPS
function setupTopBarCrossfade(rawText) {
const bar = document.querySelector(".top-bar");
if (!bar) return;

let parts = rawText.split(/[.]+/).map(p => p.trim()).filter(p => p.length > 0);
if (parts.length <= 1) {
parts = rawText.split(/[•]+/).map(p => p.trim()).filter(p => p.length > 0);
}
topBarMessages = parts.length > 0 ? parts : [rawText];
currentTopBarIndex = 0;

bar.innerHTML = '<span class="top-bar-crossfade-text" id="topBarTextEl">' + topBarMessages[0] + '</span><span id="topBarTimerBadge" style="margin-left:8px; background:#A86B58; padding:2px 7px; border-radius:4px; font-weight:700; display:inline-block;"></span>';

if (topBarCrossfadeTimer) clearInterval(topBarCrossfadeTimer);
if (topBarMessages.length > 1) {
topBarCrossfadeTimer = setInterval(() => {
const textEl = document.getElementById("topBarTextEl");
if (!textEl) return;
textEl.classList.add("fade-out");
setTimeout(() => {
currentTopBarIndex = (currentTopBarIndex + 1) % topBarMessages.length;
textEl.innerHTML = topBarMessages[currentTopBarIndex];
textEl.classList.remove("fade-out");
}, 500);
}, 4500);
}
}

// E. ANNOUNCEMENT BAR COUNTDOWN TIMER
function startCountdownTimer(endTimeStr) {
if (!endTimeStr) return;
const targetDate = new Date(endTimeStr).getTime();
if (isNaN(targetDate)) return;

if (countdownTimerInterval) clearInterval(countdownTimerInterval);

function update() {
const now = Date.now();
const diff = targetDate - now;
const badge = document.getElementById("topBarTimerBadge");
if (!badge) return;

if (diff <= 0) {
badge.textContent = "SALE ENDED";
clearInterval(countdownTimerInterval);
return;
}

const days = Math.floor(diff / (1000 * 60 * 60 * 24));
const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
const secs = Math.floor((diff % (1000 * 60)) / 1000);

const pad = n => String(n).padStart(2, '0');
if (days > 0) {
badge.textContent = "⏳ Ends in " + days + "d " + pad(hours) + "h " + pad(mins) + "m";
} else {
badge.textContent = "⚡ Ends in " + pad(hours) + ":" + pad(mins) + ":" + pad(secs);
}
}

update();
countdownTimerInterval = setInterval(update, 1000);
}

// -------------------------------------------------------------
// A1. EDGE-TO-EDGE HERO BANNER CAROUSEL (TOUCHES BOTH BORDERS)
// -------------------------------------------------------------
function renderHeroBannerCarousel() {
const container = document.getElementById("featuredCarouselContainer");
if (!container) return;

if (heroBannerTimer) clearInterval(heroBannerTimer);

// If no banner links set in admin, leave completely blank as requested
if (!heroBannerImages || heroBannerImages.length === 0) {
container.innerHTML = "";
return;
}

currentHeroBannerIndex = 0;

let dotsHtml = "";
if (heroBannerImages.length > 1) {
dotsHtml = '<div class="hero-edge-dots" id="heroEdgeDots">' +
heroBannerImages.map((_, i) => '<span class="h-dot ' + (i === 0 ? 'active' : '') + '" onclick="event.stopPropagation(); setHeroBannerIndex(' + i + ')"></span>').join("") +
'</div>';
}

container.innerHTML = '<div class="hero-edge-wrap fade-up-init">' +
'<div class="hero-edge-slide-box" id="heroEdgeBox" onclick="handleHeroBannerClick()" style="background-image: url(\'' + heroBannerImages[0] + '\');">' +
'<div class="hero-edge-scrim"></div>' +
'<div class="hero-explore-pill-wrap">' +
'<button class="btn-hero-explore-pill" onclick="event.stopPropagation(); scrollSmoothToProducts()">' +
'<span>Explore</span>' +
'<i data-lucide="arrow-down" style="width:12px; height:12px;"></i>' +
'</button>' +
'</div>' +
dotsHtml +
'</div>' +
'</div>';

if (window.lucide) window.lucide.createIcons();

if (heroBannerImages.length > 1) {
heroBannerTimer = setInterval(() => {
setHeroBannerIndex((currentHeroBannerIndex + 1) % heroBannerImages.length);
}, 4500);
}
}

function handleHeroBannerClick() {
if (currentHeroBannerIndex === 0) {
scrollSmoothToProducts();
} else {
setHeroBannerIndex((currentHeroBannerIndex + 1) % heroBannerImages.length);
}
}

function setHeroBannerIndex(index) {
if (!heroBannerImages || heroBannerImages.length <= 1) return;
currentHeroBannerIndex = index;
const box = document.getElementById("heroEdgeBox");
const dots = document.querySelectorAll("#heroEdgeDots .h-dot");

if (box) {
box.style.opacity = "0.2";
setTimeout(() => {
box.style.backgroundImage = "url('" + heroBannerImages[currentHeroBannerIndex] + "')";
box.style.opacity = "1";
}, 250);
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

async function loadCouponsFromDb() {
try {
const { data } = await supabaseClient
.from("coupons")
.select("*")
.eq("is_active", true);

if (data && data.length > 0) {
activeCoupons = {};
data.forEach(c => {
activeCoupons[c.code] = {
type: c.type,
val: Number(c.val),
min: Number(c.min_order || 0),
desc: c.description || (c.type === 'percent' ? `${c.val}% OFF` : `₹${c.val} OFF`)
};
});

renderCouponPills();
}
} catch (e) {
console.warn("Could not load coupons from DB, using defaults");
}
}

function renderCouponPills() {
const container = document.querySelector(".pills-group");
if (!container) return;

const codes = Object.keys(activeCoupons);
if (codes.length === 0) return;

container.innerHTML = codes.map(code => {
const rule = activeCoupons[code];
return `<span class="chip-code" onclick="quickCoupon('${code}')">${code} (${rule.desc})</span>`;
}).join("");
}

async function loadProductsFromSupabase() {
try {
const { data, error } = await supabaseClient
.from('products')
.select('*')
.eq('is_active', true)
.order('created_at', { ascending: false });

if (error) throw error;

products = (data || []).map(p => {
let sizesStock = { S: true, M: true, L: true, XL: true, XXL: true, "3XL": true };
try {
if (p.sizes_stock) {
sizesStock = typeof p.sizes_stock === "string" ? JSON.parse(p.sizes_stock) : p.sizes_stock;
}
} catch(e) {}

const detReviews = getDeterministicReviews(p.id || p.title);
const detSold = getDeterministicSold(p.id || p.title);

return {
...p,
price: Number(p.price),
mrp: Number(p.mrp),
rating: p.rating || "4.9",
reviews: p.reviews && p.reviews !== "0" ? p.reviews : String(detReviews),
bought_this_month: p.bought_this_month || `${detSold}+ sold this month`,
stock_qty: (p.stock_qty !== undefined && p.stock_qty !== null) ? Number(p.stock_qty) : 10,
sizes_stock: sizesStock,
images: Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'),
colors: Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors || '[]'),
specs: Array.isArray(p.specs) ? p.specs : JSON.parse(p.specs || '[]')
};
});

renderCatalog();
handleUrlRouting();
} catch (err) {
console.error("Error fetching products:", err);
const grid = document.getElementById("productGrid");
if (grid) {
grid.innerHTML = `
<div class="empty-grid-msg">
<div style="font-size: 1.5rem; margin-bottom: 6px;">⚠️</div>
<div>Unable to load products right now.</div>
<div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">Please check your Supabase connection.</div>
</div>
`;
}
}
}

// -------------------------------------------------------------
// 3. SLUG & TOKEN URL ROUTING
// -------------------------------------------------------------
function handleUrlRouting() {
const urlParams = new URLSearchParams(window.location.search);
const slugParam = urlParams.get('p') || urlParams.get('slug');
const tokenParam = urlParams.get('token');

if (tokenParam) {
const match = products.find(p => p.token === tokenParam);
if (match) {
showProductDetails(match.id);
return;
}
}

if (slugParam) {
const match = products.find(p => p.slug === slugParam);
if (match) {
showProductDetails(match.id);
return;
}
}

if (window.location.hash.startsWith('#item-')) {
const id = window.location.hash.replace('#item-', '');
const match = products.find(p => p.id === id);
if (match) showProductDetails(match.id);
}
}

// -------------------------------------------------------------
// 4. ANIMATION OBSERVER
// -------------------------------------------------------------
function setupScrollObserver() {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('fade-up-in');
observer.unobserve(entry.target);
}
});
}, { threshold: 0.08 });

document.querySelectorAll('.fade-up-init').forEach(el => observer.observe(el));
}

// -------------------------------------------------------------
// 5. RENDER CATALOG (INLINE RATING IN GREEN & SOLD COUNT)
// -------------------------------------------------------------
function renderCatalog() {
Object.values(carouselTimers).forEach(timer => {
clearTimeout(timer.timeout);
clearInterval(timer.interval);
});
carouselTimers = {};

const list = currentCategory === "All"
? products
: products.filter(p => p.category === currentCategory);

const grid = document.getElementById("productGrid");

if (list.length === 0) {
grid.innerHTML = `
<div class="empty-grid-msg">
<div style="font-size: 2rem; margin-bottom: 8px;">✨</div>
<div style="font-size: 0.95rem; font-weight: 600;">No pieces in this collection yet.</div>
<div style="font-size: 0.8rem; margin-top: 4px;">Add items from the Admin Portal to display them here.</div>
</div>
`;
return;
}

grid.innerHTML = list.map(item => {
const offPct = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
const firstImg = item.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&h=933&q=80';

const isOutOfStock = item.stock_qty <= 0;
const isLowStock = !isOutOfStock && item.stock_qty <= 5;

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

<div class="carousel-dots" id="dots-${item.id}">
${item.images.map((_, i) => `<span class="c-dot ${i === 0 ? 'active' : ''}"></span>`).join("")}
</div>
</div>

<div class="prod-info">
<!-- INLINE GREEN RATING & SOLD THIS MONTH -->
<div class="rating-sold-inline">
<span class="rating-badge-green">
<span>★</span>
<span>${item.rating}</span>
</span>
<span class="rating-reviews-count">(${item.reviews})</span>
<span class="inline-sold-badge">🔥 ${item.bought_this_month}</span>
</div>

<span class="prod-cat">${item.category}</span>
<h3 class="prod-name" title="${item.title}">${item.title}</h3>

<div class="prod-price-row">
<span class="val-sale">${CURRENCY}${item.price.toLocaleString('en-IN')}</span>
${item.mrp > item.price ? `<span class="val-mrp">${CURRENCY}${item.mrp.toLocaleString('en-IN')}</span>` : ''}
${offPct > 0 ? `<span class="val-off">${offPct}% OFF</span>` : ''}
</div>

<button class="btn-add-cart-single" onclick="showProductDetails('${item.id}')" style="${isOutOfStock ? 'background:#666; border-color:#666;' : ''}">
${isOutOfStock ? 'View (Sold Out)' : 'Add to Cart'}
</button>
</div>
</article>
`;
}).join("");

const durations = [3200, 4200, 3600, 4800, 3900, 5200];
list.forEach((item, index) => {
if (item.images.length > 1) {
const delay = 600 + (index * 500);
const speed = durations[index % durations.length];
startStaggeredCardSlide(item.id, item.images.length, delay, speed);
}
});

setupScrollObserver();
}

function startStaggeredCardSlide(id, count, startDelay, cycleSpeed) {
if (count <= 1) return;
let activeIndex = 0;
const track = document.getElementById(`track-${id}`);
const dotsContainer = document.getElementById(`dots-${id}`);

const timeoutId = setTimeout(() => {
const intervalId = setInterval(() => {
activeIndex = (activeIndex + 1) % count;
if (track) {
track.style.transform = `translateX(-${activeIndex * 100}%)`;
}
if (dotsContainer) {
const dots = dotsContainer.querySelectorAll(".c-dot");
dots.forEach((d, i) => d.classList.toggle("active", i === activeIndex));
}
}, cycleSpeed);

carouselTimers[id] = { interval: intervalId, timeout: null };
}, startDelay);

carouselTimers[id] = { timeout: timeoutId, interval: null };
}

// -------------------------------------------------------------
// 6. CATEGORIES
// -------------------------------------------------------------
function setCategory(cat) {
currentCategory = cat;
document.querySelectorAll(".cat-pill").forEach(btn => {
btn.classList.toggle("active", btn.textContent.includes(cat) || (cat === "All" && btn.textContent.includes("All")));
});
renderCatalog();
}

// -------------------------------------------------------------
// 7. PRODUCT DETAILS PAGE (PDP)
// -------------------------------------------------------------
function showProductDetails(id) {
const item = products.find(p => p.id === id);
if (!item) return;

currentProduct = item;
currentColor = (item.colors && item.colors.length > 0) ? item.colors[0].name : "Standard";

document.getElementById("pdpCatName").textContent = item.category;
document.getElementById("pdpItemTitle").textContent = item.title;

document.getElementById("pdpRatingStars").textContent = `★ ${item.rating || '4.9'}`;
document.getElementById("pdpRatingReviews").textContent = `(${item.reviews || '0'} Reviews)`;

const boughtElem = document.getElementById("pdpBoughtStats");
if (item.stock_qty <= 0) {
boughtElem.textContent = "❌ Out of Stock";
boughtElem.style.background = "#FEE2E2";
boughtElem.style.color = "#B91C1C";
boughtElem.style.display = "inline-block";
} else if (item.stock_qty <= 5) {
boughtElem.textContent = `🔥 Only ${item.stock_qty} pieces left in stock — selling fast!`;
boughtElem.style.background = "#FEF3C7";
boughtElem.style.color = "#B45309";
boughtElem.style.display = "inline-block";
} else if (item.bought_this_month) {
boughtElem.textContent = `🔥 ${item.bought_this_month}`;
boughtElem.style.background = "#FEF3C7";
boughtElem.style.color = "#B45309";
boughtElem.style.display = "inline-block";
} else {
boughtElem.style.display = "none";
}

document.getElementById("pdpPriceVal").textContent = `${CURRENCY}${item.price.toLocaleString('en-IN')}`;
document.getElementById("pdpMrpVal").textContent = item.mrp > item.price ? `${CURRENCY}${item.mrp.toLocaleString('en-IN')}` : '';

const offPct = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
const offElem = document.getElementById("pdpOffVal");
if (offPct > 0) {
offElem.textContent = `${offPct}% OFF`;
offElem.style.display = "inline-block";
} else {
offElem.style.display = "none";
}

const peekSlider = document.getElementById("pdpPeekSlider");
const dotsContainer = document.getElementById("pdpSliderDots");
const displayImages = item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&h=933&q=80'];

peekSlider.innerHTML = displayImages.map(img => `
<div class="pdp-peek-slide">
<img src="${img}" alt="${item.title}">
</div>
`).join("");
peekSlider.scrollLeft = 0;

if (dotsContainer) {
dotsContainer.innerHTML = displayImages.map((_, i) => `
<span class="pdp-dot ${i === 0 ? 'active' : ''}" onclick="jumpPdpSlide(${i})"></span>
`).join("");
}

peekSlider.onscroll = () => {
const slideWidth = peekSlider.offsetWidth * 0.9;
const activeDot = Math.round(peekSlider.scrollLeft / slideWidth);
document.querySelectorAll("#pdpSliderDots .pdp-dot").forEach((d, i) => {
d.classList.toggle("active", i === activeDot);
});
};

// Colors
const colorGroup = document.getElementById("pdpColorsGroup");
document.getElementById("pdpSelectedColorName").textContent = currentColor;
if (item.colors && item.colors.length > 0) {
colorGroup.parentElement.style.display = "block";
colorGroup.innerHTML = item.colors.map((c, idx) => `
<button
class="color-swatch-btn ${idx === 0 ? 'selected' : ''}"
style="background-color: ${c.hex};"
title="${c.name}"
onclick="pickPdpColor('${c.name}', this)">
</button>
`).join("");
} else {
colorGroup.parentElement.style.display = "none";
}

renderSizeSelectors(item);

// Specs
const specsList = document.getElementById("pdpSpecsList");
if (item.specs && item.specs.length > 0) {
specsList.innerHTML = item.specs.map(spec => `
<li><span class="spec-bullet">✓</span> ${spec}</li>
`).join("");
} else {
specsList.innerHTML = `<li><span class="spec-bullet">✓</span> Pure designer artisanal cut and tailored silhouette.</li>`;
}

document.querySelectorAll(".accordion-content").forEach(el => el.style.display = "none");
document.querySelectorAll(".acc-toggle-icon").forEach(el => {
el.textContent = "+";
el.style.transform = "rotate(0deg)";
});

renderReviewsMarquee();
renderSimilarProducts(item);

updatePdpActionButtons(item);

document.getElementById("catalogView").classList.remove("active");
document.getElementById("pdpView").classList.add("active");
document.body.classList.add("pdp-active");
window.scrollTo({ top: 0, behavior: "smooth" });

if (window.lucide) window.lucide.createIcons();

if (item.slug) {
window.history.pushState({}, "", `?p=${item.slug}`);
}
}

function jumpPdpSlide(idx) {
const peekSlider = document.getElementById("pdpPeekSlider");
if (!peekSlider) return;
const slideWidth = peekSlider.offsetWidth * 0.9;
peekSlider.scrollTo({
left: idx * slideWidth,
behavior: "smooth"
});
}

function renderSizeSelectors(item) {
const sizesGroup = document.getElementById("pdpSizesGroup");
if (!sizesGroup) return;

const allSizes = ["S", "M", "L", "XL", "XXL", "3XL"];
const stockMap = item.sizes_stock || {};

const firstAvailable = allSizes.find(sz => stockMap[sz] !== false && item.stock_qty > 0) || "S";
currentSize = firstAvailable;

sizesGroup.innerHTML = allSizes.map(sz => {
const isAvail = (stockMap[sz] !== false) && item.stock_qty > 0;
const isSelected = sz === currentSize;

return `
<button
class="size-btn-pill ${isSelected ? 'selected' : ''} ${!isAvail ? 'out-of-stock-pill' : ''}"
style="${!isAvail ? 'opacity: 0.45; text-decoration: line-through; background: #FAF7F2; cursor: not-allowed;' : ''}"
onclick="handleSizeClick('${sz}', ${isAvail})">
${sz}
</button>
`;
}).join("");
}

function handleSizeClick(sz, isAvail) {
if (!isAvail) {
showToast(`Size ${sz} is currently out of stock. You can still order via WhatsApp!`);
return;
}
pickPdpSize(sz);
}

function pickPdpSize(sz) {
currentSize = sz;
document.querySelectorAll(".size-btn-pill").forEach(b => {
if (!b.classList.contains("out-of-stock-pill")) {
b.classList.toggle("selected", b.textContent.trim() === sz);
}
});
}

function updatePdpActionButtons(item) {
const isOutOfStock = item.stock_qty <= 0;
const bagBtns = document.querySelectorAll(".btn-action-bag, .btn-sticky-bag");
const orderBtns = document.querySelectorAll(".btn-action-order, .btn-sticky-order");

bagBtns.forEach(btn => {
if (isOutOfStock) {
btn.style.opacity = "0.5";
btn.disabled = true;
btn.textContent = "Sold Out";
} else {
btn.style.opacity = "1";
btn.disabled = false;
btn.textContent = "🛍️ Add to Bag";
}
});

orderBtns.forEach(btn => {
if (isOutOfStock) {
btn.textContent = "💬 Request Restock on WhatsApp";
btn.onclick = () => requestRestockOnWhatsApp(item);
} else {
btn.textContent = "⚡ Order Now";
btn.onclick = () => addCurrentPdp(true);
}
});
}

function requestRestockOnWhatsApp(item) {
const msg = `Hi KRUSHIV Team, I would like to request a restock/custom order for:\n*${item.title}*\nCode: ${item.id}\nColor: ${currentColor}\nSize: ${currentSize}\nPlease let me know when it will be available!`;
const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
window.open(waUrl, "_blank");
}

function togglePdpAccordion(headerElement) {
const content = headerElement.nextElementSibling;
const icon = headerElement.querySelector(".acc-toggle-icon");
const isOpen = content.style.display === "block";

if (isOpen) {
content.style.display = "none";
icon.textContent = "+";
icon.style.transform = "rotate(0deg)";
} else {
content.style.display = "block";
icon.textContent = "−";
icon.style.transform = "rotate(180deg)";
}
}

function pickPdpColor(colorName, btnElement) {
currentColor = colorName;
document.getElementById("pdpSelectedColorName").textContent = colorName;
document.querySelectorAll(".color-swatch-btn").forEach(b => b.classList.remove("selected"));
btnElement.classList.add("selected");
}

function renderReviewsMarquee() {
const track = document.getElementById("reviewsTrack");
const doubleList = [...customerReviews, ...customerReviews];
track.innerHTML = doubleList.map(r => `
<div class="review-bubble">
<div class="review-user-row">
<span class="review-name">${r.name} (${r.city})</span>
<span class="verified-chip">✓ Verified</span>
</div>
<div class="review-stars">${r.stars}</div>
<div class="review-comment">"${r.text}"</div>
</div>
`).join("");
}

function renderSimilarProducts(currentItem) {
const similar = products.filter(p => p.id !== currentItem.id).slice(0, 4);
const grid = document.getElementById("similarGrid");
grid.innerHTML = similar.map(p => `
<div class="prod-card" style="cursor:pointer;" onclick="showProductDetails('${p.id}')">
<div style="aspect-ratio:3/4; overflow:hidden; background:#eae6df;">
<img src="${p.images[0] || ''}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover; object-position:top center;">
</div>
<div style="padding:10px;">
<div style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">${p.category}</div>
<div style="font-size:0.82rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</div>
<div style="font-weight:700; font-size:0.9rem; margin-top:2px;">${CURRENCY}${p.price.toLocaleString('en-IN')}</div>
</div>
</div>
`).join("");
}

function openHomeView() {
document.getElementById("pdpView").classList.remove("active");
document.getElementById("catalogView").classList.add("active");
document.body.classList.remove("pdp-active");
window.history.pushState({}, "", window.location.pathname);
window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("popstate", () => {
handleUrlRouting();
});

// -------------------------------------------------------------
// 8. SIDEBAR & MODALS
// -------------------------------------------------------------
function toggleSidebar(open) {
document.getElementById("mobileSidebar").classList.toggle("open", open);
document.getElementById("sidebarOverlay").classList.toggle("open", open);
document.body.style.overflow = open ? "hidden" : "auto";
if (window.lucide) window.lucide.createIcons();
}

function openTrackModal() {
document.getElementById("trackModal").style.display = "flex";
document.body.style.overflow = "hidden";
}

function closeTrackModalDirect() {
document.getElementById("trackModal").style.display = "none";
document.body.style.overflow = "auto";
}

function closeTrackModal(e) {
if (e.target.id === "trackModal") closeTrackModalDirect();
}

function submitTrackingInquiry() {
const val = document.getElementById("trackInput").value.trim();
if (!val) {
alert("Please enter your Phone Number or Order Code.");
return;
}
const msg = `Hi KRUSHIV Team, I would like to track my order for Mobile/Order Code: ${val}. Please share the current dispatch & delivery status.`;
const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
window.open(waUrl, "_blank");
closeTrackModalDirect();
}

const legalContent = {
privacy: {
title: "Privacy Policy",
body: "At KRUSHIV, we are dedicated to protecting your personal data. We strictly use your name, shipping address, and phone number solely to prepare and fulfill your boutique orders via WhatsApp. We never sell, lease, or monetize your contact information with external marketing agencies."
},
terms: {
title: "Terms & Conditions",
body: "By shopping on KRUSHIV, you agree to our direct order processing terms. Orders placed via WhatsApp receive an official itemized confirmation bill before dispatch. Deliveries are executed via authorized express courier partners across India."
},
exchange: {
title: "Exchange Policy",
body: "We offer an Easy Doorstep Size & Color Exchange. If your outfit needs a different size, simply reach out to us on WhatsApp with your order code. Our courier representative will deliver the fresh size and pick up the exchange piece directly at your doorstep."
},
shipping: {
title: "Shipping & Delivery Policy",
body: "All orders are prepared and dispatched within 24–48 business hours. Prepaid orders via UPI enjoy 100% complimentary free shipping across India. Cash on Delivery (COD) carries a nominal ₹50 courier convenience charge."
},
payment: {
title: "Payment Security",
body: "All digital payments are processed through trusted, encrypted UPI gateways including Google Pay, PhonePe, and Paytm. Your UPI credentials and banking details are never stored on our servers."
}
};

function openLegalModal(type) {
const data = legalContent[type];
if (!data) return;
document.getElementById("legalModalTitle").textContent = data.title;
document.getElementById("legalModalBody").textContent = data.body;
document.getElementById("legalModal").style.display = "flex";
document.body.style.overflow = "hidden";
}

function closeLegalModalDirect() {
document.getElementById("legalModal").style.display = "none";
document.body.style.overflow = "auto";
}

function closeLegalModal(e) {
if (e.target.id === "legalModal") closeLegalModalDirect();
}

// -------------------------------------------------------------
// 9. D. PINCODE & COD SERVICEABILITY CHECKER
// -------------------------------------------------------------
function setupPincodeListener() {
const pincodeInput = document.getElementById("custPincode");
if (!pincodeInput) return;

pincodeInput.addEventListener("input", function() {
const pin = this.value.trim();
checkPincodeServiceability(pin);
});
}

function checkPincodeServiceability(pin) {
let noticeEl = document.getElementById("pincodeNotice");
if (!noticeEl) {
noticeEl = document.createElement("div");
noticeEl.id = "pincodeNotice";
noticeEl.style.fontSize = "0.72rem";
noticeEl.style.fontWeight = "600";
noticeEl.style.marginTop = "4px";
const pincodeInput = document.getElementById("custPincode");
if (pincodeInput && pincodeInput.parentElement) {
pincodeInput.parentElement.appendChild(noticeEl);
}
}

const codCard = document.getElementById("payCardCod");

if (!/^\d{6}$/.test(pin)) {
noticeEl.style.display = "none";
if (codCard) {
codCard.style.opacity = "1";
codCard.style.pointerEvents = "auto";
}
return;
}

const isCodBlocked = blockedCodPincodes.includes(pin);

if (isCodBlocked) {
noticeEl.style.display = "block";
noticeEl.style.color = "#D9534F";
noticeEl.textContent = `⚠️ Pincode ${pin}: Cash on Delivery unavailable. Please choose UPI / Online Payment.`;

if (codCard) {
codCard.style.opacity = "0.4";
codCard.style.pointerEvents = "none";
}
if (selectedPayment === "COD") {
selectPaymentMethod("UPI");
}
} else {
noticeEl.style.display = "block";
noticeEl.style.color = "#2E7D32";
noticeEl.textContent = `✓ Pincode ${pin}: Express doorstep delivery available (3–4 business days).`;

if (codCard) {
codCard.style.opacity = "1";
codCard.style.pointerEvents = "auto";
}
}
}

// -------------------------------------------------------------
// 10. CART & CHECKOUT
// -------------------------------------------------------------
function addCurrentPdp(isDirectOrder) {
if (currentProduct) {
if (currentProduct.stock_qty <= 0) {
requestRestockOnWhatsApp(currentProduct);
return;
}
addToBag(currentProduct, currentSize, currentColor);
if (isDirectOrder) {
toggleBagDrawer(true);
}
}
}

function addToBag(item, size, color) {
const match = cart.find(c => c.id === item.id && c.size === size && c.color === color);
if (match) {
match.qty += 1;
} else {
cart.push({ ...item, size, color, qty: 1 });
}
showToast(`Added: ${item.title} (${color} / ${size})`);
updateBagDisplay();
}

function changeQty(idx, delta) {
cart[idx].qty += delta;
if (cart[idx].qty <= 0) cart.splice(idx, 1);
updateBagDisplay();
}

function toggleBagDrawer(open) {
document.getElementById("bagDrawer").classList.toggle("open", open);
document.getElementById("drawerScrim").classList.toggle("open", open);
document.body.style.overflow = open ? "hidden" : "auto";
if (window.lucide) window.lucide.createIcons();
}

document.getElementById("openBagTrigger").addEventListener("click", () => toggleBagDrawer(true));

function quickCoupon(code) {
document.getElementById("couponInput").value = code;
applyCoupon();
}

function applyCoupon() {
const input = document.getElementById("couponInput");
const code = input.value.trim().toUpperCase();
const status = document.getElementById("couponStatus");
const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

if (!code) {
status.style.color = "#D9534F";
status.textContent = "Please enter a code.";
return;
}

const rule = activeCoupons[code];
if (!rule) {
status.style.color = "#D9534F";
status.textContent = "Invalid or expired code.";
appliedCoupon = null;
updateBagDisplay();
return;
}

if (subtotal < rule.min) {
status.style.color = "#D9534F";
status.textContent = `Requires minimum bag value of ${CURRENCY}${rule.min}.`;
appliedCoupon = null;
updateBagDisplay();
return;
}

appliedCoupon = { code, ...rule };
status.style.color = "#2E7D32";
status.textContent = `✓ Code '${code}' applied! (${rule.desc})`;
updateBagDisplay();
}

function selectPaymentMethod(method) {
selectedPayment = method;
document.getElementById("payCardUpi").classList.toggle("active", method === "UPI");
document.getElementById("payCardCod").classList.toggle("active", method === "COD");
document.querySelector(`input[name="payMethod"][value="${method}"]`).checked = true;
updateBagDisplay();
}

function updateBagDisplay() {
const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
const countBadge = document.getElementById("headerBagCount");
const drawerBadge = document.getElementById("drawerCount");
if (countBadge) countBadge.textContent = totalCount;
if (drawerBadge) drawerBadge.textContent = totalCount;

const realSubtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
document.getElementById("ledgerSubtotal").textContent = `${CURRENCY}${realSubtotal.toLocaleString('en-IN')}`;

let discountAmount = 0;
if (appliedCoupon && realSubtotal > 0) {
discountAmount = appliedCoupon.type === "percent"
? Math.round((realSubtotal * appliedCoupon.val) / 100)
: appliedCoupon.val;
}

const discountRow = document.getElementById("ledgerDiscountRow");
if (discountAmount > 0) {
discountRow.style.display = "flex";
document.getElementById("ledgerDiscountLabel").textContent = `Discount (${appliedCoupon.code}):`;
document.getElementById("ledgerDiscountVal").textContent = `-${CURRENCY}${discountAmount.toLocaleString('en-IN')}`;
} else {
discountRow.style.display = "none";
}

const codExtra = (selectedPayment === "COD" && realSubtotal > 0) ? COD_FEE : 0;
const codRow = document.getElementById("ledgerCodRow");
if (codExtra > 0) {
codRow.style.display = "flex";
} else {
codRow.style.display = "none";
}

const totalPayable = Math.max(0, realSubtotal - discountAmount + codExtra);
document.getElementById("ledgerTotal").textContent = `${CURRENCY}${totalPayable.toLocaleString('en-IN')}`;

const container = document.getElementById("bagItemsContainer");
const footer = document.getElementById("bagFooter");

if (cart.length === 0) {
container.innerHTML = `
<div style="text-align:center; padding: 50px 10px; color: var(--muted);">
<div style="font-size: 2rem; margin-bottom: 6px;">🛍️</div>
<div style="font-size: 0.95rem; font-weight: 600; color: var(--noir);">Your shopping bag is empty</div>
<div style="font-size: 0.8rem; margin-top: 4px;">Explore our pieces and add your favorites.</div>
</div>
`;
footer.style.display = "none";
return;
}

footer.style.display = "block";
container.innerHTML = cart.map((item, idx) => `
<div class="bag-row">
<div class="bag-row-thumb">
<img src="${item.images[0] || ''}" alt="${item.title}">
</div>
<div class="bag-row-info">
<div>
<div style="font-size: 0.84rem; font-weight: 600;">${item.title}</div>
<div style="font-size: 0.72rem; color: var(--muted); margin: 2px 0;">
Color: <strong>${item.color}</strong> | Size: <strong>${item.size}</strong>
</div>
</div>
<div style="display:flex; justify-content:space-between; align-items:center; margin-top: 4px;">
<span style="font-weight:700; font-size: 0.88rem;">${CURRENCY}${(item.price * item.qty).toLocaleString('en-IN')}</span>
<div class="qty-wrap">
<button class="step-btn" onclick="changeQty(${idx}, -1)">−</button>
<span style="font-size:0.85rem; font-weight:600;">${item.qty}</span>
<button class="step-btn" onclick="changeQty(${idx}, 1)">+</button>
</div>
</div>
</div>
</div>
`).join("");
}

// -------------------------------------------------------------
// 11. WHATSAPP CHECKOUT + ORDER AUDIT LOG
// -------------------------------------------------------------
async function submitOrderToWhatsApp() {
if (cart.length === 0) {
alert("Your shopping bag is empty.");
return;
}

const name = document.getElementById("custName").value.trim();
const addr1 = document.getElementById("custAddr1").value.trim();
const nearby = document.getElementById("custNearby").value.trim();
const pincode = document.getElementById("custPincode").value.trim();
const phone = document.getElementById("custPhone").value.trim();

if (!name) {
alert("Please enter your Full Name.");
return;
}
if (!addr1) {
alert("Please enter your Street / Flat Address.");
return;
}
if (!/^\d{6}$/.test(pincode)) {
alert("Please enter a valid 6-digit Pincode (numbers only).");
return;
}
if (!/^\d{10}$/.test(phone)) {
alert("Please enter a valid 10-digit Phone Number.");
return;
}

if (selectedPayment === "COD" && blockedCodPincodes.includes(pincode)) {
alert(`Cash on Delivery is unavailable for pincode ${pincode}. Please select UPI / Online Payment.`);
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

try {
const orderPayload = {
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
};

if (currentUser && currentUser.id) {
orderPayload.user_id = currentUser.id;
}

await supabaseClient.from("orders").insert([orderPayload]);

// If logged in and opted to save address
const saveAddrCb = document.getElementById("saveAddressCheckbox");
if (currentUser && saveAddrCb && saveAddrCb.checked) {
const alreadySaved = savedAddresses.some(a =>
a.pincode === pincode && a.street_address.trim().toLowerCase() === addr1.trim().toLowerCase()
);
if (!alreadySaved) {
await supabaseClient.from("user_addresses").insert([{
user_id: currentUser.id,
full_name: name,
phone: phone,
street_address: addr1,
landmark: nearby,
pincode: pincode,
is_default: savedAddresses.length === 0
}]);
loadSavedAddresses();
}
}

if (currentUser) {
loadUserOrders();
}
} catch (e) {
console.warn("Audit order log error:", e);
}

const itemsSummary = cart.map((item, i) =>
`${i + 1}. *${item.title}*\n • Color: ${item.color}\n • Size: ${item.size}\n • Qty: ${item.qty}\n • Price: ${CURRENCY}${item.price * item.qty}`
).join("\n\n");

const paymentText = (selectedPayment === "COD")
? "Cash on Delivery (COD) [₹50 Convenience Fee Included]"
: "UPI / Online Payment (Google Pay / PhonePe / Paytm)";

const message =
`✨ *NEW ORDER — KRUSHIV ATELIER* ✨

*CUSTOMER DETAILS:*
• Name: ${name}
• Phone: ${phone}
• Delivery Address: ${addr1}
${nearby ? `• Landmark: ${nearby}\n` : ""}• Pincode: ${pincode}

------------------------------------
*ORDERED ITEMS:*
${itemsSummary}
------------------------------------

*PAYMENT PREFERENCE:*
• Selected Mode: *${paymentText}*

*BILLING SUMMARY:*
• Subtotal: ${CURRENCY}${subtotal.toLocaleString('en-IN')}
${appliedCoupon ? `• Coupon Discount (${appliedCoupon.code}): -${CURRENCY}${discount.toLocaleString('en-IN')}\n` : ""}${selectedPayment === "COD" ? `• COD Convenience Charge: +${CURRENCY}${COD_FEE}\n` : ""}• Shipping: FREE (Complimentary)
*• Grand Total Payable: ${CURRENCY}${payable.toLocaleString('en-IN')}*

${selectedPayment === "UPI" ? "Please share your UPI ID / QR code to complete payment." : "Please confirm my COD order and dispatch date."}`;

const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
window.open(waUrl, "_blank");
}

function openGeneralChatWhatsApp() {
const msg = `Hi KRUSHIV Team, I am browsing your store and have a question regarding an outfit/order.`;
const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
window.open(waUrl, "_blank");
}

// -------------------------------------------------------------
// 12. USER AUTHENTICATION, SAVED ADDRESSES & ORDER HISTORY
// -------------------------------------------------------------

// Helper: Normalize Auth Identifier (10-digit mobile or valid email)
function normalizeAuthIdentifier(input) {
if (!input) return null;
const str = input.trim();
const cleanedDigits = str.replace(/[\s\-\(\)\+]/g, '');
const phoneMatch = cleanedDigits.match(/^(?:91|0)?([6-9]\d{9})$/);
if (phoneMatch) {
const tenDigits = phoneMatch[1];
return {
isPhone: true,
phone: tenDigits,
email: `${tenDigits}@user.krushiv.store`
};
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (emailRegex.test(str)) {
return {
isPhone: false,
phone: null,
email: str.toLowerCase()
};
}
return null;
}

function getUserDisplayName(user) {
if (!user) return "Customer";
return user.user_metadata?.full_name || "Valued Customer";
}

function formatUserContactDisplay(user) {
if (!user) return "";
if (user.user_metadata?.phone) {
return `+91 ${user.user_metadata.phone}`;
}
if (user.email && user.email.endsWith("@user.krushiv.store")) {
return `+91 ${user.email.replace("@user.krushiv.store", "")}`;
}
return user.email || "";
}

async function initAuth() {
try {
const { data } = await supabaseClient.auth.getSession();
handleAuthChange(data?.session || null);
} catch (err) {
console.error("Auth session retrieval error:", err);
}

supabaseClient.auth.onAuthStateChange((_event, session) => {
handleAuthChange(session);
});
}

function handleAuthChange(session) {
currentUser = session?.user || null;
updateUserUI();
if (currentUser) {
loadSavedAddresses();
loadUserOrders();
} else {
savedAddresses = [];
userOrders = [];
renderCheckoutAddressDropdown();
}
}

function updateUserUI() {
const userDot = document.getElementById("headerUserDot");
const sidebarAvatar = document.getElementById("sidebarAvatar");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserAction = document.getElementById("sidebarUserAction");
const sidebarLogoutItem = document.getElementById("sidebarLogoutItem");
const checkoutSavedBlock = document.getElementById("checkoutSavedAddressBlock");
const checkoutAuthPrompt = document.getElementById("checkoutAuthPrompt");
const saveAddressCbLabel = document.getElementById("saveAddressCheckboxLabel");

if (currentUser) {
if (userDot) userDot.style.display = "block";
const displayName = getUserDisplayName(currentUser);
const initial = (displayName.trim()[0] || "K").toUpperCase();

if (sidebarAvatar) sidebarAvatar.textContent = initial;
if (sidebarUserName) sidebarUserName.textContent = `Hi, ${displayName.split(" ")[0]}`;
if (sidebarUserAction) sidebarUserAction.textContent = "View Account & Orders →";
if (sidebarLogoutItem) sidebarLogoutItem.style.display = "block";

if (checkoutSavedBlock) checkoutSavedBlock.style.display = "block";
if (checkoutAuthPrompt) checkoutAuthPrompt.style.display = "none";
if (saveAddressCbLabel) saveAddressCbLabel.style.display = "flex";
} else {
if (userDot) userDot.style.display = "none";
if (sidebarAvatar) sidebarAvatar.textContent = "K";
if (sidebarUserName) sidebarUserName.textContent = "Welcome to KRUSHIV";
if (sidebarUserAction) sidebarUserAction.textContent = "Sign In / Register →";
if (sidebarLogoutItem) sidebarLogoutItem.style.display = "none";

if (checkoutSavedBlock) checkoutSavedBlock.style.display = "none";
if (checkoutAuthPrompt) checkoutAuthPrompt.style.display = "flex";
if (saveAddressCbLabel) saveAddressCbLabel.style.display = "none";
}
if (window.lucide) window.lucide.createIcons();
}

function handleHeaderUserClick() {
if (currentUser) {
openAccountModal("orders");
} else {
openAuthModal("login");
}
}

function handleSidebarUserAction() {
toggleSidebar(false);
if (currentUser) {
openAccountModal("orders");
} else {
openAuthModal("login");
}
}

function openUserOrders() {
if (currentUser) {
openAccountModal("orders");
} else {
openAuthModal("login");
}
}

function openSavedAddresses() {
if (currentUser) {
openAccountModal("addresses");
} else {
openAuthModal("login");
}
}

// AUTH MODAL LOGIC
function openAuthModal(mode = "login") {
const modal = document.getElementById("authModal");
if (!modal) return;
switchAuthTab(mode);
setAuthAlert("", "");
modal.classList.add("open");
if (window.lucide) window.lucide.createIcons();
}

function closeAuthModalDirect() {
const modal = document.getElementById("authModal");
if (modal) modal.classList.remove("open");
setAuthAlert("", "");
}

function closeAuthModal(event) {
if (event.target.id === "authModal") {
closeAuthModalDirect();
}
}

function switchAuthTab(tab) {
const tabSignIn = document.getElementById("tabSignInBtn");
const tabSignUp = document.getElementById("tabSignUpBtn");
const formSignIn = document.getElementById("signInForm");
const formSignUp = document.getElementById("signUpForm");
const title = document.getElementById("authModalTitle");
const subtitle = document.getElementById("authModalSubtitle");

setAuthAlert("", "");

if (tab === "signup") {
if (tabSignUp) tabSignUp.classList.add("active");
if (tabSignIn) tabSignIn.classList.remove("active");
if (formSignUp) formSignUp.style.display = "block";
if (formSignIn) formSignIn.style.display = "none";
if (title) title.textContent = "Create an Account";
if (subtitle) subtitle.textContent = "Sign up with your mobile number or email in seconds";
} else {
if (tabSignIn) tabSignIn.classList.add("active");
if (tabSignUp) tabSignUp.classList.remove("active");
if (formSignIn) formSignIn.style.display = "block";
if (formSignUp) formSignUp.style.display = "none";
if (title) title.textContent = "Welcome Back";
if (subtitle) subtitle.textContent = "Sign in with your mobile number or email";
}
if (window.lucide) window.lucide.createIcons();
}

function setAuthAlert(msg, type = "error") {
const el = document.getElementById("authAlert");
if (!el) return;
if (!msg) {
el.style.display = "none";
el.textContent = "";
el.className = "auth-alert";
} else {
el.textContent = msg;
el.className = `auth-alert ${type}`;
el.style.display = "block";
}
}

function togglePasswordVisibility(inputId, btn) {
const input = document.getElementById(inputId);
if (!input) return;
const isPwd = input.type === "password";
input.type = isPwd ? "text" : "password";
if (btn) {
btn.innerHTML = `<i data-lucide="${isPwd ? 'eye-off' : 'eye'}" style="width: 18px; height: 18px;"></i>`;
if (window.lucide) window.lucide.createIcons();
}
}

async function submitSignIn(e) {
e.preventDefault();
const ident = document.getElementById("signInIdentifier")?.value;
const pwd = document.getElementById("signInPassword")?.value;
const btn = document.getElementById("signInSubmitBtn");

const normalized = normalizeAuthIdentifier(ident);
if (!normalized) {
setAuthAlert("Please enter a valid 10-digit mobile number or email address.");
return;
}
if (!pwd) {
setAuthAlert("Please enter your password.");
return;
}

try {
if (btn) { btn.disabled = true; btn.innerHTML = "<span>Signing In...</span>"; }
setAuthAlert("", "");

const { data, error } = await supabaseClient.auth.signInWithPassword({
email: normalized.email,
password: pwd
});

if (error) {
if (error.message.includes("Invalid login credentials")) {
setAuthAlert("Invalid mobile number/email or password. Please try again.");
} else {
setAuthAlert(error.message);
}
return;
}

if (data?.session) {
closeAuthModalDirect();
showToast("Signed in successfully!");
if (e.target) e.target.reset();
}
} catch (err) {
console.error("Sign in error:", err);
setAuthAlert("An unexpected error occurred. Please try again.");
} finally {
if (btn) { btn.disabled = false; btn.innerHTML = "<span>Sign In</span>"; }
}
}

async function submitSignUp(e) {
e.preventDefault();
const name = document.getElementById("signUpName")?.value?.trim();
const ident = document.getElementById("signUpIdentifier")?.value;
const pwd = document.getElementById("signUpPassword")?.value;
const btn = document.getElementById("signUpSubmitBtn");

if (!name) {
setAuthAlert("Please enter your Full Name.");
return;
}
const normalized = normalizeAuthIdentifier(ident);
if (!normalized) {
setAuthAlert("Please enter a valid 10-digit mobile number or email address.");
return;
}
if (!pwd || pwd.length < 6) {
setAuthAlert("Password must be at least 6 characters long.");
return;
}

try {
if (btn) { btn.disabled = true; btn.innerHTML = "<span>Creating Account...</span>"; }
setAuthAlert("", "");

const { data, error } = await supabaseClient.auth.signUp({
email: normalized.email,
password: pwd,
options: {
data: {
full_name: name,
phone: normalized.phone || "",
login_type: normalized.isPhone ? "phone" : "email"
}
}
});

if (error) {
if (error.message.includes("User already registered")) {
setAuthAlert("An account with this mobile number or email already exists. Please Sign In.");
} else {
setAuthAlert(error.message);
}
return;
}

if (data?.session) {
closeAuthModalDirect();
showToast(`Welcome to KRUSHIV, ${name}!`);
if (e.target) e.target.reset();
} else {
closeAuthModalDirect();
showToast("Account created! Please sign in.");
}
} catch (err) {
console.error("Sign up error:", err);
setAuthAlert("An unexpected error occurred. Please try again.");
} finally {
if (btn) { btn.disabled = false; btn.innerHTML = "<span>Create Account</span>"; }
}
}

async function handleSignOut() {
try {
await supabaseClient.auth.signOut();
closeAccountModalDirect();
showToast("Signed out successfully.");
} catch (err) {
console.error("Sign out error:", err);
}
}

// ACCOUNT MODAL LOGIC
function openAccountModal(tab = "orders") {
if (!currentUser) {
openAuthModal("login");
return;
}
const modal = document.getElementById("accountModal");
if (!modal) return;

const displayName = getUserDisplayName(currentUser);
const contact = formatUserContactDisplay(currentUser);
const initial = (displayName.trim()[0] || "K").toUpperCase();

const avatar = document.getElementById("accountAvatarLarge");
const nameEl = document.getElementById("accountUserName");
const contactEl = document.getElementById("accountUserContact");
const profileNameVal = document.getElementById("profileNameVal");
const profileContactVal = document.getElementById("profileContactVal");
const profileCreatedVal = document.getElementById("profileCreatedVal");

if (avatar) avatar.textContent = initial;
if (nameEl) nameEl.textContent = displayName;
if (contactEl) contactEl.textContent = contact;
if (profileNameVal) profileNameVal.textContent = displayName;
if (profileContactVal) profileContactVal.textContent = contact;
if (profileCreatedVal) {
profileCreatedVal.textContent = currentUser.created_at
? new Date(currentUser.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
: "Active";
}

switchAccountTab(tab);
modal.classList.add("open");
if (window.lucide) window.lucide.createIcons();
}

function closeAccountModalDirect() {
const modal = document.getElementById("accountModal");
if (modal) modal.classList.remove("open");
}

function closeAccountModal(event) {
if (event.target.id === "accountModal") {
closeAccountModalDirect();
}
}

function switchAccountTab(tab) {
const tabs = ["orders", "addresses", "profile"];
tabs.forEach(t => {
const btn = document.getElementById(`accTab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
const content = document.getElementById(`accTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
if (btn) btn.classList.toggle("active", t === tab);
if (content) content.style.display = (t === tab) ? "block" : "none";
});

if (tab === "orders") {
loadUserOrders();
} else if (tab === "addresses") {
renderSavedAddresses();
}
if (window.lucide) window.lucide.createIcons();
}

// SAVED ADDRESSES MANAGEMENT
async function loadSavedAddresses() {
if (!currentUser) {
savedAddresses = [];
renderCheckoutAddressDropdown();
return;
}
try {
const { data, error } = await supabaseClient
.from("user_addresses")
.select("*")
.eq("user_id", currentUser.id)
.order("is_default", { ascending: false })
.order("created_at", { ascending: false });

if (error) {
console.warn("Error fetching user addresses:", error);
return;
}
savedAddresses = data || [];
renderSavedAddresses();
renderCheckoutAddressDropdown();

if (savedAddresses.length > 0) {
const defaultAddr = savedAddresses.find(a => a.is_default) || savedAddresses[0];
const nameInput = document.getElementById("custName");
if (nameInput && !nameInput.value.trim()) {
fillCheckoutWithAddress(defaultAddr);
}
}
} catch (err) {
console.error("loadSavedAddresses error:", err);
}
}

function renderSavedAddresses() {
const container = document.getElementById("addressesListContainer");
if (!container) return;

if (savedAddresses.length === 0) {
container.innerHTML = `
<div style="text-align: center; padding: 24px; color: var(--muted); background: #FAFAFA; border-radius: 12px; border: 1px dashed var(--border);">
<i data-lucide="map-pin" style="width: 28px; height: 28px; margin-bottom: 6px; color: var(--accent);"></i>
<div style="font-size: 0.88rem; font-weight: 600; color: var(--noir);">No saved addresses yet</div>
<p style="font-size: 0.78rem; margin-top: 4px;">Add a delivery address for instant 1-click checkout.</p>
</div>
`;
if (window.lucide) window.lucide.createIcons();
return;
}

container.innerHTML = savedAddresses.map(addr => `
<div class="address-card ${addr.is_default ? 'is-default' : ''}">
<div>
${addr.is_default ? '<span class="address-badge-default">Default Address</span>' : ''}
<div class="address-name">${escapeHtml(addr.full_name)}</div>
<div class="address-text">
${escapeHtml(addr.street_address)}${addr.landmark ? `, Near ${escapeHtml(addr.landmark)}` : ''}<br/>
${addr.city ? escapeHtml(addr.city) + ', ' : ''}${addr.state ? escapeHtml(addr.state) + ' ' : ''}<strong>${escapeHtml(addr.pincode)}</strong>
</div>
<div class="address-phone">📞 +91 ${escapeHtml(addr.phone)}</div>
</div>
<div class="address-actions">
${!addr.is_default ? `
<button type="button" class="btn-link-action" onclick="setDefaultUserAddress('${addr.id}')">Make Default</button>
` : ''}
<button type="button" class="btn-link-action danger" onclick="deleteUserAddress('${addr.id}')">Delete</button>
</div>
</div>
`).join("");

if (window.lucide) window.lucide.createIcons();
}

function toggleAddAddressForm(show) {
const formWrap = document.getElementById("newAddressFormWrapper");
if (!formWrap) return;
formWrap.style.display = show ? "block" : "none";
if (show) {
const nameInput = document.getElementById("addrFullName");
const phoneInput = document.getElementById("addrPhone");
if (nameInput && !nameInput.value && currentUser) {
nameInput.value = getUserDisplayName(currentUser);
}
if (phoneInput && !phoneInput.value && currentUser?.user_metadata?.phone) {
phoneInput.value = currentUser.user_metadata.phone;
}
}
}

async function submitSaveAddress(e) {
e.preventDefault();
if (!currentUser) return;

const fullName = document.getElementById("addrFullName")?.value?.trim();
const phone = document.getElementById("addrPhone")?.value?.trim();
const street = document.getElementById("addrStreet")?.value?.trim();
const landmark = document.getElementById("addrLandmark")?.value?.trim();
const pincode = document.getElementById("addrPincode")?.value?.trim();
const city = document.getElementById("addrCity")?.value?.trim();
const state = document.getElementById("addrState")?.value?.trim();
const isDefault = document.getElementById("addrIsDefault")?.checked || false;

if (!fullName || !street) {
alert("Please enter Full Name and Street Address.");
return;
}
if (!/^\d{10}$/.test(phone)) {
alert("Please enter a valid 10-digit Phone Number.");
return;
}
if (!/^\d{6}$/.test(pincode)) {
alert("Please enter a valid 6-digit Pincode.");
return;
}

try {
if (isDefault && savedAddresses.length > 0) {
await supabaseClient
.from("user_addresses")
.update({ is_default: false })
.eq("user_id", currentUser.id);
}

const { error } = await supabaseClient.from("user_addresses").insert([{
user_id: currentUser.id,
full_name: fullName,
phone: phone,
street_address: street,
landmark: landmark || "",
pincode: pincode,
city: city || "",
state: state || "",
is_default: isDefault || savedAddresses.length === 0
}]);

if (error) {
alert("Failed to save address: " + error.message);
return;
}

toggleAddAddressForm(false);
if (e.target) e.target.reset();
showToast("Address saved successfully!");
await loadSavedAddresses();
} catch (err) {
console.error("submitSaveAddress error:", err);
}
}

async function setDefaultUserAddress(addrId) {
if (!currentUser) return;
try {
await supabaseClient
.from("user_addresses")
.update({ is_default: false })
.eq("user_id", currentUser.id);

await supabaseClient
.from("user_addresses")
.update({ is_default: true })
.eq("id", addrId)
.eq("user_id", currentUser.id);

showToast("Default address updated");
await loadSavedAddresses();
} catch (err) {
console.error("setDefaultUserAddress error:", err);
}
}

async function deleteUserAddress(addrId) {
if (!confirm("Are you sure you want to delete this address?")) return;
try {
await supabaseClient
.from("user_addresses")
.delete()
.eq("id", addrId)
.eq("user_id", currentUser.id);

showToast("Address removed");
await loadSavedAddresses();
} catch (err) {
console.error("deleteUserAddress error:", err);
}
}

function renderCheckoutAddressDropdown() {
const select = document.getElementById("checkoutAddressSelect");
const block = document.getElementById("checkoutSavedAddressBlock");
if (!select) return;

if (!currentUser || savedAddresses.length === 0) {
if (block) block.style.display = "none";
return;
}

if (block) block.style.display = "block";
select.innerHTML = '<option value="">-- Choose a saved address --</option>' +
savedAddresses.map(a => `
<option value="${a.id}">
${a.is_default ? '★ ' : ''}${escapeHtml(a.full_name)}: ${escapeHtml(a.street_address.slice(0, 24))}... (${a.pincode})
</option>
`).join("");
}

function onSelectCheckoutAddress(addrId) {
if (!addrId) return;
const addr = savedAddresses.find(a => a.id === addrId);
if (addr) {
fillCheckoutWithAddress(addr);
}
}

function fillCheckoutWithAddress(addr) {
const nameEl = document.getElementById("custName");
const addr1El = document.getElementById("custAddr1");
const nearbyEl = document.getElementById("custNearby");
const pincodeEl = document.getElementById("custPincode");
const phoneEl = document.getElementById("custPhone");

if (nameEl) nameEl.value = addr.full_name || "";
if (addr1El) addr1El.value = addr.street_address || "";
if (nearbyEl) nearbyEl.value = addr.landmark || "";
if (pincodeEl) {
pincodeEl.value = addr.pincode || "";
checkPincodeCodServiceability(addr.pincode);
}
if (phoneEl) phoneEl.value = addr.phone || "";
}

// ORDER HISTORY LOGIC
async function loadUserOrders() {
const container = document.getElementById("ordersContainer");
if (!container) return;

if (!currentUser) {
container.innerHTML = `
<div style="text-align: center; padding: 24px; color: var(--muted);">
Please <a href="javascript:void(0)" onclick="openAuthModal('login')" style="color: var(--accent); font-weight: 600; text-decoration: underline;">sign in</a> to view your past orders.
</div>
`;
return;
}

try {
container.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--muted);">Loading orders...</div>';

const { data, error } = await supabaseClient
.from("orders")
.select("*")
.eq("user_id", currentUser.id)
.order("created_at", { ascending: false });

if (error) {
container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">Failed to load your orders.</div>';
return;
}

userOrders = data || [];
renderUserOrders(userOrders);
} catch (err) {
console.error("loadUserOrders error:", err);
container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">Failed to load your orders.</div>';
}
}

function renderUserOrders(orders) {
const container = document.getElementById("ordersContainer");
if (!container) return;

if (!orders || orders.length === 0) {
container.innerHTML = `
<div style="text-align: center; padding: 36px 16px; color: var(--muted); background: #FAFAFA; border-radius: 12px; border: 1px dashed var(--border);">
<i data-lucide="package" style="width: 36px; height: 36px; margin-bottom: 8px; color: var(--accent);"></i>
<div style="font-size: 0.95rem; font-weight: 700; color: var(--noir);">No orders placed yet</div>
<p style="font-size: 0.8rem; margin-top: 4px; margin-bottom: 14px;">Browse our pret & couture collections and place your first order.</p>
<button type="button" class="btn-dark btn-sm" onclick="closeAccountModalDirect(); openHomeView();">Explore Catalog</button>
</div>
`;
if (window.lucide) window.lucide.createIcons();
return;
}

container.innerHTML = orders.map(o => {
const dateStr = new Date(o.created_at).toLocaleDateString("en-IN", {
day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
});
const shortId = (o.id || "").slice(0, 8).toUpperCase();
const items = Array.isArray(o.items) ? o.items : [];
const status = o.status || "Order Placed";
const statusClass = (status.toLowerCase().includes("delivered")) ? "order-status-delivered" : "order-status-placed";

const itemsHtml = items.map(item => `
<div class="order-item-row">
<div>
<div style="font-weight: 600; color: var(--noir);">${escapeHtml(item.title || "Pret Outfit")}</div>
<div class="order-item-meta">${escapeHtml(item.color || "-")} • Size: ${escapeHtml(item.size || "-")} • Qty: ${item.qty}</div>
</div>
<div style="font-weight: 600;">₹${(item.price * item.qty).toLocaleString("en-IN")}</div>
</div>
`).join("");

return `
<div class="order-card">
<div class="order-card-header">
<div>
<div style="display: flex; align-items: center; gap: 6px;">
<span class="order-id-badge">#KRU-${shortId}</span>
<span class="order-status-pill ${statusClass}">${escapeHtml(status)}</span>
</div>
<div class="order-date">${dateStr}</div>
</div>
<div style="text-align: right;">
<div style="font-size: 0.72rem; color: var(--muted); text-transform: uppercase;">Payment</div>
<div style="font-size: 0.78rem; font-weight: 600;">${escapeHtml(o.payment_method || 'UPI')}</div>
</div>
</div>

<div class="order-items-list">
${itemsHtml}
</div>

<div style="font-size: 0.78rem; color: var(--muted); margin-bottom: 10px; background: #FFF; padding: 8px 10px; border-radius: 6px; border: 1px solid #EFEAE3;">
<strong>Delivering to:</strong> ${escapeHtml(o.customer_name || '')}, ${escapeHtml(o.delivery_address || '')} (${escapeHtml(o.pincode || '')})
</div>

<div class="order-card-footer">
<div>
<span style="font-size: 0.75rem; color: var(--muted);">Total: </span>
<span class="order-total-amount">₹${Number(o.total || 0).toLocaleString("en-IN")}</span>
</div>
<button type="button" class="btn-order-track" onclick="trackOrderWhatsApp('${o.id}', '${o.total}')">
<i data-lucide="message-circle" style="width: 14px; height: 14px;"></i>
<span>Track on WhatsApp</span>
</button>
</div>
</div>
`;
}).join("");

if (window.lucide) window.lucide.createIcons();
}

function trackOrderWhatsApp(orderId, total) {
const shortId = (orderId || "").slice(0, 8).toUpperCase();
const text = encodeURIComponent(
`Hello KRUSHIV Atelier,\n\nI would like an update on my order *#KRU-${shortId}* (Total: ₹${total}). Could you please share the current dispatch and courier tracking status?`
);
window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, "_blank");
}

function escapeHtml(text) {
if (!text) return "";
return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}

function showToast(msg) {
const toast = document.getElementById("toastNotice");
if (!toast) return;
toast.textContent = `✓ ${msg}`;
toast.classList.add("show");

if (toastTimer) clearTimeout(toastTimer);
toastTimer = setTimeout(() => {
toast.classList.remove("show");
}, 1400);
}

document.addEventListener("DOMContentLoaded", () => {
initStore();
updateBagDisplay();
if (window.lucide) window.lucide.createIcons();
});
