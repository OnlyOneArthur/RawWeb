/* AllSafe Frontend — Vanilla JS + AOS
   - SPA-like section routing
   - Products + Product Details
   - Auth modal (login + register tabs)
   - Purchase history (localStorage)
   - Performance: event delegation, minimal DOM churn, lazy images
*/

/* ========================== Data ========================== */
const PRODUCTS = [
  {
    id: "secure-antivirus",
    name: "SecureAntivirus",
    category: "antivirus",
    price: 29.99,
    per: "/year",
    popularity: 90,
    createdAt: "2024-08-01",
    stock: "In Stock",
    short: "Comprehensive, real‑time protection against malware and viruses.",
    description:
      "SecureAntivirus delivers AI‑assisted threat detection, ransomware rollback, and scheduled scans. Lightweight on resources and robust against zero‑day exploits.",
    images: [
      "https://via.placeholder.com/960x540?text=SecureAntivirus+Hero",
      "https://via.placeholder.com/300?text=Antivirus+UI+1",
      "https://via.placeholder.com/300?text=Antivirus+UI+2",
      "https://via.placeholder.com/300?text=Antivirus+UI+3",
      "https://via.placeholder.com/300?text=Antivirus+UI+4",
    ],
  },
  {
    id: "secure-vpn",
    name: "SecureVPN",
    category: "vpn",
    price: 49.99,
    per: "/year",
    popularity: 98,
    createdAt: "2025-03-17",
    stock: "In Stock",
    short: "Private and secure browsing with global servers.",
    description:
      "SecureVPN masks your IP, prevents ISP throttling, and supports streaming‑friendly endpoints. WireGuard® compatible with blazing performance.",
    images: [
      "https://via.placeholder.com/960x540?text=SecureVPN+Hero",
      "https://via.placeholder.com/300?text=VPN+Servers",
      "https://via.placeholder.com/300?text=VPN+App",
      "https://via.placeholder.com/300?text=VPN+Speed",
      "https://via.placeholder.com/300?text=VPN+Privacy",
    ],
  },
  {
    id: "secure-firewall",
    name: "SecureFirewall",
    category: "firewall",
    price: 39.99,
    per: "/year",
    popularity: 75,
    createdAt: "2024-10-02",
    stock: "Limited",
    short: "Robust network security and intrusion prevention.",
    description:
      "SecureFirewall adds adaptive rules, intrusion detection (IDS), and simple profiles for home and office networks.",
    images: [
      "https://via.placeholder.com/960x540?text=SecureFirewall+Hero",
      "https://via.placeholder.com/300?text=Firewall+Rules",
      "https://via.placeholder.com/300?text=Firewall+Alerts",
      "https://via.placeholder.com/300?text=Firewall+Graphs",
      "https://via.placeholder.com/300?text=Firewall+Setup",
    ],
  },
  {
    id: "secure-cloud",
    name: "SecureCloud",
    category: "cloud",
    price: 59.99,
    per: "/year",
    popularity: 82,
    createdAt: "2025-06-02",
    stock: "In Stock",
    short: "Protect and encrypt your data in the cloud.",
    description:
      "SecureCloud brings end‑to‑end encryption, zero‑knowledge sharing links, and automatic device backup for teams and individuals.",
    images: [
      "https://via.placeholder.com/960x540?text=SecureCloud+Hero",
      "https://via.placeholder.com/300?text=Cloud+Backup",
      "https://via.placeholder.com/300?text=Cloud+Restore",
      "https://via.placeholder.com/300?text=Cloud+Share",
      "https://via.placeholder.com/300?text=Cloud+Settings",
    ],
  },
];

/* ====================== Utilities ====================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

const money = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

const STORAGE_KEYS = {
  purchases: "allsafe:purchases",
  users: "allsafe:users",
  session: "allsafe:session",
};

const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

/* =================== Section Routing =================== */
const sections = {
  home: $("#home-section"),
  products: $("#products-section"),
  detail: $("#product-detail-section"),
  purchaseHistory: $("#purchase-history-section"),
  register: $("#register-section"),
  login: $("#login-section"),
};

