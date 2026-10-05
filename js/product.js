// CART STATE FROM LOCALSTORAGE
let cart = JSON.parse(localStorage.getItem('zaya_cart') || '[]');
let currentProduct = null;
let currentSize = "S";
let currentColor = null;
let appliedCoupon = null;
let selectedPayment = "UPI";

const customerReviews = [
{ name: "Priya S.", city: "Delhi", stars: "★★★★★", text: "Got this for clg farewell last week.. fabric is pure mulmul not transparent at all. 10/10 fit for me" },
{ name: "Ananya Mehta", city: "Mumbai", stars: "★★★★★", text: "delivered in 3 days in malad. colour is slightly darker thn pic but looks v pretty after wearing ❤️" },
{ name: "Sneha P.", city: "Ahmedabad", stars: "★★★★★", text: "3xl size milna muskil hota h usually but this suit fits so comfortably at bust!! thnx zaya team" },
{ name: "Ritu K.", city: "Kolkata", stars: "★★★★★", text: "honestly was scared to order from insta ad but quality is legit good.. ordered L size fits perfect" },
{ name: "Kavita R.", city: "Bangalore", stars: "★★★★★", text: "kurti ka kapda bhot acha hai, washed once no color bleeding at all. totally worth 2.5k" },
{ name: "Meera D.", city: "Pune", stars: "★★★★★", text: "waist was slightly loose for me but mom adjusted it.. looking very classy & direct whatsapp pe tracking mil gayi thi!" }
];

async function initProductPage() {
const params = new URLSearchParams(window.location.search);
const productId = params.get('id') || "ZY-101";

currentProduct = await fetchProductById(productId);
renderProductDetails(currentProduct);
updateBagDisplay();
}

function renderProductDetails(item) {
document.getElementById("pdpCatName").textContent = item.category;
document.getElementById("pdpItemTitle").textContent = item.title;
document.getElementById("pdpRatingStars").textContent = `★ ${item.rating}`;
document.getElementById("pdpRatingReviews").textContent = `(${item.reviews} Reviews)`;
document.getElementById("pdpBoughtStats").textContent = `🔥 ${item.boughtThisMonth}`;
document.getElementById("pdpPriceVal").textContent = `${CURRENCY}${item.price.toLocaleString('en-IN')}`;
document.getElementById("pdpMrpVal").textContent = `${CURRENCY}${item.mrp.toLocaleString('en-IN')}`;
document.getElementById("pdpOffVal").textContent = `${Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF`;

// 90% / 10% Peek Slider
const peekSlider = document.getElementById("pdpPeekSlider");
peekSlider.innerHTML = item.images.map(img => `
<div class="pdp-peek-slide"><img src="${img}" alt="${item.title}"></div>
`).join("");

// Color Swatches
currentColor = item.colors[0].name;
document.getElementById("pdpSelectedColorName").textContent = currentColor;
document.getElementById("pdpColorsGroup").innerHTML = item.colors.map((c, idx) => `
<button class="color-swatch-btn ${idx === 0 ? 'selected' : ''}" style="background-color: ${c.hex};" onclick="pickPdpColor('${c.name}', this)"></button>
`).join("");

// Specifications
document.getElementById("pdpSpecsList").innerHTML = item.specs.map(s => `<li><span class="spec-bullet">✓</span> ${s}</li>`).join("");

// Reviews Marquee
const doubleList = [...customerReviews, ...customerReviews];
document.getElementById("reviewsTrack").innerHTML = doubleList.map(r => `
<div class="review-bubble">
<div class="review-user-row"><span class="review-name">${r.name} (${r.city})</span><span class="verified-chip">✓ Verified</span></div>
<div class="review-stars">${r.stars}</div>
<div class="review-comment">"${r.text}"</div>
</div>
`).join("");

// Similar Products
fetchProducts().then(all => {
const similar = all.filter(p => p.id !== item.id).slice(0, 4);
document.getElementById("similarGrid").innerHTML = similar.map(p => `
<div class="prod-card" style="cursor:pointer;" onclick="window.location.href='product.html?id=${encodeURIComponent(p.id)}'">
<div style="aspect-ratio:3/4; overflow:hidden;"><img src="${p.images[0]}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;"></div>
<div style="padding:10px;">
<div style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">${p.category}</div>
<div style="font-size:0.82rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</div>
<div style="font-weight:700; font-size:0.9rem; margin-top:2px;">${CURRENCY}${p.price.toLocaleString('en-IN')}</div>
</div>
</div>
`).join("");
});
}

