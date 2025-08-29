// ===== Utilities =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const sections = $$(".section");
const navLinks = $$("#primary-nav .nav-link[data-section]");
const toast = $("#toast");

function setActiveSection(id) {
  sections.forEach((sec) => sec.classList.toggle("active", sec.id === id));
  navLinks.forEach((a) => {
    const isActive = a.dataset.section === id;
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const active = document.getElementById(id);
  if (active) active.focus({ preventScroll: true });
}

// Smooth section routing
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-section]");
  if (link) {
    e.preventDefault();
    const id = link.dataset.section;
    setActiveSection(id);
    $("#primary-nav")?.classList.remove("open");
    $(".nav-toggle")?.setAttribute("aria-expanded", "false");
  }
});

// Nav toggle (mobile)
$(".nav-toggle")?.addEventListener("click", () => {
  const menu = $("#primary-nav");
  const isOpen = menu.classList.toggle("open");
  $(".nav-toggle").setAttribute("aria-expanded", String(isOpen));
});

// Intersection fade
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 },
);
$$(".fade").forEach((el) => io.observe(el));

// ===== Products demo =====
const PRODUCTS = [
  {
    id: "av-1",
    name: "AllSafe Antivirus Pro",
    cat: "antivirus",
    price: 39,
    image: "https://via.placeholder.com/640x480?text=Antivirus",
  },
  {
    id: "vpn-1",
    name: "AllSafe VPN",
    cat: "vpn",
    price: 49,
    image: "https://via.placeholder.com/640x480?text=VPN",
  },
  {
    id: "fw-1",
    name: "AllSafe Firewall",
    cat: "firewall",
    price: 59,
    image: "https://via.placeholder.com/640x480?text=Firewall",
  },
  {
    id: "cl-1",
    name: "AllSafe Cloud Guard",
    cat: "cloud",
    price: 79,
    image: "https://via.placeholder.com/640x480?text=Cloud+Security",
  },
];

function renderProducts(list, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = list
    .map(
      (p) => `
    <article class="product-card card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}">
      <div>
        <h3 class="h3">${p.name}</h3>
        <div class="badge">${p.cat}</div>
      </div>
      <div class="price" aria-label="Price">$${p.price}</div>
      <button class="btn view-detail" data-id="${p.id}">View Details</button>
    </article>
  `,
    )
    .join("");
  mount.querySelectorAll(".view-detail").forEach((btn) => {
    btn.addEventListener("click", () => showProductDetail(btn.dataset.id));
  });
}

function showProductDetail(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  $("#crumb-product").textContent = p.name;
  const detail = $("#product-detail");
  if (!detail) return;

  detail.innerHTML = `
    <div class="gallery">
      <img class="hero-img" src="${p.image}" alt="${p.name}">
      <img src="${p.image}" alt="${p.name} thumbnail">
      <img src="${p.image}" alt="${p.name} thumbnail">
      <img src="${p.image}" alt="${p.name} thumbnail">
      <img src="${p.image}" alt="${p.name} thumbnail">
    </div>
    <div class="detail-card card">
      <h2 class="h3">${p.name}</h2>
      <div class="detail-meta">
        <span class="badge">${p.cat}</span>
        <span class="badge">Instant Download</span>
      </div>
      <p class="muted">Enterprise-grade protection with lightweight performance.</p>
      <div class="qty">
        <label for="qty" class="label">Qty</label>
        <input id="qty" type="number" class="input" min="1" value="1">
      </div>
      <div class="price" style="margin:.25rem 0 1rem">$${p.price}</div>
      <button class="btn add-to-history" data-id="${p.id}">Purchase</button>
    </div>
  `;
  setActiveSection("product-detail-section");

  detail.querySelector(".add-to-history")?.addEventListener("click", () => {
    const qty = Math.max(
      1,
      parseInt(document.getElementById("qty").value || "1", 10),
    );
    addPurchase(p, qty);
    showToast("Purchase added to history.");
  });
}

// Initial render
renderProducts(PRODUCTS, "featured-grid");
renderProducts(PRODUCTS, "products-grid");

// Filtering/sorting
$("#category")?.addEventListener("change", applyFilters);
$("#sort")?.addEventListener("change", applyFilters);

