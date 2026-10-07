// store.js - KRUSHIV ATELIER (Complete Storefront Controller)

// -------------------------------------------------------------
// 1. STORE CONFIGURATION
// -------------------------------------------------------------
const WHATSAPP_PHONE = "919876543210"; // Enter your WhatsApp phone number with country code
const CURRENCY = "₹";
const COD_FEE = 50;

// Dynamic Config & State from Supabase
let activeCoupons = {};
let blockedCodPincodes = [];
let countdownTimerInterval = null;
let heroBannerImages = [];
let heroBannerTimer = null;
let currentHeroBannerIndex = 0;
let topBarMessages = [];
let currentTopBarIndex = 0;
let topBarCrossfadeTimer = null;

// Reviews
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
// 2. SOCIAL PROOF & GHOST SKELETON HELPERS
// -------------------------------------------------------------
function getDeterministicReviews(idStr) {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  return 85 + Math.abs(hash % 265); // 85 to 350 reviews
}

function getDeterministicBought(idStr) {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 3) + hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const num = 120 + Math.abs(hash % 480);
  return `${num}+ bought this month`;
}

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

// -------------------------------------------------------------
// 3. STORE SETTINGS & TOP BAR CROSSFADE (SPLIT ON FULL STOPS)
// -------------------------------------------------------------
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
  bar.innerHTML = `<span class="top-bar-crossfade active">${topBarMessages[0]}</span>`;

  if (topBarCrossfadeTimer) clearInterval(topBarCrossfadeTimer);

  topBarCrossfadeTimer = setInterval(() => {
    const activeSpan = bar.querySelector(".top-bar-crossfade");
    if (activeSpan) {
      activeSpan.classList.remove("active");
      setTimeout(() => {
        currentTopBarIndex = (currentTopBarIndex + 1) % topBarMessages.length;
        activeSpan.textContent = topBarMessages[currentTopBarIndex];
        activeSpan.classList.add("active");
      }, 400);
    }
  }, 4500);
}

function startCountdownTimer(targetIso) {
  const container = document.getElementById("countdownTimerContainer");
  if (!container) return;

  const targetDate = new Date(targetIso).getTime();
  if (isNaN(targetDate)) return;

  container.style.display = "block";

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
    const { data } = await supabaseClient
      .from("coupons")
      .select("*")
      .eq("is_active", true);

    if (data && data.length > 0) {
      activeCoupons = {};
      data.forEach(c => {
        activeCoupons[c.code.toUpperCase()] = {
          code: c.code.toUpperCase(),
          type: c.type,
          val: Number(c.val),
          minOrder: Number(c.min_order || 0),
          desc: c.description || (c.type === "percent" ? `${c.val}% OFF` : `₹${c.val} FLAT OFF`)
        };
      });
      renderCartCouponsList();
    }
  } catch (e) {
    console.warn("Could not load coupons from DB, using fallback", e);
  }
}

