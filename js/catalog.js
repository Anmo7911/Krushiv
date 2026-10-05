// CART STATE VIA LOCALSTORAGE
let cart = JSON.parse(localStorage.getItem('zaya_cart') || '[]');
let appliedCoupon = null;
let selectedPayment = "UPI";
let allProducts = [];
let activeCategory = "All";
let carouselTimers = {};

// COUPONS
const COUPONS = {
"FESTIVE20": { type: "percent", val: 20, min: 0, desc: "20% Discount" },
"WELCOME10": { type: "percent", val: 10, min: 0, desc: "10% Discount" },
"FLAT500": { type: "flat", val: 500, min: 2000, desc: "₹500 Off (Min ₹2,000)" }
};

// LOAD AND RENDER CATALOG
async function initCatalog() {
allProducts = await fetchProducts();
renderCatalogGrid();
updateBagDisplay();
setupScrollObserver();
}

function renderCatalogGrid() {
Object.values(carouselTimers).forEach(timer => {
clearTimeout(timer.timeout);
clearInterval(timer.interval);
});
carouselTimers = {};

const list = activeCategory === "All"
? allProducts
: allProducts.filter(p => p.category === activeCategory);

const grid = document.getElementById("productGrid");
if (!grid) return;

grid.innerHTML = list.map(item => {
const offPct = Math.round(((item.mrp - item.price) / item.mrp) * 100);
return `
<article class="prod-card fade-up-init">
<div class="carousel-box" onclick="goToProduct('${item.id}')">
${item.tag ? `<span class="tag-chip">${item.tag}</span>` : ''}
<div class="carousel-track" id="track-${item.id}">
${item.images.map(imgUrl => `
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
<span class="rating-stars">★ ${item.rating}</span>
<span class="rating-count">(${item.reviews})</span>
</div>
<div class="bought-badge">🔥 ${item.boughtThisMonth}</div>
<span class="prod-cat">${item.category}</span>
<h3 class="prod-name" title="${item.title}">${item.title}</h3>
<div class="prod-price-row">
<span class="val-sale">${CURRENCY}${item.price.toLocaleString('en-IN')}</span>
<span class="val-mrp">${CURRENCY}${item.mrp.toLocaleString('en-IN')}</span>
<span class="val-off">${offPct}% OFF</span>
</div>
<button class="btn-add-cart-single" onclick="goToProduct('${item.id}')">
Add to Cart
</button>
</div>
</article>
`;
}).join("");

const durations = [3200, 4200, 3600, 4800, 3900, 5200];
list.forEach((item, index) => {
const delay = 600 + (index * 500);
const speed = durations[index % durations.length];
startStaggeredCardSlide(item.id, item.images.length, delay, speed);
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
if (track) track.style.transform = `translateX(-${activeIndex * 100}%)`;
if (dotsContainer) {
dotsContainer.querySelectorAll(".c-dot").forEach((d, i) => d.classList.toggle("active", i === activeIndex));
}
}, cycleSpeed);
carouselTimers[id] = { interval: intervalId, timeout: null };
}, startDelay);
carouselTimers[id] = { timeout: timeoutId, interval: null };
}

// NAVIGATION TO PRODUCT PAGE
function goToProduct(id) {
window.location.href = `product.html?id=${encodeURIComponent(id)}`;
}

function setCategory(cat) {
activeCategory = cat;
document.querySelectorAll(".cat-pill").forEach(btn => {
btn.classList.toggle("active", btn.textContent.includes(cat) || (cat === "All" && btn.textContent.includes("All")));
});
renderCatalogGrid();
}

// SCROLL ANIMATIONS
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

// SIDEBAR & TRACK ORDER MODAL
function toggleSidebar(open) {
document.getElementById("mobileSidebar").classList.toggle("open", open);
document.getElementById("sidebarOverlay").classList.toggle("open", open);
}
function openTrackModal() { document.getElementById("trackModal").style.display = "flex"; }
function closeTrackModalDirect() { document.getElementById("trackModal").style.display = "none"; }
function closeTrackModal(e) { if (e.target.id === "trackModal") closeTrackModalDirect(); }
function submitTrackingInquiry() {
const val = document.getElementById("trackInput").value.trim();
if (!val) return alert("Please enter your Phone Number or Order Code.");
window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi ZAYA, please track my order for Mobile/Code: ${val}`)}`, "_blank");
closeTrackModalDirect();
}
function openGeneralChatWhatsApp() {
window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi ZAYA Team, I need help with an order.")}`, "_blank");
}

// CART & CHECKOUT SYNC VIA LOCALSTORAGE
function toggleBagDrawer(open) {
document.getElementById("bagDrawer").classList.toggle("open", open);
document.getElementById("drawerScrim").classList.toggle("open", open);
}
document.getElementById("openBagTrigger").addEventListener("click", () => toggleBagDrawer(true));

function saveCart() {
localStorage.setItem('zaya_cart', JSON.stringify(cart));
}

function changeQty(idx, delta) {
cart[idx].qty += delta;
if (cart[idx].qty <= 0) cart.splice(idx, 1);
saveCart();
updateBagDisplay();
}

