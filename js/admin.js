let cachedProducts = [];

// -------------------------------------------------------------
// 1. AUTHENTICATION & SESSION MANAGEMENT
// -------------------------------------------------------------
async function checkAuthSession() {
const { data: { session } } = await supabase.auth.getSession();
if (session) {
showDashboard(session.user);
} else {
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
document.getElementById("userDisplay").textContent = `Logged in as: ${user.email}`;
loadInventory();
resetForm();
}

async function handleLogin(e) {
e.preventDefault();
const email = document.getElementById("loginEmail").value.trim();
const password = document.getElementById("loginPassword").value;
const errorElem = document.getElementById("loginError");
errorElem.textContent = "Signing in...";

const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
errorElem.textContent = error.message;
} else {
errorElem.textContent = "";
showDashboard(data.user);
}
}

async function handleLogout() {
await supabase.auth.signOut();
showLogin();
}

// -------------------------------------------------------------
// 2. SLUG & TOKEN GENERATORS
// -------------------------------------------------------------
function autoPopulateSlug(title) {
const slugInput = document.getElementById("prodSlug");
if (!document.getElementById("editingId").value) {
slugInput.value = generateSlug(title);
}
}

function regenerateToken() {
document.getElementById("prodToken").value = generateToken("tok");
}

// -------------------------------------------------------------
// 3. DYNAMIC COLOR SWATCH INPUTS
// -------------------------------------------------------------
function addColorRow(name = "", hex = "#8A9A86") {
const container = document.getElementById("colorsContainer");
const div = document.createElement("div");
div.className = "dynamic-row";
div.innerHTML = `
<input type="text" class="input color-name" placeholder="Color Name (e.g. Sage Green)" value="${name}" style="flex: 2;" required />
<input type="color" class="color-picker" value="${hex}" style="width: 44px; height: 38px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer;" />
<button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button>
`;
container.appendChild(div);
}

function getColorsData() {
const rows = document.querySelectorAll("#colorsContainer .dynamic-row");
const colors = [];
rows.forEach(row => {
const name = row.querySelector(".color-name").value.trim();
const hex = row.querySelector(".color-picker").value;
if (name) colors.push({ name, hex });
});
return colors;
}

// -------------------------------------------------------------
// 4. LOAD INVENTORY
// -------------------------------------------------------------
async function loadInventory() {
const tbody = document.getElementById("inventoryTableBody");
tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Loading inventory...</td></tr>`;

const { data, error } = await supabase
.from('products')
.select('*')
.order('created_at', { ascending: false });

if (error) {
console.error("Error loading products:", error);
tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Failed to load products.</td></tr>`;
return;
}

cachedProducts = data || [];
document.getElementById("totalItemsCount").textContent = cachedProducts.length;

if (cachedProducts.length === 0) {
tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--muted);">No products created yet. Use the form above to add your first piece!</td></tr>`;
return;
}

const siteOrigin = window.location.origin;

tbody.innerHTML = cachedProducts.map(p => {
const images = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]');
const firstImg = images[0] || '';
const slugUrl = `${siteOrigin}/?p=${p.slug}`;
const tokenUrl = `${siteOrigin}/?token=${p.token}`;

return `
<tr>
<td>
${firstImg ? `<img src="${firstImg}" class="thumb" alt="${p.title}" />` : '<div class="thumb" style="background:#EAE6DF;"></div>'}
</td>
<td><strong>${p.id}</strong></td>
<td>
<div style="font-weight: 600;">${p.title}</div>
<div style="font-size: 0.72rem; color: var(--muted);">${p.tag || 'No Tag'}</div>
</td>
<td>${p.category}</td>
<td>
<div>₹${Number(p.price).toLocaleString('en-IN')}</div>
<div style="font-size: 0.72rem; color: var(--muted); text-decoration: line-through;">₹${Number(p.mrp).toLocaleString('en-IN')}</div>
</td>
<td>
<div style="display: flex; gap: 4px; flex-direction: column;">
<button class="btn btn-copy btn-sm" onclick="copyToClipboard('${slugUrl}', 'Slug Link copied!')">📋 Slug Link</button>
<button class="btn btn-copy btn-sm" onclick="copyToClipboard('${tokenUrl}', 'Token Link copied!')">🔑 Token Link</button>
</div>
</td>
<td>
<div style="display: flex; gap: 6px;">
<button class="btn btn-copy btn-sm" onclick="editProduct('${p.id}')">Edit</button>
<button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">Delete</button>
</div>
</td>
</tr>
`;
}).join("");
}