function renderCartCouponsList() {
  const container = document.getElementById("quickCouponsList");
  if (!container) return;

  const codes = Object.keys(activeCoupons);
  if (codes.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = codes.map(c => {
    const item = activeCoupons[c];
    return `
      <div class="coupon-pill" onclick="quickCoupon('${item.code}')">
        <strong>${item.code}</strong> • ${item.desc}
      </div>
    `;
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

    if (data && data.length > 0) {
      products = data.map(p => ({
        id: p.id,
        slug: p.slug || generateSlug(p.title),
        token: p.token || '',
        title: p.title,
        category: p.category,
        price: Number(p.price),
        mrp: Number(p.mrp),
        tag: p.tag || '',
        stock_qty: p.stock_qty !== undefined ? Number(p.stock_qty) : 10,
        sizes_stock: p.sizes_stock || { "S": 10, "M": 10, "L": 10, "XL": 10, "XXL": 10, "3XL": 10 },
        rating: p.rating ? Number(p.rating).toFixed(1) : "4.9",
        reviews: p.reviews ? Number(p.reviews) : getDeterministicReviews(p.id),
        bought_this_month: p.bought_this_month || getDeterministicBought(p.id),
        images: Array.isArray(p.images) ? p.images : [],
        colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: "Standard", hex: "#12100F" }],
        specs: Array.isArray(p.specs) && p.specs.length > 0 ? p.specs : ["Pure Breathable Fabric", "Artisanal Handcraft", "Gentle Dry Clean Only"],
        is_featured: !!p.is_featured
      }));

      renderCatalog();
      handleUrlRouting();
    } else {
      const grid = document.getElementById("productGrid");
      if (grid) {
        grid.innerHTML = `
          <div class="empty-grid-msg">
            <div style="font-size: 2rem; margin-bottom: 8px;">✨</div>
            <div style="font-weight: 600; font-size: 1.1rem; color: var(--noir);">Collection Refresh in Progress</div>
            <div style="font-size: 0.85rem; color: var(--muted); margin-top: 6px;">New couture pieces are being cataloged. Please check back shortly!</div>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error("Supabase load error:", err);
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

  const cleanImages = (heroBannerImages || []).map(formatDirectImageUrl).filter(Boolean);

  if (cleanImages.length === 0) {
    container.innerHTML = "";
    return;
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
      '<img id="heroEdgeImg" class="hero-edge-img visible" src="' + cleanImages[0] + '" alt="KRUSHIV Hero" referrerpolicy="no-referrer" loading="eager" fetchpriority="high" />' +
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

  if (cleanImages.length > 1) {
    heroBannerTimer = setInterval(() => {
      setHeroBannerIndex((currentHeroBannerIndex + 1) % cleanImages.length);
    }, 4500);
  }
}

function handleHeroBannerClick() {
  if (currentHeroBannerIndex === 0) {
    scrollSmoothToProducts();
  } else {
    const cleanImages = (heroBannerImages || []).map(formatDirectImageUrl).filter(Boolean);
    if (cleanImages.length > 0) {
      setHeroBannerIndex((currentHeroBannerIndex + 1) % cleanImages.length);
    }
  }
}

function setHeroBannerIndex(index) {
  const cleanImages = (heroBannerImages || []).map(formatDirectImageUrl).filter(Boolean);
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
    const matched = products.find(p => p.slug === slugParam);
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
    const matched = products.find(p => p.slug === slug);
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
    : products.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-grid-msg">
        <div style="font-size: 1.5rem; margin-bottom: 6px;">👗</div>
        <div>No pieces available in "${currentCategory}" right now.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(item => {
    const offPct = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
    const firstImg = item.images.length > 0
      ? item.images[0]
      : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop';

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
            ${isOutOfStock ? 'View (Sold Out)' : 'Add to Cart'}
          </button>
        </div>
      </article>
    `;
  }).join("");

  const durations = [3200, 4200, 3600, 4800, 3900, 5200];
  list.forEach((item, index) => {
    if (item.images.length > 1) {
      setupCardImageCycle(item.id, item.images.length, (index * 600) % 2400, durations[index % durations.length]);
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

function setupCardImageCycle(id, totalSlides, startDelay, cycleSpeed) {
  let activeIndex = 0;
  const timeoutId = setTimeout(() => {
    const intervalId = setInterval(() => {
      const track = document.getElementById(`track-${id}`);
      const dotsWrap = document.getElementById(`dots-${id}`);
      if (!track) {
        clearInterval(intervalId);
        return;
      }
      activeIndex = (activeIndex + 1) % totalSlides;
      track.style.transform = `translateX(-${activeIndex * 100}%)`;
      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll(".dot");
        dots.forEach((d, i) => d.classList.toggle("active", i === activeIndex));
      }
    }, cycleSpeed);

    carouselTimers[id] = { interval: intervalId, timeout: null };
  }, startDelay);

  carouselTimers[id] = { timeout: timeoutId, interval: null };
}

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(btn => {
    btn.classList.toggle("active", btn.textContent.includes(cat) || (cat === "All" && btn.textContent.includes("All")));
  });
  renderCatalog();
}

// -------------------------------------------------------------
// 8. PRODUCT DETAILS PAGE (PDP)
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
    boughtElem.style.background = "#F3EFEA";
    boughtElem.style.color = "#8A6D3B";
    boughtElem.style.display = "inline-block";
  } else {
    boughtElem.style.display = "none";
  }

  document.getElementById("pdpPriceCurrent").textContent = `${CURRENCY}${item.price.toLocaleString('en-IN')}`;
  const mrpEl = document.getElementById("pdpPriceOriginal");
  const discountEl = document.getElementById("pdpDiscountTag");
  if (item.mrp > item.price) {
    mrpEl.textContent = `${CURRENCY}${item.mrp.toLocaleString('en-IN')}`;
    mrpEl.style.display = "inline";
    const pct = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    discountEl.textContent = `${pct}% OFF`;
    discountEl.style.display = "inline-block";
  } else {
    mrpEl.style.display = "none";
    discountEl.style.display = "none";
  }

  // Multi-image peek slider with clickable dots
  const track = document.getElementById("pdpSliderTrack");
  const dotsContainer = document.getElementById("pdpDotsContainer");
  const imgs = item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop'];

  track.innerHTML = imgs.map(url => `
    <div class="pdp-slide">
      <img src="${url}" alt="${item.title}">
    </div>
  `).join("");

  if (dotsContainer) {
    dotsContainer.innerHTML = imgs.map((_, i) => `
      <span class="pdp-dot ${i === 0 ? 'active' : ''}" onclick="scrollPdpSlide(${i})"></span>
    `).join("");
  }

  track.onscroll = () => {
    const slideWidth = track.clientWidth * 0.85;
    const activeIndex = Math.round(track.scrollLeft / slideWidth);
    if (dotsContainer) {
      dotsContainer.querySelectorAll(".pdp-dot").forEach((d, i) => {
        d.classList.toggle("active", i === activeIndex);
      });
    }
  };

  // Color Swatches
  const colorArea = document.getElementById("pdpColorSwatches");
  colorArea.innerHTML = (item.colors || []).map((col, idx) => `
    <button class="color-swatch ${idx === 0 ? 'active' : ''}" style="background-color: ${col.hex};" title="${col.name}" onclick="pickColor('${col.name}', this)"></button>
  `).join("");
  document.getElementById("pdpSelectedColorName").textContent = currentColor;

  // Size Options & Size-Level Stock check
  const sizeWrap = document.getElementById("pdpSizePills");
  const allSizes = ["S", "M", "L", "XL", "XXL", "3XL"];
  const stockMap = item.sizes_stock || {};

  let firstValidSize = null;
  sizeWrap.innerHTML = allSizes.map(sz => {
    const qtyForSize = stockMap[sz] !== undefined ? Number(stockMap[sz]) : item.stock_qty;
    const isOut = qtyForSize <= 0;
    if (!isOut && !firstValidSize) firstValidSize = sz;

    return `
      <button 
        class="size-pill ${isOut ? 'out-of-stock' : ''}" 
        onclick="pickSize('${sz}', this, ${isOut})"
        ${isOut ? 'disabled title="Size out of stock"' : ''}
      >
        <span>${sz}</span>
        ${isOut ? '<span class="size-out-line"></span>' : ''}
      </button>
    `;
  }).join("");

  currentSize = firstValidSize || "S";
  const defaultPill = Array.from(sizeWrap.querySelectorAll(".size-pill")).find(p => p.textContent.trim() === currentSize);
  if (defaultPill) defaultPill.classList.add("active");

  // Specs & Highlights
  const specsList = document.getElementById("pdpSpecsList");
  specsList.innerHTML = (item.specs || []).map(s => `<li>${s}</li>`).join("");

  // Sticky Bar & Mobile Sync
  const isGlobalSoldOut = item.stock_qty <= 0;
  const stickyOrderBtn = document.getElementById("stickyOrderBtn");
  const stickyBagBtn = document.getElementById("stickyBagBtn");
  const desktopOrderBtn = document.getElementById("desktopOrderBtn");
  const desktopBagBtn = document.getElementById("desktopBagBtn");

  if (isGlobalSoldOut) {
    if (stickyOrderBtn) { stickyOrderBtn.disabled = true; stickyOrderBtn.textContent = "Sold Out"; }
    if (stickyBagBtn) { stickyBagBtn.disabled = true; }
    if (desktopOrderBtn) { desktopOrderBtn.disabled = true; desktopOrderBtn.textContent = "Sold Out"; }
    if (desktopBagBtn) { desktopBagBtn.disabled = true; }
  } else {
    if (stickyOrderBtn) { stickyOrderBtn.disabled = false; stickyOrderBtn.textContent = "Order on WhatsApp"; }
    if (stickyBagBtn) { stickyBagBtn.disabled = false; }
    if (desktopOrderBtn) { desktopOrderBtn.disabled = false; desktopOrderBtn.textContent = "Order on WhatsApp"; }
    if (desktopBagBtn) { desktopBagBtn.disabled = false; }
  }

  // Pre-fill delivery info if logged in
  if (currentCustomer) {
    loadCustomerProfile(currentCustomer.id);
  }

  renderCustomerReviews();
  renderSimilarProducts(item);

  // Switch View
  document.getElementById("homeView").classList.remove("active");
  document.getElementById("pdpView").classList.add("active");
  document.body.classList.add("pdp-active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (window.history.pushState) {
    const url = item.slug ? `/p/${item.slug}` : `?p=${item.id}`;
    window.history.pushState({ page: 'pdp', id: item.id }, '', url);
  }

  if (window.lucide) window.lucide.createIcons();
}

function scrollPdpSlide(index) {
  const track = document.getElementById("pdpSliderTrack");
  if (!track) return;
  const slideWidth = track.clientWidth * 0.85;
  track.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
}

function pickColor(name, elem) {
  currentColor = name;
  document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
  elem.classList.add("active");
  document.getElementById("pdpSelectedColorName").textContent = name;
}

function pickSize(sz, elem, isOut) {
  if (isOut) return;
  currentSize = sz;
  document.querySelectorAll(".size-pill").forEach(s => s.classList.remove("active"));
  elem.classList.add("active");
}

function checkPdpPincode() {
  const input = document.getElementById("pdpPincodeInput");
  const result = document.getElementById("pdpPincodeResult");
  const val = (input.value || "").trim();

  if (!/^\d{6}$/.test(val)) {
    result.style.color = "#B91C1C";
    result.textContent = "Please enter a valid 6-digit Indian pincode.";
    return;
  }

  if (blockedCodPincodes.includes(val)) {
    result.style.color = "#D97706";
    result.innerHTML = `✓ Delivery Available to ${val} via <strong>Prepaid UPI Only</strong> (COD unavailable).`;
  } else {
    result.style.color = "#2E7D32";
    result.innerHTML = `✓ Free Delivery & <strong>Cash on Delivery (COD) Available</strong> to ${val}!`;
  }
}

function renderCustomerReviews() {
  const container = document.getElementById("pdpReviewsList");
  container.innerHTML = customerReviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-name">${r.name}</span>
        <span class="review-city">${r.city} • Verified Buyer</span>
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
  document.getElementById("homeView").classList.add("active");
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
  document.getElementById("trackModal").classList.add("active");
  document.getElementById("trackResult").innerHTML = "";
  document.getElementById("trackOrderInput").value = "";
}

function closeTrackModal() {
  document.getElementById("trackModal").classList.remove("active");
}

function lookupOrderStatus() {
  const input = document.getElementById("trackOrderInput").value.trim().toUpperCase();
  const res = document.getElementById("trackResult");
  if (!input) {
    res.innerHTML = '<span style="color:red;">Please enter your Order ID.</span>';
    return;
  }

  res.innerHTML = `
    <div style="background:var(--bg-soft); padding:16px; border-radius:4px; font-size:0.85rem; line-height:1.6;">
      <div style="font-weight:700; color:var(--noir); margin-bottom:4px;">Status for Order #${input}</div>
      <div style="color:#2E7D32; font-weight:600;">✓ In Process — Dispatched via Bluedart</div>
      <div style="font-size:0.75rem; color:var(--muted); margin-top:4px;">Direct tracking updates will be shared to your WhatsApp number.</div>
    </div>
  `;
}

function openLegalModal(type) {
  const modal = document.getElementById("legalModal");
  const title = document.getElementById("legalModalTitle");
  const body = document.getElementById("legalModalBody");

  if (type === "privacy") {
    title.textContent = "Privacy Policy";
    body.innerHTML = `
      <p>At KRUSHIV, we value your trust. We collect personal details strictly for order fulfillment, delivery logistics, and doorstep exchanges.</p>
      <p>Your payment information and phone number are handled securely and never sold to third parties.</p>
    `;
  } else if (type === "terms") {
    title.textContent = "Terms of Service";
    body.innerHTML = `
      <p>All KRUSHIV couture pieces are made under strict artisan supervision. Colors may vary slightly due to digital lighting and screen calibration.</p>
      <p>Orders placed through WhatsApp are confirmed after verifying stock and dispatch pin codes.</p>
    `;
  } else if (type === "shipping") {
    title.textContent = "Shipping & Exchanges";
    body.innerHTML = `
      <p><strong>Shipping:</strong> Standard delivery takes 3–5 working days across India. Free shipping on all orders.</p>
      <p><strong>Exchanges:</strong> We offer a hassle-free 7-day doorstep size exchange. WhatsApp our concierge team for instant pickup scheduling.</p>
    `;
  }

  modal.classList.add("active");
}

function closeLegalModal() {
  document.getElementById("legalModal").classList.remove("active");
}

function toggleSidebar(open) {
  document.getElementById("mobileSidebar").classList.toggle("open", open);
  document.getElementById("sidebarOverlay").classList.toggle("open", open);
}

// -------------------------------------------------------------
// 10. SHOPPING BAG & CHECKOUT
// -------------------------------------------------------------
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
    appliedCoupon = null;
    status.textContent = "";
    updateBagDisplay();
    return;
  }

  const rule = activeCoupons[code];
  if (!rule) {
    status.style.color = "#C0392B";
    status.textContent = "Invalid coupon code.";
    appliedCoupon = null;
    updateBagDisplay();
    return;
  }

  if (subtotal < rule.minOrder) {
    status.style.color = "#C0392B";
    status.textContent = `Min order of ${CURRENCY}${rule.minOrder.toLocaleString('en-IN')} required.`;
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
  triggerCloudCartSync();
  const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

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

  const codFee = selectedPayment === "COD" ? COD_FEE : 0;
  const codRow = document.getElementById("ledgerCodRow");
  if (codFee > 0) {
    codRow.style.display = "flex";
  } else {
    codRow.style.display = "none";
  }

  const finalTotal = Math.max(0, realSubtotal - discountAmount + codFee);
  document.getElementById("ledgerTotal").textContent = `${CURRENCY}${finalTotal.toLocaleString('en-IN')}`;

  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById("drawerItemsList");
  const footer = document.querySelector(".drawer-footer");

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
    <div class="cart-item-row">
      <img src="${item.images[0] || ''}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-meta">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-specs">${item.color} / ${item.size}</div>
        <div class="cart-item-price">${CURRENCY}${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-qty-bar">
          <button class="btn-qty" onclick="changeQty(${idx}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="btn-qty" onclick="changeQty(${idx}, 1)">+</button>
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
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// -------------------------------------------------------------
// 11. WHATSAPP ORDER SUBMISSION & AUDIT LOGGING
// -------------------------------------------------------------
async function submitOrderToWhatsApp() {
  if (cart.length === 0) {
    alert("Your shopping bag is empty.");
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const addr1 = document.getElementById("custAddress").value.trim();
  const nearby = document.getElementById("custNearby").value.trim();
  const pincode = document.getElementById("custPincode").value.trim();

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

  try {
    await supabaseClient.from("orders").insert([{
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
  } catch (e) {
    console.warn("Audit order log error:", e);
  }

  const itemsSummary = cart.map((item, i) =>
    `${i + 1}. *${item.title}*\n • Color: ${item.color}\n • Size: ${item.size}\n • Qty: ${item.qty}\n • Price: ${CURRENCY}${item.price * item.qty}`
  ).join("\n\n");

  const message = `✨ *NEW ORDER REQUEST — KRUSHIV ATELIER* ✨\n` +
    `-----------------------------------------\n` +
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
let currentCustomer = null;
let currentAuthTab = "signin";
let currentAccSubtab = "address";
let cloudCartDebounce = null;

function parseLoginIdentifier(input) {
  const trimmed = (input || "").trim();
  const digitsOnly = trimmed.replace(/\D/g, "");
  let phone10 = null;
  if (digitsOnly.length === 10) {
    phone10 = digitsOnly;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    phone10 = digitsOnly.slice(2);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    phone10 = digitsOnly.slice(1);
  }

  if (phone10) {
    return {
      type: "phone",
      phone: phone10,
      email: phone10 + "@krushiv.internal"
    };
  }

  return {
    type: "email",
    phone: "",
    email: trimmed.toLowerCase()
  };
}

async function initCustomerAuth() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      handleCustomerSessionActive(session.user);
    } else {
      handleCustomerSessionLoggedOut();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        handleCustomerSessionActive(session.user);
      } else {
        handleCustomerSessionLoggedOut();
      }
    });
  } catch (err) {
    console.warn("Auth initialization note:", err);
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

  const metaName = user.user_metadata?.full_name || "Customer";
  const emailOrPhone = user.email && user.email.endsWith("@krushiv.internal")
    ? user.email.replace("@krushiv.internal", "")
    : user.email;

  const sidebarName = document.getElementById("sidebarUserName");
  const sidebarAction = document.getElementById("sidebarUserAction");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  if (sidebarName) sidebarName.textContent = metaName;
  if (sidebarAction) sidebarAction.textContent = "My Account (" + emailOrPhone + ") →";
  if (sidebarAvatar) sidebarAvatar.textContent = metaName.charAt(0).toUpperCase();

  const accName = document.getElementById("accUserName");
  const accIdent = document.getElementById("accUserIdentifier");
  const accAvatar = document.getElementById("accUserAvatar");
  if (accName) accName.textContent = metaName;
  if (accIdent) accIdent.textContent = emailOrPhone;
  if (accAvatar) accAvatar.textContent = metaName.charAt(0).toUpperCase();

  loadCustomerProfile(user.id);
  syncCustomerCartOnLogin(user.id);
  loadCustomerOrders(user.id);
}

function handleCustomerSessionLoggedOut() {
  currentCustomer = null;
  const dot = document.getElementById("headerAuthDot");
  if (dot) dot.style.display = "none";

  const loggedOutView = document.getElementById("authLoggedOutView");
  const loggedInView = document.getElementById("authLoggedInView");
  if (loggedOutView) loggedOutView.style.display = "block";
  if (loggedInView) loggedInView.style.display = "none";

  const sidebarName = document.getElementById("sidebarUserName");
  const sidebarAction = document.getElementById("sidebarUserAction");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  if (sidebarName) sidebarName.textContent = "Welcome to KRUSHIV";
  if (sidebarAction) sidebarAction.textContent = "Sign In / My Account →";
  if (sidebarAvatar) sidebarAvatar.textContent = "K";
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
  const identVal = document.getElementById("authIdentifier").value.trim();
  const passVal = document.getElementById("authPassword").value;
  const nameVal = document.getElementById("authName") ? document.getElementById("authName").value.trim() : "";
  const errBox = document.getElementById("authErrorAlert");
  const submitBtn = document.getElementById("authSubmitBtn");

  if (errBox) errBox.style.display = "none";

  if (!identVal || !passVal) {
    if (errBox) { errBox.textContent = "Please fill in all required fields."; errBox.style.display = "block"; }
    return;
  }

  const parsed = parseLoginIdentifier(identVal);
  submitBtn.disabled = true;
  submitBtn.textContent = "Please wait...";

  try {
    if (currentAuthTab === "signup") {
      if (!nameVal) {
        throw new Error("Please enter your full name.");
      }
      if (passVal.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email: parsed.email,
        password: passVal,
        options: {
          data: {
            full_name: nameVal,
            phone: parsed.phone || ""
          }
        }
      });

      if (error) throw error;

      if (data && data.user) {
        await supabaseClient.from("profiles").upsert({
          id: data.user.id,
          full_name: nameVal,
          phone: parsed.phone || "",
          email: parsed.type === "email" ? parsed.email : ""
        });
        showToast("Account created! Welcome to KRUSHIV.");
        if (data.session) handleCustomerSessionActive(data.user);
      }
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: parsed.email,
        password: passVal
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Incorrect email/mobile or password. Please try again.");
        }
        throw error;
      }

      showToast("Signed in! Your bag and address are synced.");
      if (data && data.user) handleCustomerSessionActive(data.user);
    }
  } catch (err) {
    if (errBox) {
      errBox.textContent = err.message || "Authentication failed. Please try again.";
      errBox.style.display = "block";
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = currentAuthTab === "signup" ? "Create Account" : "Sign In to KRUSHIV";
  }
}

async function handleCustomerLogout() {
  try {
    await supabaseClient.auth.signOut();
    handleCustomerSessionLoggedOut();
    showToast("Signed out successfully.");
    toggleAccountDrawer(false);
  } catch (err) {
    console.error("Logout error:", err);
  }
}

async function syncCustomerCartOnLogin(userId) {
  try {
    const { data } = await supabaseClient
      .from("customer_carts")
      .select("items")
      .eq("user_id", userId)
      .maybeSingle();

    let cloudCart = (data && Array.isArray(data.items)) ? data.items : [];

    if (cart.length > 0) {
      cart.forEach(localItem => {
        const existing = cloudCart.find(c => c.id === localItem.id && c.size === localItem.size && c.color === localItem.color);
        if (existing) {
          existing.qty = Math.max(existing.qty, localItem.qty);
        } else {
          cloudCart.push(localItem);
        }
      });
      await supabaseClient.from("customer_carts").upsert({
        user_id: userId,
        items: cloudCart,
        updated_at: new Date().toISOString()
      });
    }

    cart = cloudCart;
    updateBagDisplay();
  } catch (err) {
    console.warn("Cart sync note:", err);
  }
}

function triggerCloudCartSync() {
  if (!currentCustomer) return;
  if (cloudCartDebounce) clearTimeout(cloudCartDebounce);
  cloudCartDebounce = setTimeout(async () => {
    try {
      await supabaseClient.from("customer_carts").upsert({
        user_id: currentCustomer.id,
        items: cart,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Cloud cart save error:", e);
    }
  }, 1000);
}

async function loadCustomerProfile(userId) {
  try {
    const { data } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      if (document.getElementById("accFullName")) document.getElementById("accFullName").value = data.full_name || "";
      if (document.getElementById("accPhone")) document.getElementById("accPhone").value = data.phone || "";
      if (document.getElementById("accAddress")) document.getElementById("accAddress").value = data.address || "";
      if (document.getElementById("accLandmark")) document.getElementById("accLandmark").value = data.landmark || "";
      if (document.getElementById("accPincode")) document.getElementById("accPincode").value = data.pincode || "";

      if (document.getElementById("custName") && !document.getElementById("custName").value) {
        document.getElementById("custName").value = data.full_name || "";
      }
      if (document.getElementById("custPhone") && !document.getElementById("custPhone").value) {
        document.getElementById("custPhone").value = data.phone || "";
      }
      if (document.getElementById("custAddress") && !document.getElementById("custAddress").value) {
        document.getElementById("custAddress").value = data.address || "";
      }
      if (document.getElementById("custNearby") && !document.getElementById("custNearby").value) {
        document.getElementById("custNearby").value = data.landmark || "";
      }
      if (document.getElementById("custPincode") && !document.getElementById("custPincode").value) {
        document.getElementById("custPincode").value = data.pincode || "";
      }
    }
  } catch (err) {
    console.warn("Profile load note:", err);
  }
}

async function handleSaveCustomerAddress(e) {
  e.preventDefault();
  if (!currentCustomer) return;

  const btn = document.getElementById("btnSaveAddress");
  btn.disabled = true;
  btn.textContent = "Saving...";

  const name = document.getElementById("accFullName").value.trim();
  const phone = document.getElementById("accPhone").value.trim();
  const address = document.getElementById("accAddress").value.trim();
  const landmark = document.getElementById("accLandmark").value.trim();
  const pincode = document.getElementById("accPincode").value.trim();

  try {
    const { error } = await supabaseClient.from("profiles").upsert({
      id: currentCustomer.id,
      full_name: name,
      phone: phone,
      address: address,
      landmark: landmark,
      pincode: pincode,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    if (document.getElementById("custName")) document.getElementById("custName").value = name;
    if (document.getElementById("custPhone")) document.getElementById("custPhone").value = phone;
    if (document.getElementById("custAddress")) document.getElementById("custAddress").value = address;
    if (document.getElementById("custNearby")) document.getElementById("custNearby").value = landmark;
    if (document.getElementById("custPincode")) document.getElementById("custPincode").value = pincode;

    showToast("✓ Delivery details saved!");
  } catch (err) {
    alert("Could not save address: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Delivery Details";
  }
}

async function loadCustomerOrders(userId) {
  const container = document.getElementById("customerOrdersList");
  if (!container) return;

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:var(--muted); font-size:0.85rem;">
          <div style="font-size:1.8rem; margin-bottom:6px;">📦</div>
          <div>No past orders found.</div>
          <div style="font-size:0.75rem; margin-top:4px;">Orders placed on WhatsApp while logged in will show here!</div>
        </div>
      `;
      return;
    }

    container.innerHTML = data.map(ord => {
      const dateStr = ord.created_at ? new Date(ord.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "Recent";
      const itemsList = Array.isArray(ord.items) 
        ? ord.items.map(it => it.title + " (" + (it.size || "Free") + ") ×" + it.qty).join(", ")
        : "Order Pieces";

      return `
        <div class="order-history-card">
          <div class="order-history-header">
            <span class="order-history-id">Order #${String(ord.id).slice(0, 8)}</span>
            <span class="order-history-date">${dateStr}</span>
          </div>
          <div class="order-history-items">${escapeHtml(itemsList)}</div>
          <div class="order-history-footer">
            <span class="order-status-pill">${escapeHtml(ord.payment_method || 'WhatsApp Order')}</span>
            <span style="font-weight:700; color:var(--noir);">₹${ord.total || 0}</span>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    container.innerHTML = '<div style="color:red; text-align:center; padding:15px; font-size:0.8rem;">Failed to load order history.</div>';
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
