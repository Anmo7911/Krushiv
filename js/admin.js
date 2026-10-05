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
  div.innerHTML = '' +
                  '' +
                  '✕';
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

// 4. LOAD INVENTORY TABLE
async function loadInventory() {
  const tbody = document.getElementById("inventoryTableBody");
  tbody.innerHTML = '