function showSection(id) {
  for (const el of Object.values(sections)) el.classList.remove("active");
  const el = sections[id];
  if (el) {
    el.classList.add("active");
    el.focus({ preventScroll: true });
    // Update aria-current on nav-links
    for (const a of $$(".nav-link")) a.removeAttribute("aria-current");
    const current = [...$$(".nav-link")].find((a) => a.dataset.section === el.id);
    if (current) current.setAttribute("aria-current", "page");
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ====================== Rendering ====================== */
function renderFeatured() {
  const FEATURE_COUNT = 3;
  const container = $("#featured-grid");
  if (!container) return;
  const frag = document.createDocumentFragment();
  PRODUCTS.slice(0, FEATURE_COUNT).forEach((p) => frag.appendChild(productCard(p)));
  container.innerHTML = "";
  container.appendChild(frag);
}

function productCard(p) {
  const card = document.createElement("article");
  card.className = "product-card card";
  card.dataset.id = p.id;
  card.innerHTML = `
    <img src="${p.images[0]}" alt="${p.name} preview" loading="lazy" width="480" height="360" />
    <h3 class="h3">${p.name}</h3>
    <p class="muted">${p.short}</p>
    <div class="badge">${p.category}</div>
    <div class="price">${money(p.price)}<span class="muted">${p.per}</span></div>
    <button class="btn btn-primary" data-action="view" aria-label="View details for ${p.name}">View Details</button>
  `;
  return card;
}

function renderProducts(list = PRODUCTS) {
  const grid = $("#products-grid");
  if (!grid) return;
  const frag = document.createDocumentFragment();
  list.forEach((p) => frag.appendChild(productCard(p)));
  grid.innerHTML = "";
  grid.appendChild(frag);
}

function renderProductDetail(id) {
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
  $("#crumb-product").textContent = product.name;

  const detail = $("#product-detail");
  detail.setAttribute("aria-busy", "true");
  detail.innerHTML = "";

  const gallery = document.createElement("div");
  gallery.className = "gallery";
  // Hero image
  const hero = document.createElement("img");
  hero.src = product.images[0];
  hero.alt = `${product.name} hero image`;
  hero.className = "hero-img";
  hero.loading = "lazy";
  gallery.appendChild(hero);
  // Thumbs
  product.images.slice(1).forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${product.name} screenshot ${i + 1}`;
    img.tabIndex = 0;
    img.loading = "lazy";
    img.addEventListener("click", () => (hero.src = src));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hero.src = src;
      }
    });
    gallery.appendChild(img);
  });

  const info = document.createElement("div");
  info.className = "detail-card card";
  info.innerHTML = `
    <h2 class="h2">${product.name}</h2>
    <p>${product.description}</p>
    <div class="detail-meta">
      <span class="badge">${product.category}</span>
      <span class="badge">${product.stock}</span>
    </div>
    <p class="price" style="margin:.5rem 0">${money(product.price)} <span class="muted">${product.per}</span></p>
    <div class="qty">
      <label for="qty" class="label">Quantity</label>
      <input id="qty" type="number" min="1" value="1" />
    </div>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
      <button class="btn btn-primary" data-action="buy" data-id="${product.id}">Buy Now</button>
      <button class="btn btn-ghost" data-action="back">Back to Products</button>
    </div>
  `;

  detail.appendChild(gallery);
  detail.appendChild(info);
  detail.setAttribute("aria-busy", "false");
}

function renderHistory(rows) {
  const tbody = $("#history-body");
  const empty = $("#history-empty");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!rows.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  const frag = document.createDocumentFragment();
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.productName}</td>
      <td>${new Date(r.date).toLocaleString()}</td>
      <td>${r.qty}</td>
      <td>${money(r.unitPrice)}</td>
      <td>${money(r.total)}</td>
    `;
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
}

/* =================== Filtering & Sorting =================== */
function applyProductFilters() {
  const cat = $("#category")?.value ?? "all";
  const sort = $("#sort")?.value ?? "price-low";
  let list = PRODUCTS.filter((p) => (cat === "all" ? true : p.category === cat));
  switch (sort) {
    case "price-low":
      list = list.slice().sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      list = list.slice().sort((a, b) => b.price - a.price);
      break;
    case "popularity":
      list = list.slice().sort((a, b) => b.popularity - a.popularity);
      break;
    case "newest":
      list = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }
  renderProducts(list);
}

/* =================== Purchase Storage =================== */
function getPurchases() {
  return Storage.get(STORAGE_KEYS.purchases, []);
}
function addPurchase({ productId, qty }) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const purchase = {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    productId,
    productName: product?.name ?? productId,
    unitPrice: product?.price ?? 0,
    qty,
    total: (product?.price ?? 0) * qty,
    date: new Date().toISOString(),
  };
  const list = getPurchases();
  list.unshift(purchase);
  Storage.set(STORAGE_KEYS.purchases, list);
  return purchase;
}

/* =================== Toast =================== */
let toastTimer = null;
function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  el.style.transform = "translateY(0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
  }, 2200);
}