function applyFilters() {
  const cat = $("#category")?.value || "all";
  const sort = $("#sort")?.value || "price-low";
  let list = PRODUCTS.slice();
  if (cat !== "all") list = list.filter((p) => p.cat === cat);
  switch (sort) {
    case "price-low":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      list.sort((a, b) => b.price - a.price);
      break;
    case "popularity":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      list.reverse();
      break;
  }
  renderProducts(list, "products-grid");
}

// ===== Purchase History =====
const history = [];

function addPurchase(p, qty) {
  const total = p.price * qty;
  history.unshift({
    product: p.name,
    date: new Date(),
    qty,
    price: p.price,
    total,
  });
  renderHistory();
}

function renderHistory() {
  const tbody = $("#history-body");
  const empty = $("#history-empty");
  if (!tbody || !empty) return;

  if (history.length === 0) {
    tbody.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  const query = ($("#history-search")?.value || "").toLowerCase();
  const sort = $("#history-sort")?.value || "date-new";

  let rows = history.slice();
  if (query) rows = rows.filter((r) => r.product.toLowerCase().includes(query));

  switch (sort) {
    case "date-new":
      rows.sort((a, b) => b.date - a.date);
      break;
    case "date-old":
      rows.sort((a, b) => a.date - b.date);
      break;
    case "total-high":
      rows.sort((a, b) => b.total - a.total);
      break;
    case "total-low":
      rows.sort((a, b) => a.total - b.total);
      break;
  }

  tbody.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>${r.product}</td>
      <td>${r.date.toLocaleDateString()}</td>
      <td>${r.qty}</td>
      <td>$${r.price}</td>
      <td>$${r.total}</td>
    </tr>
  `,
    )
    .join("");
}

$("#history-search")?.addEventListener("input", renderHistory);
$("#history-sort")?.addEventListener("change", renderHistory);

// ===== Auth Modal =====
const authLink = $("#auth-link");
const modal = $("#auth-modal");
const tabLogin = $("#tab-login");
const tabRegister = $("#tab-register");
const panelLogin = $("#panel-login");
const panelRegister = $("#panel-register");

// Intent toggle label (hover/focus)
(() => {
  if (!authLink) return;
  const setIntent = (intent) => {
    authLink.dataset.auth = intent; // "login" | "register"
    authLink.setAttribute(
      "aria-label",
      intent === "login" ? "Login" : "Register (hover to Login)",
    );
  };
  setIntent("register"); // default
  authLink.addEventListener("mouseenter", () => setIntent("login"));
  authLink.addEventListener("mouseleave", () => setIntent("register"));
  authLink.addEventListener("focus", () => setIntent("login"));
  authLink.addEventListener("blur", () => setIntent("register"));
})();

// Open modal from unified link
authLink?.addEventListener("click", (e) => {
  e.preventDefault();
  openAuth(authLink.dataset.auth === "login" ? "login" : "register");
});

// Support any ".open-auth" triggers
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".open-auth");
  if (btn) {
    e.preventDefault();
    openAuth(btn.dataset.auth === "login" ? "login" : "register");
  }
});

function openAuth(which) {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  selectTab(which === "register" ? "register" : "login");
}
function closeAuth() {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
modal?.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeAuth();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.getAttribute("aria-hidden") === "false") {
    closeAuth();
  }
});
$(".modal-close")?.addEventListener("click", closeAuth);

// Tabs logic
tabLogin?.addEventListener("click", () => selectTab("login"));
tabRegister?.addEventListener("click", () => selectTab("register"));

function selectTab(which) {
  const loginSelected = which === "login";
  tabLogin?.setAttribute("aria-selected", String(loginSelected));
  tabRegister?.setAttribute("aria-selected", String(!loginSelected));
  panelLogin?.classList.toggle("hidden", !loginSelected);
  panelRegister?.classList.toggle("hidden", loginSelected);
  (loginSelected ? panelLogin : panelRegister)?.focus();
}

// Fake submit handlers
$("#login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  closeAuth();
  const pill = $("#user-pill");
  if (pill) {
    pill.hidden = false;
    pill.textContent = "Signed in";
  }
  showToast("Welcome back! You are signed in.");
});
$("#register-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  closeAuth();
  const pill = $("#user-pill");
  if (pill) {
    pill.hidden = false;
    pill.textContent = "Account created";
  }
  showToast("Account created! You are signed in.");
});

// ===== Toast =====
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.style.opacity = 1;
  toast.style.transform = "translateY(0)";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.transform = "translateY(6px)";
  }, 2400);
}

// Footer year
$("#year") && ($("#year").textContent = new Date().getFullYear());
