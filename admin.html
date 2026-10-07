<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>KRUSHIV Atelier | Admin Portal</title>

<!-- Supabase JS Client via CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<style>
:root {
--bg: #FBF9F6;
--surface: #FFFFFF;
--noir: #181615;
--accent: #A86B58;
--border: #E8E2D9;
--muted: #78726D;
--danger: #D9534F;
--success: #2E7D32;
--radius-sm: 6px;
--radius-md: 10px;
--font-serif: Georgia, serif;
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--noir); font-family: var(--font-sans); line-height: 1.5; padding: 20px; }

.admin-container { max-width: 1140px; margin: 0 auto; }
.top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
.admin-title { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 700; }

.nav-tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.tab-btn { padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; background: transparent; color: var(--muted); }
.tab-btn.active { background: var(--noir); color: #fff; }

.btn { padding: 8px 16px; border-radius: var(--radius-sm); border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; }
.btn-dark { background: var(--noir); color: #fff; }
.btn-dark:hover { background: #333; }
.btn-danger { background: var(--danger); color: #fff; }
.btn-sm { padding: 5px 10px; font-size: 0.75rem; }
.btn-copy { background: #EFEBE9; color: var(--noir); border: 1px solid var(--border); }
.btn-success { background: var(--success); color: #fff; }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.03); }
.card-title { font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 14px; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.full { grid-column: 1 / -1; }
.label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--muted); }
.input, select, textarea {
padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.88rem; outline: none; background: #FAFAFA;
}
.input:focus, select:focus, textarea:focus { border-color: var(--noir); background: #FFF; }
.hint { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

.upload-zone { border: 2px dashed var(--border); border-radius: var(--radius-sm); padding: 18px; text-align: center; background: #FAF9F6; cursor: pointer; transition: border-color 0.2s; }
.upload-zone:hover { border-color: var(--noir); }
.preview-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.preview-box { position: relative; width: 70px; height: 90px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border); background: #eee; }
.preview-box img { width: 100%; height: 100%; object-fit: cover; }
.preview-del { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.65); color: #fff; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; }
.preview-main { position: absolute; bottom: 2px; left: 2px; background: var(--accent); color: #fff; font-size: 8px; padding: 1px 4px; border-radius: 2px; text-transform: uppercase; font-weight: bold; }

.size-stock-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.size-stock-pill { display: flex; align-items: center; gap: 6px; background: #FAFAFA; border: 1px solid var(--border); padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer; user-select: none; font-size: 0.82rem; font-weight: 600; }
.size-stock-pill.in-stock { border-color: var(--success); background: #F1F8F3; color: var(--success); }
.size-stock-pill.out-of-stock { border-color: var(--danger); background: #FDF2F2; color: var(--danger); text-decoration: line-through; }

.dynamic-list { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
.dynamic-row { display: flex; gap: 8px; align-items: center; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left; }
th { background: #FAF7F2; padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 0.75rem; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:hover { background: #FCFAF7; }
.thumb { width: 44px; height: 55px; border-radius: 4px; object-fit: cover; }

.badge-status { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; display: inline-block; cursor: pointer; }
.badge-active { background: #E8F5E9; color: var(--success); }
.badge-inactive { background: #FFEBEE; color: var(--danger); }
.badge-stock { font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block; }
.stock-ok { background: #E8F5E9; color: var(--success); }
.stock-low { background: #FEF3C7; color: #B45309; }
.stock-out { background: #FEE2E2; color: var(--danger); }

.toast { position: fixed; bottom: 20px; right: 20px; background: var(--noir); color: #fff; padding: 10px 18px; border-radius: 30px; font-size: 0.82rem; display: none; z-index: 100; }
</style>
</head>
<body>

<div class="admin-container">

<!-- LOGIN PANEL -->
<div id="loginCard" class="card" style="max-width: 420px; margin: 80px auto;">
<h2 class="card-title" style="text-align: center;">KRUSHIV Admin Login</h2>
<p style="font-size: 0.82rem; color: var(--muted); text-align: center; margin-bottom: 16px;">
Sign in with your Supabase Admin credentials.
</p>
<form id="loginForm">
<div class="form-group" style="margin-bottom: 12px;">
<label class="label">Admin Email</label>
<input type="email" id="loginEmail" class="input" required placeholder="kittufashionyt@gmail.com" />
</div>
<div class="form-group" style="margin-bottom: 16px;">
<label class="label">Password</label>
<input type="password" id="loginPassword" class="input" required placeholder="••••••••" />
</div>
<button type="submit" class="btn btn-dark" style="width: 100%;">Sign In</button>
<div id="loginError" style="color: var(--danger); font-size: 0.78rem; margin-top: 8px; text-align: center;"></div>
</form>
</div>

<!-- MAIN DASHBOARD -->
<div id="dashboardArea" style="display: none;">

<div class="top-header">
<div>
<h1 class="admin-title">KRUSHIV Store Management</h1>
<div style="font-size: 0.8rem; color: var(--muted);" id="userDisplay">Logged in</div>
</div>
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
<a href="/" target="_blank" class="btn btn-copy">Live Store ↗</a>
<a href="/coupons.html" class="btn btn-copy">Coupons & Offers 🎟️</a>
<button class="btn btn-dark" onclick="handleLogout()">Sign Out</button>
</div>
</div>

<!-- TABS -->
<div class="nav-tabs">
<button class="tab-btn active" id="tabProductsBtn" onclick="switchTab('products')">Products Catalog</button>
<button class="tab-btn" id="tabOrdersBtn" onclick="switchTab('orders')">WhatsApp Order Inquiries</button>
</div>

<!-- TAB 1: PRODUCTS -->
<div id="tabProductsView">
<div class="card">
<h2 class="card-title" id="formHeader">Add New Product</h2>
<form id="productForm">
<input type="hidden" id="editingId" value="" />

<div class="form-grid">
<div class="form-group">
<label class="label">Product ID (Unique Code)</label>
<input type="text" id="prodId" class="input" placeholder="e.g. ZY-101" required />
</div>

<div class="form-group">
<label class="label">Category</label>
<select id="prodCategory" required>
<option value="Kurtas">Kurtas & Sets</option>
<option value="Dresses">Western Dresses</option>
<option value="Co-ords">Co-ord Sets</option>
<option value="Sarees">Pure Silk & Sarees</option>
</select>
</div>

<div class="form-group full">
<label class="label">Product Title</label>
<input type="text" id="prodTitle" class="input" placeholder="e.g. Mulmul Embroidered Anarkali Set" required oninput="autoPopulateSlug(this.value)" />
</div>

<div class="form-group">
<label class="label">Product URL Slug</label>
<input type="text" id="prodSlug" class="input" placeholder="mulmul-anarkali-set" required />
<span class="hint">Public link: <code>yourstore.com/?p=your-slug</code></span>
</div>

<div class="form-group">
<label class="label">Private Token</label>
<div style="display: flex; gap: 6px;">
<input type="text" id="prodToken" class="input" placeholder="tok_xxxxxx" required />
<button type="button" class="btn btn-copy" onclick="regenerateToken()">New</button>
</div>
<span class="hint">Token link: <code>yourstore.com/?token=your-token</code></span>
</div>

<div class="form-group">
<label class="label">Sale Price (₹)</label>
<input type="number" id="prodPrice" class="input" placeholder="2499" required />
</div>

<div class="form-group">
<label class="label">MRP / Original Price (₹)</label>
<input type="number" id="prodMrp" class="input" placeholder="3499" required />
</div>

<!-- STOCK QUANTITY & STATUS -->
<div class="form-group">
<label class="label">Total Stock Quantity Left</label>
<input type="number" id="prodStockQty" class="input" placeholder="10" min="0" value="10" required />
<span class="hint">0 = Out of Stock. 1 to 5 = triggers "Only X left!" urgency badge.</span>
</div>

<div class="form-group">
<label class="label">Highlight Tag (Optional)</label>
<input type="text" id="prodTag" class="input" placeholder="e.g. Bestseller, Trending, Festive Edit" />
</div>

<!-- FEATURED ON HOME HERO CAROUSEL -->
<div class="form-group">
<label class="label">Featured on Home Carousel?</label>
<label style="display:flex; align-items:center; gap:8px; height:42px; font-weight:600; font-size:0.85rem; cursor:pointer;">
<input type="checkbox" id="prodIsFeatured" style="width:18px; height:18px; accent-color:var(--noir); cursor:pointer;" />
<span>Show in Top Hero Carousel</span>
</label>
</div>

<!-- SIZE-LEVEL STOCK MANAGEMENT -->
<div class="form-group full">
<label class="label">Per-Size Stock Availability (Click to toggle In-Stock / Out-of-Stock)</label>
<div class="size-stock-grid" id="sizeStockContainer">
<div class="size-stock-pill in-stock" data-size="S" onclick="toggleSizeStockPill(this)"><span>S</span>: In Stock</div>
<div class="size-stock-pill in-stock" data-size="M" onclick="toggleSizeStockPill(this)"><span>M</span>: In Stock</div>
<div class="size-stock-pill in-stock" data-size="L" onclick="toggleSizeStockPill(this)"><span>L</span>: In Stock</div>
<div class="size-stock-pill in-stock" data-size="XL" onclick="toggleSizeStockPill(this)"><span>XL</span>: In Stock</div>
<div class="size-stock-pill in-stock" data-size="XXL" onclick="toggleSizeStockPill(this)"><span>XXL</span>: In Stock</div>
<div class="size-stock-pill in-stock" data-size="3XL" onclick="toggleSizeStockPill(this)"><span>3XL</span>: In Stock</div>
</div>
<span class="hint">Out-of-stock sizes will be struck out on the product page.</span>
</div>

<div class="form-group full">
<label class="label">Bought This Month (Social Proof)</label>
<input type="text" id="prodBought" class="input" placeholder="e.g. 450+ bought this month" />
</div>

<!-- DUAL IMAGE HANDLING -->
<div class="form-group full">
<label class="label">Product Images (Upload Device Photos OR Paste External URLs)</label>

<div class="upload-zone" onclick="document.getElementById('fileUploadInput').click()">
<div style="font-size: 1.5rem; margin-bottom: 4px;">📸</div>
<div style="font-weight: 600; font-size: 0.88rem;">Click here to upload images from your phone/computer</div>
<div style="font-size: 0.74rem; color: var(--muted); margin-top: 2px;">Uploads directly to your Supabase "product-images" bucket</div>
<input type="file" id="fileUploadInput" multiple accept="image/*" style="display: none;" onchange="handleImageUpload(event)" />
<div id="uploadStatusText" style="font-size: 0.76rem; color: var(--accent); margin-top: 4px; font-weight: 600;"></div>
</div>

<div style="margin-top: 10px;">
<label class="label" style="font-size: 0.7rem;">Or paste direct image URLs (one per line or comma-separated):</label>
<textarea id="prodImages" class="input" rows="2" placeholder="https://images.unsplash.com/..." oninput="syncImagesPreview()"></textarea>
</div>

<div class="label" style="margin-top: 8px;">Image Gallery (First image is the cover):</div>
<div id="imagePreviewGrid" class="preview-grid"></div>
</div>

<div class="form-group full">
<label class="label">Colors</label>
<div id="colorsContainer" class="dynamic-list"></div>
<button type="button" class="btn btn-copy btn-sm" onclick="addColorRow()" style="margin-top: 6px; width: fit-content;">+ Add Color</button>
</div>

<div class="form-group full">
<label class="label">Specifications (one bullet per line)</label>
<textarea id="prodSpecs" class="input" rows="4" placeholder="Fabric: 100% Pure Mulmul Cotton&#10;Care: Dry clean only"></textarea>
</div>
</div>

<div style="display: flex; gap: 10px; margin-top: 18px;">
<button type="submit" class="btn btn-dark" id="saveBtn">Save Product</button>
<button type="button" class="btn btn-copy" onclick="resetForm()">Clear Form</button>
</div>
</form>
</div>

<!-- INVENTORY TABLE -->
<div class="card">
<h2 class="card-title">Existing Products (<span id="totalItemsCount">0</span>)</h2>
<div class="table-wrap">
<table>
<thead>
<tr>
<th>Image</th>
<th>Code</th>
<th>Title</th>
<th>Price</th>
<th>Stock</th>
<th>Status</th>
<th>Share Links</th>
<th>Actions</th>
</tr>
</thead>
<tbody id="inventoryTableBody"></tbody>
</table>
</div>
</div>
</div>

<!-- TAB 2: ORDERS AUDIT LOG -->
<div id="tabOrdersView" style="display: none;">
<div class="card">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
<h2 class="card-title" style="margin-bottom:0;">WhatsApp Order Inquiries Log</h2>
<button class="btn btn-copy btn-sm" onclick="loadOrdersLog()">Refresh Log</button>
</div>
<p style="font-size:0.8rem; color:var(--muted); margin-bottom:16px;">
Every time a customer clicks "Order on WhatsApp", their full checkout details (name, phone, address, cart) are saved here.
</p>
<div class="table-wrap">
<table>
<thead>
<tr>
<th>Date</th>
<th>Customer</th>
<th>Phone</th>
<th>Address & Pincode</th>
<th>Payment</th>
<th>Items & Total</th>
</tr>
</thead>
<tbody id="ordersTableBody"></tbody>
</table>
</div>
</div>
</div>

</div>
</div>

<div id="adminToast" class="toast">Action completed!</div>

<script src="/js/supabase.js"></script>

<script>
let cachedProducts = [];
let currentImageList = [];

// 1. AUTHENTICATION
async function checkAuthSession() {
try {
const res = await supabaseClient.auth.getSession();
if (res && res.data && res.data.session && res.data.session.user) {
showDashboard(res.data.session.user);
} else {
showLogin();
}
} catch (err) {
console.error("Session check error:", err);
showLogin();
}
}

function showLogin() {
document.getElementById("loginCard").style.display = "block";
document.getElementById("dashboardArea").style.display = "none";
}

function showDashboard(user) {
document.getElementById("loginCard").style.display = "none";
document.getElementById("dashboardArea").style.display = "block";
document.getElementById("userDisplay").textContent = "Logged in as: " + user.email;
loadInventory();
resetForm();
}

document.getElementById("loginForm").addEventListener("submit", async function(e) {
e.preventDefault();
const email = document.getElementById("loginEmail").value.trim();
const password = document.getElementById("loginPassword").value;
const errorElem = document.getElementById("loginError");
errorElem.textContent = "Signing in...";

try {
const res = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
if (res.error) {
errorElem.textContent = res.error.message;
} else if (res.data && res.data.user) {
errorElem.textContent = "";
showDashboard(res.data.user);
}
} catch (err) {
errorElem.textContent = "Connection error: " + err.message;
}
});

async function handleLogout() {
await supabaseClient.auth.signOut();
showLogin();
}

function switchTab(tab) {
const isProd = tab === 'products';
document.getElementById('tabProductsBtn').classList.toggle('active', isProd);
document.getElementById('tabOrdersBtn').classList.toggle('active', !isProd);
document.getElementById('tabProductsView').style.display = isProd ? 'block' : 'none';
document.getElementById('tabOrdersView').style.display = isProd ? 'none' : 'block';
if (!isProd) loadOrdersLog();
}

// 2. SIZE-LEVEL STOCK MANAGEMENT
function toggleSizeStockPill(el) {
const isCurrentlyIn = el.classList.contains("in-stock");
const sz = el.getAttribute("data-size");
if (isCurrentlyIn) {
el.classList.remove("in-stock");
el.classList.add("out-of-stock");
el.innerHTML = "<span>" + sz + "</span>: Out of Stock";
} else {
el.classList.remove("out-of-stock");
el.classList.add("in-stock");
el.innerHTML = "<span>" + sz + "</span>: In Stock";
}
}

function getSizeStockData() {
const result = {};
document.querySelectorAll("#sizeStockContainer .size-stock-pill").forEach(el => {
const sz = el.getAttribute("data-size");
result[sz] = el.classList.contains("in-stock");
});
return result;
}

function setSizeStockPills(obj) {
const stockMap = obj || { S: true, M: true, L: true, XL: true, XXL: true, "3XL": true };
document.querySelectorAll("#sizeStockContainer .size-stock-pill").forEach(el => {
const sz = el.getAttribute("data-size");
const isIn = stockMap[sz] !== false;
el.className = "size-stock-pill " + (isIn ? "in-stock" : "out-of-stock");
el.innerHTML = "<span>" + sz + "</span>: " + (isIn ? "In Stock" : "Out of Stock");
});
}

// 3. IMAGE UPLOAD
async function handleImageUpload(event) {
const files = event.target.files;
if (!files || files.length === 0) return;

const statusEl = document.getElementById("uploadStatusText");
statusEl.textContent = "Uploading " + files.length + " image(s) to Supabase Storage...";

for (let i = 0; i < files.length; i++) {
const file = files[i];
const cleanName = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g, "");
const filePath = "products/" + cleanName;

const { data, error } = await supabaseClient.storage
.from("product-images")
.upload(filePath, file, { cacheControl: "3600", upsert: true });

if (error) {
console.error("Storage upload error:", error);
alert("Image upload failed: " + error.message + "\nPlease verify bucket 'product-images' is created and marked Public.");
} else {
const { data: pubData } = supabaseClient.storage
.from("product-images")
.getPublicUrl(filePath);

if (pubData && pubData.publicUrl) {
currentImageList.push(pubData.publicUrl);
}
}
}

statusEl.textContent = "✓ Upload finished!";
setTimeout(() => { statusEl.textContent = ""; }, 3000);
updateImageFieldFromList();
renderImagePreviews();
event.target.value = "";
}

function syncImagesPreview() {
const raw = document.getElementById("prodImages").value;
currentImageList = raw.split(/[\n,]/).map(u => u.trim()).filter(u => u.length > 0);
renderImagePreviews();
}

function updateImageFieldFromList() {
document.getElementById("prodImages").value = currentImageList.join("\n");
}

function renderImagePreviews() {
const container = document.getElementById("imagePreviewGrid");
container.innerHTML = "";

currentImageList.forEach((url, idx) => {
const box = document.createElement("div");
box.className = "preview-box";

const img = document.createElement("img");
img.src = url;
box.appendChild(img);

if (idx === 0) {
const mainTag = document.createElement("span");
mainTag.className = "preview-main";
mainTag.textContent = "Cover";
box.appendChild(mainTag);
}

const del = document.createElement("div");
del.className = "preview-del";
del.textContent = "✕";
del.title = "Remove photo";
del.onclick = function() {
currentImageList.splice(idx, 1);
updateImageFieldFromList();
renderImagePreviews();
};
box.appendChild(del);

container.appendChild(box);
});
}

// 4. SLUG & TOKEN
function autoPopulateSlug(title) {
const slugInput = document.getElementById("prodSlug");
const editingId = document.getElementById("editingId");
if (slugInput && !editingId.value) {
slugInput.value = generateSlug(title);
}
}

function regenerateToken() {
document.getElementById("prodToken").value = generateToken("tok");
}

// 5. COLORS
function addColorRow(name, hex) {
name = name || "";
hex = hex || "#8A9A86";
const container = document.getElementById("colorsContainer");
const div = document.createElement("div");
div.className = "dynamic-row";

const nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.className = "input color-name";
nameInput.placeholder = "Color Name";
nameInput.value = name;
nameInput.style.flex = "2";
nameInput.required = true;

const colorInput = document.createElement("input");
colorInput.type = "color";
colorInput.className = "color-picker";
colorInput.value = hex;
colorInput.style.width = "44px";
colorInput.style.height = "38px";
colorInput.style.border = "1px solid var(--border)";
colorInput.style.borderRadius = "4px";

const delBtn = document.createElement("button");
delBtn.type = "button";
delBtn.className = "btn btn-danger btn-sm";
delBtn.textContent = "✕";
delBtn.onclick = function() { div.remove(); };

div.appendChild(nameInput);
div.appendChild(colorInput);
div.appendChild(delBtn);
container.appendChild(div);
}

function getColorsData() {
const rows = document.querySelectorAll("#colorsContainer .dynamic-row");
const colors = [];
rows.forEach(function(row) {
const nameEl = row.querySelector(".color-name");
const colorEl = row.querySelector(".color-picker");
const name = nameEl ? nameEl.value.trim() : "";
const hex = colorEl ? colorEl.value : "";
if (name) colors.push({ name: name, hex: hex });
});
return colors;
}

// 6. INVENTORY TABLE
async function loadInventory() {
const tbody = document.getElementById("inventoryTableBody");
tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Loading inventory...</td></tr>';

const res = await supabaseClient.from("products").select("*").order("created_at", { ascending: false });
if (res.error) {
tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">Failed to load products.</td></tr>';
return;
}

cachedProducts = res.data || [];
document.getElementById("totalItemsCount").textContent = String(cachedProducts.length);

if (cachedProducts.length === 0) {
tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--muted);">No products yet. Use the form above to add your first item!</td></tr>';
return;
}

tbody.innerHTML = "";
const siteOrigin = window.location.origin;

cachedProducts.forEach(function(p) {
let images = [];
try { images = Array.isArray(p.images) ? p.images : JSON.parse(p.images || "[]"); } catch (e) { images = []; }
const firstImg = images.length > 0 ? images[0] : "";
const slugUrl = siteOrigin + "/?p=" + p.slug;
const tokenUrl = siteOrigin + "/?token=" + p.token;
const stockQty = (p.stock_qty !== undefined && p.stock_qty !== null) ? Number(p.stock_qty) : 10;

const tr = document.createElement("tr");

// Thumb
const tdImg = document.createElement("td");
if (firstImg) {
const img = document.createElement("img");
img.src = firstImg;
img.className = "thumb";
img.alt = p.title;
tdImg.appendChild(img);
} else {
const placeholder = document.createElement("div");
placeholder.className = "thumb";
placeholder.style.background = "#EAE6DF";
tdImg.appendChild(placeholder);
}
tr.appendChild(tdImg);

// ID & Category
const tdId = document.createElement("td");
tdId.innerHTML = "<strong>" + p.id + "</strong><div style='font-size:0.72rem; color:var(--muted);'>" + p.category + "</div>";
tr.appendChild(tdId);

// Title & Tag & Featured badge
const tdTitle = document.createElement("td");
const featuredChip = p.is_featured ? '<span style="background:#FFF3E0; color:#E65100; font-size:0.65rem; padding:1px 5px; border-radius:3px; font-weight:700; margin-left:4px;">Featured</span>' : '';
tdTitle.innerHTML = '<div style="font-weight:600;">' + p.title + featuredChip + '</div><div style="font-size:0.72rem; color:var(--muted);">' + (p.tag || "No Tag") + '</div>';
tr.appendChild(tdTitle);

// Price
const tdPrice = document.createElement("td");
tdPrice.innerHTML = '<div>₹' + Number(p.price).toLocaleString("en-IN") + '</div><div style="font-size:0.72rem; color:var(--muted); text-decoration:line-through;">₹' + Number(p.mrp).toLocaleString("en-IN") + '</div>';
tr.appendChild(tdPrice);

// Stock Badge
const tdStock = document.createElement("td");
let stockClass = "stock-ok";
let stockLabel = stockQty + " in stock";
if (stockQty === 0) {
stockClass = "stock-out";
stockLabel = "Out of Stock";
} else if (stockQty <= 5) {
stockClass = "stock-low";
stockLabel = "Only " + stockQty + " left!";
}
tdStock.innerHTML = '<span class="badge-stock ' + stockClass + '">' + stockLabel + '</span>';
tr.appendChild(tdStock);

// Status Toggle
const tdStatus = document.createElement("td");
const isActive = p.is_active !== false;
const statusSpan = document.createElement("span");
statusSpan.className = "badge-status " + (isActive ? "badge-active" : "badge-inactive");
statusSpan.textContent = isActive ? "Active" : "Hidden";
statusSpan.style.cursor = "pointer";
statusSpan.onclick = function() { toggleProductStatus(p.id, !isActive); };
tdStatus.appendChild(statusSpan);
tr.appendChild(tdStatus);

// Links
const tdLinks = document.createElement("td");
const linksWrap = document.createElement("div");
linksWrap.style.display = "flex";
linksWrap.style.flexDirection = "column";
linksWrap.style.gap = "4px";

const btnSlug = document.createElement("button");
btnSlug.className = "btn btn-copy btn-sm";
btnSlug.textContent = "📋 Slug Link";
btnSlug.onclick = function() { copyToClipboard(slugUrl, "Slug link copied!"); };

const btnToken = document.createElement("button");
btnToken.className = "btn btn-copy btn-sm";
btnToken.textContent = "🔑 Token Link";
btnToken.onclick = function() { copyToClipboard(tokenUrl, "Token link copied!"); };

linksWrap.appendChild(btnSlug);
linksWrap.appendChild(btnToken);
tdLinks.appendChild(linksWrap);
tr.appendChild(tdLinks);

// Actions
const tdActions = document.createElement("td");
const actionsWrap = document.createElement("div");
actionsWrap.style.display = "flex";
actionsWrap.style.gap = "4px";
actionsWrap.style.flexWrap = "wrap";

const btnEdit = document.createElement("button");
btnEdit.className = "btn btn-copy btn-sm";
btnEdit.textContent = "Edit";
btnEdit.onclick = function() { editProduct(p.id); };

const btnDup = document.createElement("button");
btnDup.className = "btn btn-copy btn-sm";
btnDup.textContent = "Clone";
btnDup.onclick = function() { duplicateProduct(p.id); };

const btnDelete = document.createElement("button");
btnDelete.className = "btn btn-danger btn-sm";
btnDelete.textContent = "Del";
btnDelete.onclick = function() { deleteProduct(p.id); };

actionsWrap.appendChild(btnEdit);
actionsWrap.appendChild(btnDup);
actionsWrap.appendChild(btnDelete);
tdActions.appendChild(actionsWrap);
tr.appendChild(tdActions);

tbody.appendChild(tr);
});
}

async function toggleProductStatus(id, newStatus) {
const { error } = await supabaseClient
.from("products")
.update({ is_active: newStatus })
.eq("id", id);

if (error) {
alert("Failed to update status: " + error.message);
} else {
showToast(newStatus ? "Product visible on store!" : "Product hidden from store!");
loadInventory();
}
}

function duplicateProduct(id) {
const item = cachedProducts.find(p => p.id === id);
if (!item) return;

editProduct(id);
document.getElementById("editingId").value = "";
document.getElementById("formHeader").textContent = "Add New Product (Duplicated)";
document.getElementById("saveBtn").textContent = "Save Product";
document.getElementById("prodId").disabled = false;
document.getElementById("prodId").value = item.id + "-COPY";
document.getElementById("prodSlug").value = item.slug + "-copy";
regenerateToken();
showToast("Duplicated! Adjust code/title and save.");
}

// 7. SAVE PRODUCT
document.getElementById("productForm").addEventListener("submit", async function(e) {
e.preventDefault();

const id = document.getElementById("prodId").value.trim();
const title = document.getElementById("prodTitle").value.trim();
const category = document.getElementById("prodCategory").value;
const slug = document.getElementById("prodSlug").value.trim();
const token = document.getElementById("prodToken").value.trim();
const price = parseFloat(document.getElementById("prodPrice").value);
const mrp = parseFloat(document.getElementById("prodMrp").value);
const stock_qty = parseInt(document.getElementById("prodStockQty").value, 10) || 0;
const tag = document.getElementById("prodTag").value.trim();
const is_featured = document.getElementById("prodIsFeatured").checked;
const bought_this_month = document.getElementById("prodBought").value.trim();

const rawSpecs = document.getElementById("prodSpecs").value;
const specs = rawSpecs.split("\n").map(s => s.trim()).filter(s => s.length > 0);
const colors = getColorsData();
const sizes_stock = getSizeStockData();

const payload = {
id: id,
title: title,
category: category,
slug: slug,
token: token,
price: price,
mrp: mrp,
stock_qty: stock_qty,
sizes_stock: sizes_stock,
tag: tag,
is_featured: is_featured,
bought_this_month: bought_this_month,
images: currentImageList,
colors: colors,
specs: specs,
is_active: true
};

const editingId = document.getElementById("editingId").value;
const saveBtn = document.getElementById("saveBtn");
saveBtn.disabled = true;
saveBtn.textContent = "Saving...";

let res;
if (editingId) {
res = await supabaseClient.from("products").update(payload).eq("id", editingId);
} else {
res = await supabaseClient.from("products").insert([payload]);
}

saveBtn.disabled = false;
saveBtn.textContent = "Save Product";

if (res.error) {
alert("Error saving product: " + res.error.message);
} else {
showToast(editingId ? "Product updated!" : "Product added!");
resetForm();
loadInventory();
}
});

// 8. EDIT & DELETE
function editProduct(id) {
const item = cachedProducts.find(p => p.id === id);
if (!item) return;

document.getElementById("editingId").value = item.id;
document.getElementById("formHeader").textContent = "Edit Product (" + item.id + ")";
document.getElementById("saveBtn").textContent = "Update Product";

document.getElementById("prodId").value = item.id;
document.getElementById("prodId").disabled = true;
document.getElementById("prodTitle").value = item.title;
document.getElementById("prodCategory").value = item.category;
document.getElementById("prodSlug").value = item.slug;
document.getElementById("prodToken").value = item.token;
document.getElementById("prodPrice").value = item.price;
document.getElementById("prodMrp").value = item.mrp;
document.getElementById("prodStockQty").value = (item.stock_qty !== undefined && item.stock_qty !== null) ? item.stock_qty : 10;
document.getElementById("prodTag").value = item.tag || "";
document.getElementById("prodIsFeatured").checked = item.is_featured === true;
document.getElementById("prodBought").value = item.bought_this_month || "";

let sizesStockObj = { S: true, M: true, L: true, XL: true, XXL: true, "3XL": true };
try {
if (item.sizes_stock) {
sizesStockObj = typeof item.sizes_stock === "string" ? JSON.parse(item.sizes_stock) : item.sizes_stock;
}
} catch (e) {}
setSizeStockPills(sizesStockObj);

let images = [];
try { images = Array.isArray(item.images) ? item.images : JSON.parse(item.images || "[]"); } catch (e) { images = []; }
currentImageList = images;
updateImageFieldFromList();
renderImagePreviews();

let specs = [];
try { specs = Array.isArray(item.specs) ? item.specs : JSON.parse(item.specs || "[]"); } catch (e) { specs = []; }
document.getElementById("prodSpecs").value = specs.join("\n");

const container = document.getElementById("colorsContainer");
container.innerHTML = "";
let colors = [];
try { colors = Array.isArray(item.colors) ? item.colors : JSON.parse(item.colors || "[]"); } catch (e) { colors = []; }
if (colors.length > 0) {
colors.forEach(c => addColorRow(c.name, c.hex));
} else {
addColorRow("Default", "#8A9A86");
}

window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProduct(id) {
if (!confirm("Are you sure you want to delete product " + id + "?")) return;
const res = await supabaseClient.from("products").delete().eq("id", id);
if (res.error) {
alert("Error deleting product: " + res.error.message);
} else {
showToast("Product deleted!");
loadInventory();
}
}

function resetForm() {
document.getElementById("editingId").value = "";
document.getElementById("formHeader").textContent = "Add New Product";
document.getElementById("saveBtn").textContent = "Save Product";
document.getElementById("prodId").disabled = false;
document.getElementById("productForm").reset();
document.getElementById("prodIsFeatured").checked = false;

currentImageList = [];
updateImageFieldFromList();
renderImagePreviews();
setSizeStockPills({ S: true, M: true, L: true, XL: true, XXL: true, "3XL": true });

const container = document.getElementById("colorsContainer");
container.innerHTML = "";
addColorRow("Default", "#8A9A86");
regenerateToken();
}

// 9. ORDERS LOG
async function loadOrdersLog() {
const tbody = document.getElementById("ordersTableBody");
tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:18px;">Loading orders...</td></tr>';

const { data, error } = await supabaseClient
.from("orders")
.select("*")
.order("created_at", { ascending: false })
.limit(50);

if (error) {
tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Failed to load order log.</td></tr>';
return;
}

if (!data || data.length === 0) {
tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--muted);">No WhatsApp order checkouts recorded yet.</td></tr>';
return;
}

tbody.innerHTML = data.map(o => {
const dateStr = new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
const items = Array.isArray(o.items) ? o.items : [];
const itemsText = items.map(i => i.title + " (" + i.color + "/" + i.size + " x" + i.qty + ")").join(", ");

return '<tr>' +
'<td>' + dateStr + '</td>' +
'<td><strong>' + (o.customer_name || '-') + '</strong></td>' +
'<td><a href="https://wa.me/' + (o.customer_phone || '').replace(/[^0-9]/g, '') + '" target="_blank" style="color:var(--accent); font-weight:600;">' + (o.customer_phone || '-') + ' ↗</a></td>' +
'<td>' + (o.delivery_address || '-') + (o.pincode ? ' - ' + o.pincode : '') + '</td>' +
'<td><span class="badge-status ' + (o.payment_method === 'COD' ? 'badge-inactive' : 'badge-active') + '">' + (o.payment_method || 'UPI') + '</span></td>' +
'<td><div><strong>₹' + Number(o.total || 0).toLocaleString("en-IN") + '</strong></div><div style="font-size:0.72rem; color:var(--muted);">' + itemsText + '</div></td>' +
'</tr>';
}).join('');
}

// 10. UTILITIES
function copyToClipboard(text, msg) {
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text).then(function() { showToast(msg); });
} else {
prompt("Copy link:", text);
}
}

function showToast(msg) {
const toast = document.getElementById("adminToast");
toast.textContent = msg;
toast.style.display = "block";
setTimeout(function() { toast.style.display = "none"; }, 2200);
}

document.addEventListener("DOMContentLoaded", function() {
checkAuthSession();
});
</script>
</body>
</html>