// -------------------------------------------------------------
// 5. SAVE PRODUCT (CREATE / UPDATE)
// -------------------------------------------------------------
async function handleSaveProduct(e) {
e.preventDefault();

const id = document.getElementById("prodId").value.trim();
const title = document.getElementById("prodTitle").value.trim();
const category = document.getElementById("prodCategory").value;
const slug = document.getElementById("prodSlug").value.trim();
const token = document.getElementById("prodToken").value.trim();
const price = parseFloat(document.getElementById("prodPrice").value);
const mrp = parseFloat(document.getElementById("prodMrp").value);
const tag = document.getElementById("prodTag").value.trim();
const bought_this_month = document.getElementById("prodBought").value.trim();

// Parse images (comma-separated or line-breaks)
const rawImages = document.getElementById("prodImages").value;
const images = rawImages
.split(/[\n,]/)
.map(url => url.trim())
.filter(url => url.length > 0);

// Parse specs
const rawSpecs = document.getElementById("prodSpecs").value;
const specs = rawSpecs
.split('\n')
.map(s => s.trim())
.filter(s => s.length > 0);

const colors = getColorsData();

const payload = {
id,
title,
category,
slug,
token,
price,
mrp,
tag,
bought_this_month,
images,
colors,
specs,
is_active: true
};

const editingId = document.getElementById("editingId").value;
const saveBtn = document.getElementById("saveBtn");
saveBtn.disabled = true;
saveBtn.textContent = "Saving...";

let response;
if (editingId) {
// Update existing
response = await supabase
.from('products')
.update(payload)
.eq('id', editingId);
} else {
// Insert new
response = await supabase
.from('products')
.insert([payload]);
}

saveBtn.disabled = false;
saveBtn.textContent = "Save Product";

if (response.error) {
alert("Error saving product: " + response.error.message);
} else {
showToast(editingId ? "Product updated successfully!" : "Product added successfully!");
resetForm();
loadInventory();
}
}

// -------------------------------------------------------------
// 6. EDIT & DELETE ACTIONS
// -------------------------------------------------------------
function editProduct(id) {
const item = cachedProducts.find(p => p.id === id);
if (!item) return;

document.getElementById("editingId").value = item.id;
document.getElementById("formHeader").textContent = `Edit Product (${item.id})`;
document.getElementById("saveBtn").textContent = "Update Product";

document.getElementById("prodId").value = item.id;
document.getElementById("prodId").disabled = true; // Don't change PK
document.getElementById("prodTitle").value = item.title;
document.getElementById("prodCategory").value = item.category;
document.getElementById("prodSlug").value = item.slug;
document.getElementById("prodToken").value = item.token;
document.getElementById("prodPrice").value = item.price;
document.getElementById("prodMrp").value = item.mrp;
document.getElementById("prodTag").value = item.tag || "";
document.getElementById("prodBought").value = item.bought_this_month || "";

const images = Array.isArray(item.images) ? item.images : JSON.parse(item.images || '[]');
document.getElementById("prodImages").value = images.join("\n");

const specs = Array.isArray(item.specs) ? item.specs : JSON.parse(item.specs || '[]');
document.getElementById("prodSpecs").value = specs.join("\n");

// Populate colors
const container = document.getElementById("colorsContainer");
container.innerHTML = "";
const colors = Array.isArray(item.colors) ? item.colors : JSON.parse(item.colors || '[]');
if (colors.length > 0) {
colors.forEach(c => addColorRow(c.name, c.hex));
} else {
addColorRow();
}

window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProduct(id) {
if (!confirm(`Are you sure you want to delete product ${id}?`)) return;

const { error } = await supabase
.from('products')
.delete()
.eq('id', id);

if (error) {
alert("Error deleting product: " + error.message);
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

// Reset colors container with 1 default row
const container = document.getElementById("colorsContainer");
container.innerHTML = "";
addColorRow("Default", "#8A9A86");

// Generate a fresh token
regenerateToken();
}

// -------------------------------------------------------------
// 7. UTILITIES
// -------------------------------------------------------------
function copyToClipboard(text, msg) {
navigator.clipboard.writeText(text).then(() => {
showToast(msg);
}).catch(() => {
prompt("Copy link:", text);
});
}

function showToast(msg) {
const toast = document.getElementById("adminToast");
toast.textContent = msg;
toast.style.display = "block";
setTimeout(() => {
toast.style.display = "none";
}, 2200);
}

// Check session on load
document.addEventListener("DOMContentLoaded", () => {
checkAuthSession();
});
