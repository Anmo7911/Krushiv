// js/store.js

// 1. STORE CONFIGURATION
const WHATSAPP_PHONE = "919876543210"; // Enter your WhatsApp phone number with country code
const CURRENCY = "₹";
const COD_FEE = 50;

// DYNAMIC CONFIG & COUPONS FROM SUPABASE
let activeCoupons = {};
let blockedCodPincodes = [];
let countdownTimerInterval = null;

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

// -------------------------------------------------------------
// 2. FETCH STORE SETTINGS, TIMER, COUPONS & PRODUCTS
// -------------------------------------------------------------
async function initStore() {
loadStoreSettings();
loadCouponsFromDb();
loadProductsFromSupabase();
setupPincodeListener();
}

async function loadStoreSettings() {
try {
const { data } = await supabaseClient
.from("store_settings")
.select("*");

let topText = "";
let countdownEnd = null;

if (data) {
data.forEach(item => {
if (item.key === "top_bar_text") topText = item.value;
if (item.key === "countdown_end") countdownEnd = item.value;
if (item.key === "blocked_cod_pincodes") {
try { blockedCodPincodes = JSON.parse(item.value || "[]"); } catch(e) {}
}
});
}

const bar = document.querySelector(".top-bar");
if (bar && topText) {
bar.innerHTML = `<span id="topBarMainText">${topText}</span> <span id="topBarTimerBadge" style="margin-left: 8px; background: #A86B58; padding: 2px 7px; border-radius: 4px; font-weight: 700; display: inline-block;"></span>`;
if (countdownEnd) {
startCountdownTimer(countdownEnd);
}
}
} catch (e) {
console.warn("Using default top bar settings", e);
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
badge.textContent = `⏳ Ends in ${days}d ${pad(hours)}h ${pad(mins)}m`;
} else {
badge.textContent = `⚡ Ends in ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}
}

update();
countdownTimerInterval = setInterval(update, 1000);
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
const grid = document.getElementById("productGrid");
if (!grid) return;

grid.innerHTML = `
<div class="empty-grid-msg">
<div style="font-size: 1.8rem; margin-bottom: 8px;">⏳</div>
<div>Loading our collection...</div>
</div>
`;

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

return {
...p,
price: Number(p.price),
mrp: Number(p.mrp),
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
grid.innerHTML = `
<div class="empty-grid-msg">
<div style="font-size: 1.5rem; margin-bottom: 6px;">⚠️</div>
<div>Unable to load products right now.</div>
<div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">Please check your Supabase connection.</div>
</div>
`;
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
// 5. RENDER CATALOG (WITH STOCK LEFT / OUT OF STOCK BADGES)
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
<div class="rating-row">
<span class="rating-stars">★ ${item.rating || '4.9'}</span>
<span class="rating-count">(${item.reviews || '0'})</span>
</div>
${item.bought_this_month ? `<div class="bought-badge">🔥 ${item.bought_this_month}</div>` : ''}

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
// 7. PRODUCT DETAILS PAGE (PDP) WITH SIZE-LEVEL STOCK & PRODUCT LEFT
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

// Stock Left badge
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

// Peek Slider
const peekSlider = document.getElementById("pdpPeekSlider");
const displayImages = item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&h=933&q=80'];
peekSlider.innerHTML = displayImages.map(img => `
<div class="pdp-peek-slide">
<img src="${img}" alt="${item.title}">
</div>
`).join("");
peekSlider.scrollLeft = 0;

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

// A. SIZE-LEVEL STOCK MANAGEMENT
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
window.scrollTo({ top: 0, behavior: "smooth" });

if (item.slug) {
window.history.pushState({}, "", `?p=${item.slug}`);
}
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
showToast(`Size ${sz} is currently out of stock. Tap 'Order Now' to request restock via WhatsApp!`);
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
const msg = `Hi ZAYA Team, I would like to request a restock/custom order for:\n*${item.title}*\nCode: ${item.id}\nColor: ${currentColor}\nSize: ${currentSize}\nPlease let me know when it will be available!`;
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
const msg = `Hi ZAYA Team, I would like to track my order for Mobile/Order Code: ${val}. Please share the current dispatch & delivery status.`;
const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
window.open(waUrl, "_blank");
closeTrackModalDirect();
}

const legalContent = {
privacy: {
title: "Privacy Policy",
body: "At ZAYA, we are dedicated to protecting your personal data. We strictly use your name, shipping address, and phone number solely to prepare and fulfill your boutique orders via WhatsApp. We never sell, lease, or monetize your contact information with external marketing agencies."
},
terms: {
title: "Terms & Conditions",
body: "By shopping on ZAYA, you agree to our direct order processing terms. Orders placed via WhatsApp receive an official itemized confirmation bill before dispatch. Deliveries are executed via authorized express courier partners across India."
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
const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

document.getElementById("headerBagCount").textContent = totalCount;
document.getElementById("drawerCount").textContent = totalCount;
document.getElementById("ledgerSubtotal").textContent = `${CURRENCY}${subtotal.toLocaleString('en-IN')}`;

let discountAmount = 0;
if (appliedCoupon && subtotal > 0) {
discountAmount = appliedCoupon.type === "percent"
? Math.round((subtotal * appliedCoupon.val) / 100)
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

const codExtra = (selectedPayment === "COD" && subtotal > 0) ? COD_FEE : 0;
const codRow = document.getElementById("ledgerCodRow");
if (codExtra > 0) {
codRow.style.display = "flex";
} else {
codRow.style.display = "none";
}

const totalPayable = Math.max(0, subtotal - discountAmount + codExtra);
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
// 11. WHATSAPP CHECKOUT + ORDER LOGGING TO SUPABASE
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
await supabaseClient.from("orders").insert([{
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
`✨ *NEW ORDER — ZAYA BOUTIQUE* ✨

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
const msg = `Hi ZAYA Team, I am browsing your store and have a question regarding an outfit/order.`;
const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
window.open(waUrl, "_blank");
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
});