function pickPdpColor(name, btn) {
currentColor = name;
document.getElementById("pdpSelectedColorName").textContent = name;
document.querySelectorAll(".color-swatch-btn").forEach(b => b.classList.remove("selected"));
btn.classList.add("selected");
}

function pickPdpSize(sz) {
currentSize = sz;
document.querySelectorAll(".size-btn-pill").forEach(b => b.classList.toggle("selected", b.textContent === sz));
}

function togglePdpAccordion(header) {
const content = header.nextElementSibling;
const icon = header.querySelector(".acc-toggle-icon");
const isOpen = content.style.display === "block";
content.style.display = isOpen ? "none" : "block";
icon.textContent = isOpen ? "+" : "−";
}

// CART ADD & SYNC
function addCurrentPdp(isDirectOrder) {
if (!currentProduct) return;
const match = cart.find(c => c.id === currentProduct.id && c.size === currentSize && c.color === currentColor);
if (match) {
match.qty += 1;
} else {
cart.push({ ...currentProduct, size: currentSize, color: currentColor, qty: 1 });
}
localStorage.setItem('zaya_cart', JSON.stringify(cart));
showToast(`Added: ${currentProduct.title} (${currentColor} / ${currentSize})`);
updateBagDisplay();
if (isDirectOrder) toggleBagDrawer(true);
}

function showToast(msg) {
const toast = document.getElementById("toastNotice");
toast.textContent = `✓ ${msg}`;
toast.classList.add("show");
setTimeout(() => toast.classList.remove("show"), 1400);
}

// CART ACTIONS IN DRAWER
function changeQty(idx, delta) {
cart[idx].qty += delta;
if (cart[idx].qty <= 0) cart.splice(idx, 1);
localStorage.setItem('zaya_cart', JSON.stringify(cart));
updateBagDisplay();
}

function toggleBagDrawer(open) {
document.getElementById("bagDrawer").classList.toggle("open", open);
document.getElementById("drawerScrim").classList.toggle("open", open);
}
document.getElementById("openBagTrigger").addEventListener("click", () => toggleBagDrawer(true));

function selectPaymentMethod(method) {
selectedPayment = method;
document.getElementById("payCardUpi").classList.toggle("active", method === "UPI");
document.getElementById("payCardCod").classList.toggle("active", method === "COD");
document.querySelector(`input[name="payMethod"][value="${method}"]`).checked = true;
updateBagDisplay();
}

function applyCoupon() {
const code = document.getElementById("couponInput").value.trim().toUpperCase();
const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
const status = document.getElementById("couponStatus");
if (code === "FESTIVE20") {
appliedCoupon = { code: "FESTIVE20", val: 20, type: "percent" };
status.style.color = "#2E7D32";
status.textContent = "✓ 20% Off Applied!";
} else {
appliedCoupon = null;
status.style.color = "#D9534F";
status.textContent = "Invalid coupon code.";
}
updateBagDisplay();
}

function updateBagDisplay() {
const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

document.getElementById("headerBagCount").textContent = totalCount;
document.getElementById("drawerCount").textContent = totalCount;
document.getElementById("ledgerSubtotal").textContent = `${CURRENCY}${subtotal.toLocaleString('en-IN')}`;

let discount = 0;
if (appliedCoupon && subtotal > 0) discount = Math.round((subtotal * appliedCoupon.val) / 100);
document.getElementById("ledgerDiscountRow").style.display = discount > 0 ? "flex" : "none";
if (discount > 0) document.getElementById("ledgerDiscountVal").textContent = `-${CURRENCY}${discount.toLocaleString('en-IN')}`;

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
if (appliedCoupon && subtotal > 0) discount = Math.round((subtotal * appliedCoupon.val) / 100);
const codExtra = (selectedPayment === "COD") ? COD_FEE : 0;
const payable = Math.max(0, subtotal - discount + codExtra);

const items = cart.map((item, i) => `${i + 1}. *${item.title}*\n Color: ${item.color} | Size: ${item.size} | Qty: ${item.qty} | Price: ${CURRENCY}${item.price * item.qty}`).join("\n\n");
const msg = `✨ *NEW ORDER — ZAYA BOUTIQUE* ✨\n\n*CUSTOMER DETAILS:*\n• Name: ${name}\n• Phone: ${phone}\n• Address: ${addr1}\n• Pincode: ${pincode}\n\n*ORDERED ITEMS:*\n${items}\n\n*PAYMENT:* ${selectedPayment === "COD" ? "Cash on Delivery (+₹50 fee)" : "UPI / Online Payment (FREE)"}\n*TOTAL PAYABLE:* ${CURRENCY}${payable.toLocaleString('en-IN')}`;

window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
}

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

initProductPage();
