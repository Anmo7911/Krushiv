let catalogData = [];
let currentCategory = "All";
let cart = JSON.parse(localStorage.getItem("zaya_cart") || "[]");

async function initCatalog() {
  updateBagDisplay();
  const { data: products, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !products || products.length === 0) {
    document.getElementById("productGrid").innerHTML = "<p style='padding:20px;'>No pieces available right now.</p>";
    return;
  }

  catalogData = products;
  renderGrid();
  checkAuth();
}

function renderGrid() {
  const filtered = currentCategory === "All" 
    ? catalogData 
    : catalogData.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());

  const grid = document.getElementById("productGrid");
  grid.innerHTML = filtered.map(item => {
    const defaultColor = item.colors[0] || {};
    const imgUrl = defaultColor.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c";
    const colorParam = defaultColor.name ? `?color=${encodeURIComponent(defaultColor.name.toLowerCase().replace(/\s+/g, '-'))}` : "";
    const offPct = Math.round(((item.mrp - item.price) / item.mrp) * 100);

    return `
      <article class="prod-card">
        <a href="/product/${item.token}${colorParam}" class="card-img-wrap">
          ${item.tag ? `<span class="tag-chip">${item.tag}</span>` : ""}
          <img src="${imgUrl}" alt="${item.title}" loading="lazy" />
        </a>
        <div class="prod-info">
          <div class="rating-row">
            <span class="rating-stars">★ 4.9</span>
            <span class="rating-count">(180+)</span>
          </div>
          <span class="prod-cat">${item.category}</span>
          <a href="/product/${item.token}${colorParam}" class="prod-name">${item.title}</a>
          <div class="prod-price-row">
            <span class="val-sale">₹${Number(item.price).toLocaleString('en-IN')}</span>
            <span class="val-mrp">₹${Number(item.mrp).toLocaleString('en-IN')}</span>
            <span class="val-off">${offPct}% OFF</span>
          </div>
          <button class="btn-add-cart-single" onclick="window.location.href='/product/${item.token}${colorParam}'">
            Select Size & Color
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(b => {
    b.classList.toggle("active", b.textContent.includes(cat) || (cat === "All" && b.textContent.includes("All")));
  });
  renderGrid();
  toggleSidebar(false);
}

function toggleSidebar(open) {
  document.getElementById("mobileSidebar").classList.toggle("open", open);
  document.getElementById("sidebarOverlay").classList.toggle("open", open);
}

function toggleBagDrawer(open) {
  document.getElementById("bagDrawer").classList.toggle("open", open);
  document.getElementById("drawerScrim").classList.toggle("open", open);
}

function updateBagDisplay() {
  const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  document.getElementById("headerBagCount").textContent = totalCount;
  document.getElementById("drawerCount").textContent = totalCount;
  document.getElementById("ledgerSubtotal").textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById("ledgerTotal").textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  
  const container = document.getElementById("bagItemsContainer");
  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:30px; color:var(--muted);">Your shopping bag is empty.</p>`;
    return;
  }

  container.innerHTML = cart.map((item, idx) => `
    <div class="bag-row">
      <div class="bag-row-thumb"><img src="${item.image}" alt="${item.title}"></div>
      <div class="bag-row-info">
        <div style="font-size:0.84rem; font-weight:600;">${item.title}</div>
        <div style="font-size:0.72rem; color:var(--muted);">Color: <strong>${item.color}</strong> | Size: <strong>${item.size}</strong></div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <span style="font-weight:700;">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
          <div class="qty-wrap">
            <button class="step-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span>${item.qty}</span>
            <button class="step-btn" onclick="changeQty(${idx}, 1)">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  localStorage.setItem("zaya_cart", JSON.stringify(cart));
  updateBagDisplay();
}

function submitOrderToWhatsApp() {
  if (cart.length === 0) return alert("Bag is empty");
  const name = document.getElementById("custName").value.trim();
  const addr = document.getElementById("custAddr1").value.trim();
  const pin = document.getElementById("custPincode").value.trim();
  const phone = document.getElementById("custPhone").value.trim();

  if (!name || !addr || pin.length !== 6 || phone.length !== 10) {
    return alert("Please fill valid delivery details.");
  }

  const items = cart.map(i => `• ${i.title} (${i.color} / ${i.size}) x${i.qty} - ₹${i.price * i.qty}`).join("\n");
  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const msg = `✨ *NEW ORDER — ZAYA* ✨\n\n*Customer:*\n${name}\n${phone}\n${addr}, Pincode: ${pin}\n\n*Items:*\n${items}\n\n*Total Payable: ₹${total}*`;

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
}

function openTrackModal() { document.getElementById("trackModal").style.display = "flex"; }
function closeTrackModalDirect() { document.getElementById("trackModal").style.display = "none"; }
function closeTrackModal(e) { if (e.target.id === "trackModal") closeTrackModalDirect(); }
function submitTrackingInquiry() {
  const val = document.getElementById("trackInput").value.trim();
  if (!val) return alert("Enter order or phone number");
  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Track order: " + val)}`, "_blank");
}

async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const link = document.getElementById("authSideLink");
  if (session) {
    link.textContent = "Sign Out";
    link.onclick = async () => { await supabaseClient.auth.signOut(); window.location.reload(); };
  }
}

initCatalog();
