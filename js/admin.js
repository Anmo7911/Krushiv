// js/admin.js
let cachedProducts = [];

// 1. AUTHENTICATION & SESSION MANAGEMENT
async function checkAuthSession() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      showDashboard(session.user);
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

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorElem = document.getElementById("loginError");
  errorElem.textContent = "Signing in...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
  if (error) {
    errorElem.textContent = error.message;
  } else if (data && data.user) {
    errorElem.textContent = "";
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
  if (!document.getElementById("editingId").value) {
    slugInput.value = generateSlug(title);
  }
}

function regenerateToken() {
  document.getElementById("prodToken").value = generateToken("tok");
}

// 3. DYNAMIC COLOR SWATCHES
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
  colorInput.style.cursor = "pointer";

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
    const name = row.querySelector(".color-name").value.trim();
    const hex = row.querySelector(".color-picker").value;
    if (name) colors.push({ name: name, hex: hex });
  });
  return colors;
}

// 4. LOAD INVENTORY (SAFE DOM NODES)
async function loadInventory() {
  const tbody = document.getElementById("inventoryTableBody");
  tbody.innerHTML = '