/* =================== Auth Modal =================== */
const Auth = {
  users() { return Storage.get(STORAGE_KEYS.users, []); },
  saveUsers(list) { Storage.set(STORAGE_KEYS.users, list); },
  session() { return Storage.get(STORAGE_KEYS.session, null); },
  setSession(user) { Storage.set(STORAGE_KEYS.session, user); },
  logout() { localStorage.removeItem(STORAGE_KEYS.session); },
};

function openAuth(which = "login") {
  const modal = $("#auth-modal");
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "grid";
  switchTab(which);
  lockScroll(true);
  trapFocus(modal);
}
function closeAuth() {
  const modal = $("#auth-modal");
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  lockScroll(false);
  releaseFocusTrap();
}

function switchTab(which) {
  const loginTab = $("#tab-login");
  const regTab = $("#tab-register");
  const loginPanel = $("#panel-login");
  const regPanel = $("#panel-register");
  const isLogin = which === "login";

  loginTab.setAttribute("aria-selected", String(isLogin));
  regTab.setAttribute("aria-selected", String(!isLogin));
  loginPanel.classList.toggle("hidden", !isLogin);
  regPanel.classList.toggle("hidden", isLogin);
  (isLogin ? $("#login-email") : $("#reg-name"))?.focus();
}

/* Focus trap */
let lastFocused = null;
let untrap = null;
function trapFocus(modal) {
  lastFocused = document.activeElement;
  const selectors =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusables = [...modal.querySelectorAll(selectors)];
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  function loop(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  }
  modal.addEventListener("keydown", loop);
  untrap = () => modal.removeEventListener("keydown", loop);
  first?.focus();
}
function releaseFocusTrap() {
  untrap?.(); untrap = null;
  lastFocused?.focus(); lastFocused = null;
}

/* Scroll lock */
function lockScroll(on) {
  document.documentElement.style.overflow = on ? "hidden" : "";
}

/* =================== Event Delegation =================== */
function onDelegated(parent, selector, event, handler) {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) handler(e, target);
  });
}

/* =================== History Controls =================== */
function refreshHistoryView() {
  const query = $("#history-search").value.trim().toLowerCase();
  const sort = $("#history-sort").value;
  let rows = getPurchases().filter((r) =>
    r.productName.toLowerCase().includes(query)
  );
  switch (sort) {
    case "date-new":
      rows.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
    case "date-old":
      rows.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
    case "total-high":
      rows.sort((a, b) => b.total - a.total); break;
    case "total-low":
      rows.sort((a, b) => a.total - b.total); break;
  }
  renderHistory(rows);
}

/* =================== Nav & App Init =================== */
function initNav() {
  // Mobile menu
  const toggle = $(".nav-toggle");
  toggle?.addEventListener("click", () => {
    const nav = $("#primary-nav");
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Section routing
  onDelegated(document, "a.nav-link,[data-section]", "click", (e, el) => {
    const sec = el.dataset.section;
    if (!sec) return;
    e.preventDefault();
    // Map id to key
    if (sec === "home-section") showSection("home");
    else if (sec === "products-section") showSection("products");
    else if (sec === "product-detail-section") showSection("detail");
    else if (sec === "purchase-history-section") showSection("purchaseHistory");
    else if (sec === "register-section") { openAuth("register"); return; }
    else if (sec === "login-section") { openAuth("login"); return; }
  });

  // Auth openers
  onDelegated(document, ".open-auth", "click", (e, el) => {
    e.preventDefault();
    openAuth(el.dataset.auth || "login");
  });
}

function initProducts() {
  renderFeatured();
  renderProducts(PRODUCTS);

  $("#category").addEventListener("change", applyProductFilters);
  $("#sort").addEventListener("change", applyProductFilters);

  // Delegated actions on grids
  onDelegated(document, "#products-grid .product-card button,[data-action='view']", "click", (e, el) => {
    const card = el.closest(".product-card");
    const id = card?.dataset.id;
    if (!id) return;
    renderProductDetail(id);
    showSection("detail");
  });
}

function initDetail() {
  onDelegated(document, "#product-detail [data-action='back']", "click", (e) => {
    e.preventDefault();
    showSection("products");
  });
  onDelegated(document, "#product-detail [data-action='buy']", "click", (e, el) => {
    const id = el.dataset.id;
    const qty = clamp(parseInt($("#qty").value || "1", 10), 1, 999);
    const purchase = addPurchase({ productId: id, qty });
    toast(`Purchased ${purchase.productName} ×${purchase.qty}`);
    refreshHistoryView();
    showSection("purchaseHistory");
  });
}

function initHistory() {
  $("#history-search").addEventListener("input", debounce(refreshHistoryView, 150));
  $("#history-sort").addEventListener("change", refreshHistoryView);
  refreshHistoryView();
}

/* =================== Auth =================== */
function initAuth() {
  $("#tab-login").addEventListener("click", () => switchTab("login"));
  $("#tab-register").addEventListener("click", () => switchTab("register"));
  onDelegated(document, "#auth-modal [data-close]", "click", (e) => { e.preventDefault(); closeAuth(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#auth-modal").getAttribute("aria-hidden") === "false") closeAuth();
  });
  $("#auth-modal").addEventListener("click", (e) => {
    if (e.target.matches(".modal-backdrop")) closeAuth();
  });

  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#login-email").value.trim().toLowerCase();
    const password = $("#login-password").value;
    const user = Auth.users().find((u) => u.email === email && u.password === password);
    if (!user) return toast("Invalid credentials");
    Auth.setSession({ name: user.name, email });
    updateUserPill();
    toast(`Welcome back, ${user.name}`);
    closeAuth();
  });

  $("#register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#reg-name").value.trim();
    const email = $("#reg-email").value.trim().toLowerCase();
    const password = $("#reg-password").value;
    if (!name || !email || password.length < 6) return toast("Please fill the form correctly");
    const exists = Auth.users().some((u) => u.email === email);
    if (exists) return toast("Account already exists");
    const users = Auth.users();
    users.push({ name, email, password });
    Auth.saveUsers(users);
    Auth.setSession({ name, email });
    updateUserPill();
    toast(`Welcome, ${name}!`);
    closeAuth();
  });
}

