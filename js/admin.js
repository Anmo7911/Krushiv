// js/admin.js

let cachedProducts = [];

// 1. AUTHENTICATION & SESSION MANAGEMENT
async function checkAuthSession() {
  try {
    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session && data.session.user) {
      showDashboard(data.session.user);
    } else {
      showLogin();
    }
  } catch (err) {
    console.error("Session check error:", err);
    showLogin();
  }
}

function showLogin() {
  const loginCard = document.getElementById("loginCard");
  const dashboardArea = document.getElementById("dashboardArea");
  if (loginCard) loginCard.style.display = "block";
  if (dashboardArea) dashboardArea.style.display = "none";
}

function showDashboard(user) {
  const loginCard = document.getElementById("loginCard");
  const dashboardArea = document.getElementById("dashboardArea");
  const userDisplay = document.getElementById("userDisplay");
  if (loginCard) loginCard.style.display = "none";
  if (dashboardArea) dashboardArea.style.display = "block";
  if (userDisplay && user) {
    userDisplay.textContent = "Logged in as: " + user.email;
  }
  loadInventory();
  resetForm();
}

async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const errorElem = document.getElementById("loginError");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (errorElem) errorElem.textContent = "Signing in...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    if (errorElem) errorElem.textContent = error.message;
  } else if (data && data.user) {
    if (errorElem) errorElem.textContent = "";
    showDashboard(data.user);
  }
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  showLogin();
}

// 2. SLUG & TOKEN GENERATORS
function autoPopulateSlug(title) {
  const slugInput = document.getElementById("prodSlug");
  const editingId = document.getElementById("editingId");
  if (slugInput && editingId && !editingId.value) {
    slugInput.value = generateSlug(title);
  }
}

function regenerateToken() {
  const prodToken = document.getElementById("prodToken");
  if (prodToken) {
    prodToken.value = generateToken("tok");
  }
}

// 3. COLOR SWATCHES
function addColorRow(name, hex) {
  const container = document.getElementById("colorsContainer");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "dynamic-row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "input color-name";
  nameInput.placeholder = "Color Name";
  nameInput.value = name || "";
  nameInput.style.flex = "2";
  nameInput.required = true;

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "color-picker";
  colorInput.value = hex || "#8A9A86";
  colorInput.style.width = "44px";
  colorInput.style.height = "38px";
  colorInput.style.border = "1px solid var(--border)";
  colorInput.style.borderRadius = "4px";
  colorInput.style.cursor = "pointer";

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-danger btn-sm";
  delBtn.textContent = "✕";
  delBtn.onclick = function() {
    div.remove();
  };

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
    if (name) {
      colors.push({ name: name, hex: hex });
    }
  });
  return colors;
}

// 4. LOAD INVENTORY
async function loadInventory() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  tbody.innerHTML = '