function selectPaymentMethod(method) {
selectedPayment = method;
document.getElementById("payCardUpi").classList.toggle("active", method === "UPI");
document.getElementById("payCardCod").classList.toggle("active", method === "COD");
document.querySelector(`input[name="payMethod"][value="${method}"]`).checked = true;
updateBagDisplay();
}

function quickCoupon(code) {
document.getElementById("couponInput").value = code;
applyCoupon();
}

function applyCoupon() {
const code = document.getElementById("couponInput").value.trim().toUpperCase();
const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
const status = document.getElementById("couponStatus");

if (!code || !COUPONS[code]) {
status.style.color = "#D9534F";
status.textContent = "Invalid code. Try FESTIVE20 or WELCOME10.";
appliedCoupon = null;
return updateBagDisplay();
}
appliedCoupon = { code, ...COUPONS[code] };
status.style.color = "#2E7D32";
status.textContent = `✓ Coupon applied! (${appliedCoupon.desc})`;
updateBagDisplay();
}

function updateBagDisplay() {
const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

document.getElementById("headerBagCount").textContent = totalCount;
document.getElementById("drawerCount").textContent = totalCount;
document.getElementById("ledgerSubtotal").textContent = `${CURRENCY}${subtotal.toLocaleString('en-IN')}`;

let discount = 0;
if (appliedCoupon && subtotal > 0) {
discount = appliedCoupon.type === "percent" ? Math.round((subtotal * appliedCoupon.val) / 100) : appliedCoupon.val;
}
const discountRow = document.getElementById("ledgerDiscountRow");
if (discount > 0) {
discountRow.style.display = "flex";
document.getElementById("ledgerDiscountVal").textContent = `-${CURRENCY}${discount.toLocaleString('en-IN')}`;
} else {
discountRow.style.display = "none";
}

const codExtra = (selectedPayment === "COD" && subtotal > 0) ? COD_FEE : 0;
document.getElementById("ledgerCodRow").style.display = codExtra > 0 ? "flex" : "none";

const totalPayable = Math.max(0, subtotal - discount + codExtra);
document.getElementById("ledgerTotal").textContent = `${CURRENCY}${totalPayable.toLocaleString('en-IN')}`;

const container = document.getElementById("bagItemsContainer");
const footer = document.getElementById("bagFooter");

if (cart.length === 0) {
container.innerHTML = `<div style="text-align:center; padding: 50px 10px; color: var(--muted);"><div style="font-size: 2rem;">🛍️</div><div>Your shopping bag is empty</div></div>`;
footer.style.display = "none";
return;
}
footer.style.display = "block";
container.innerHTML = cart.map((item, idx) => `
<div class="bag-row">
<div class="bag-row-thumb"><img src="${item.images[0]}" alt="${item.title}"></div>
<div class="bag-row-info">
<div style="font-size: 0.84rem; font-weight: 600;">${item.title}</div>
<div style="font-size: 0.72rem; color: var(--muted);">Color: <strong>${item.color}</strong> | Size: <strong>${item.size}</strong></div>
<div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
<span style="font-weight:700;">${CURRENCY}${(item.price * item.qty).toLocaleString('en-IN')}</span>
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

function submitOrderToWhatsApp() {
if (cart.length === 0) return alert("Your bag is empty.");
const name = document.getElementById("custName").value.trim();
const addr1 = document.getElementById("custAddr1").value.trim();
const pincode = document.getElementById("custPincode").value.trim();
const phone = document.getElementById("custPhone").value.trim();

if (!name || !addr1 || !/^\d{6}$/.test(pincode) \vert{}\vert{} !/^\d{10}$/.test(phone)) {
return alert("Please fill in Name, Address, valid 6-digit Pincode, and 10-digit Phone.");
}

const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
let discount = 0;
if (appliedCoupon && subtotal > 0) {
discount = appliedCoupon.type === "percent" ? Math.round((subtotal * appliedCoupon.val) / 100) : appliedCoupon.val;
}
const codExtra = (selectedPayment === "COD") ? COD_FEE : 0;
const payable = Math.max(0, subtotal - discount + codExtra);

const items = cart.map((item, i) => `${i + 1}. *${item.title}*\n Color: ${item.color} | Size: ${item.size} | Qty: ${item.qty} | Price: ${CURRENCY}${item.price * item.qty}`).join("\n\n");
const msg = `✨ *NEW ORDER — ZAYA BOUTIQUE* ✨\n\n*CUSTOMER DETAILS:*\n• Name: ${name}\n• Phone: ${phone}\n• Address: ${addr1}\n• Pincode: ${pincode}\n\n*ORDERED ITEMS:*\n${items}\n\n*PAYMENT:* ${selectedPayment === "COD" ? "Cash on Delivery (+₹50 fee)" : "UPI / Online Payment (FREE)"}\n*TOTAL PAYABLE:* ${CURRENCY}${payable.toLocaleString('en-IN')}`;

window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
}

initCatalog();