function updateUserPill() {
  const pill = $("#user-pill");
  const sess = Auth.session();
  if (sess) {
    pill.hidden = false;
    pill.textContent = `${sess.name} • Logout`;
    pill.onclick = () => { Auth.logout(); updateUserPill(); toast("Signed out"); };
  } else {
    pill.hidden = true;
  }
}

/* =================== AOS / Fade on scroll =================== */
function initAOS() {
  if (window.AOS) AOS.init({ duration: 600, easing: "ease-out", once: true });
}
function initFadeIO() {
  const els = $$(".fade");
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-visible");
  }, { threshold: 0.1 });
  els.forEach((el) => io.observe(el));
}

/* =================== Helpers =================== */
function debounce(fn, ms = 200) {
  let t = 0;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), ms);
  };
}

/* =================== Boot =================== */
document.addEventListener("DOMContentLoaded", () => {
  // Year
  $("#year").textContent = new Date().getFullYear();

  initNav();
  initAuth();
  initAOS();
  initFadeIO();

  initProducts();
  initDetail();
  initHistory();

  // Deep link routing by hash
  const hash = (location.hash || "#home").replace("#", "");
  const map = {
    home: "home",
    products: "products",
    "product-detail": "detail",
    "purchase-history": "purchaseHistory",
    register: "register",
    login: "login",
  };
  showSection(map[hash] ?? "home");

  // If user clicked Login/Register from URL, open modal
  if (hash === "login" || hash === "register") {
    openAuth(hash);
  }

  // Initial detail pre-render
  renderProductDetail(PRODUCTS[0].id);

  // Optimize scroll perf
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
});

// Water-fill auth button: flip intent on hover/focus
(() => {
  const authLink = document.getElementById('auth-link');
  if (!authLink) return;

  const setIntent = (intent) => {
    authLink.dataset.auth = intent; // "login" | "register"
    authLink.setAttribute(
      'aria-label',
      intent === 'login' ? 'Login' : 'Register (hover to Login)'
    );
  };

  // default to register
  setIntent('register');

  authLink.addEventListener('mouseenter', () => setIntent('login'));
  authLink.addEventListener('mouseleave', () => setIntent('register'));
  authLink.addEventListener('focus',      () => setIntent('login'));
  authLink.addEventListener('blur',       () => setIntent('register'));
})();

// Water-fill auth button: flip intent on hover/focus
(() => {
const authLink = document.getElementById('auth-link');
if (!authLink) return;


const setIntent = (intent) => {
authLink.dataset.auth = intent; // "login" | "register"
authLink.setAttribute(
'aria-label',
intent === 'login' ? 'Login' : 'Register (hover to Login)'
);
};


// default to register
setIntent('register');


authLink.addEventListener('mouseenter', () => setIntent('login'));
authLink.addEventListener('mouseleave', () => setIntent('register'));
authLink.addEventListener('focus', () => setIntent('login'));
authLink.addEventListener('blur', () => setIntent('register'));
})();
