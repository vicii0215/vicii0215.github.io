// ========= Edit these: contact + inventory =========
const CONTACT = {
  whatsappE164: "16572628377", // change to your WhatsApp number (country code + number)
  email: "wleo80215@gmail.com", // change to your email
  address: "blk 819 Jurong West Street, Singapore", // replace with your real address
  displayText: "Fenghuo Technology (Qi Wei) | WhatsApp: +1 657 262 8377 | Email: sales@fenghuo.tech | Address: blk 819 Jurong West Street, Singapore"
};

// status: in_stock / reserved / sold
// grade: A / B / C
const PRODUCTS = [
  {
    id: "FH-RTX3070-01",
    title: "NVIDIA GeForce RTX 3070 8GB (ASUS TUF)",
    brand: "ASUS",
    image: "imgs/asus3070.png",
    vram: 8,
    grade: "B",
    status: "in_stock",
    price: 399,
    currency: "SGD",
    tags: ["triple-fan", "8GB", "PCIe 4.0"],
    test: { peakTempC: 74, notes: "10min stress test stable, no artifacts/driver drops. Fans OK." },
    desc:
`[Condition] B (light wear)
[Testing] Driver OK; stress-test stable; peak temp 74°C
[Known issues] None observed
[In the box] GPU only
[Deal] Pickup or shipping (unboxing video recommended)`
  },
  {
    id: "FH-RX6800-01",
    title: "AMD Radeon RX 6800 16GB (SAPPHIRE PULSE)",
    brand: "SAPPHIRE",
    image: "imgs/amd6800.png",
    vram: 16,
    grade: "A",
    status: "in_stock",
    price: 469,
    currency: "SGD",
    tags: ["16GB", "dual-fan", "high VRAM"],
    test: { peakTempC: 71, notes: "Benchmark + game test OK, solid thermals." },
    desc:
`[Condition] A (like new)
[Testing] Stable in benchmark & games; peak temp 71°C
[Good for] 1440p / some 4K; VRAM-heavy workflows
[Accessories] Box/receipt if available will be stated`
  },
  {
    id: "FH-RTX3080-01",
    title: "NVIDIA GeForce RTX 3080 10GB (MSI Ventus)",
    brand: "MSI",
    image: "imgs/3080.png",
    vram: 10,
    grade: "C",
    status: "reserved",
    price: 499,
    currency: "SGD",
    tags: ["10GB", "high performance"],
    test: { peakTempC: 78, notes: "Functional; visible cosmetic wear." },
    desc:
`[Condition] C (visible wear, fully functional)
[Testing] Stress-test stable; peak temp 78°C
[Notes] Pricing reflects cosmetics; pickup test recommended`
  },
  {
    id: "FH-RTX3060TI-01",
    title: "NVIDIA GeForce RTX 3060 Ti 8GB (Gigabyte Eagle)",
    brand: "GIGABYTE",
    image: "imgs/3060ti.png",
    vram: 8,
    grade: "B",
    status: "sold",
    price: 329,
    currency: "SGD",
    tags: ["8GB", "sweet spot"],
    test: { peakTempC: 72, notes: "Example sold item — remove if you want." },
    desc:
`[Status] SOLD (example)
[Tip] Keep as a “past sales” sample or delete this entry.`
  }
];

// ========= UI logic =========
const $ = (s)=>document.querySelector(s);
const toast = $("#toast");

const yearEl = $("#year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

const waBtn = $("#waBtn");
const mailBtn = $("#mailBtn");
if(waBtn){
  const waLink = `https://wa.me/${CONTACT.whatsappE164}?text=${encodeURIComponent("Hi! I want to ask about your used GPUs:")}`;
  waBtn.href = waLink;
}
if(mailBtn){
  mailBtn.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("GPU Inquiry / Order")}&body=${encodeURIComponent("Hi, I'm interested in:\n\nModel:\nBudget:\nPickup/Shipping:\n\n")}`;
}

function showToast(msg){
  if(!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.style.display="none", 2200);
}

function copyText(t){
  navigator.clipboard.writeText(t).then(()=>showToast("Copied")).catch(()=>showToast("Copy failed"));
}

const copyOrderBtn = $("#copyOrderBtn");
if(copyOrderBtn){
  copyOrderBtn.addEventListener("click", ()=>copyText($("#orderTpl").textContent.trim()));
}

const copyContactBtn = $("#copyContactBtn");
if(copyContactBtn){
  copyContactBtn.addEventListener("click", ()=>copyText(CONTACT.displayText));
}

const copyLinkBtn = $("#copyLinkBtn");
if(copyLinkBtn){
  copyLinkBtn.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(location.href);
      showToast("Link copied");
    }catch{
      showToast("Copy failed");
    }
  });
}

// Inventory-only elements
const grid = $("#grid");
const q = $("#q");
const brand = $("#brand");
const vram = $("#vram");
const grade = $("#grade");
const statusSel = $("#status");
const resetBtn = $("#resetBtn");
const dlg = $("#dlg");

function badgeClass(s){
  if(s==="in_stock") return "ok";
  if(s==="reserved") return "warn";
  return "bad";
}
function statusText(s){
  if(s==="in_stock") return "IN STOCK";
  if(s==="reserved") return "RESERVED";
  return "SOLD";
}

function renderBrandOptions(){
  if(!brand) return;
  const brands = Array.from(new Set(PRODUCTS.map(p=>p.brand))).sort();
  brands.forEach(b=>{
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = `Brand: ${b}`;
    brand.appendChild(opt);
  });
}

function matchProduct(p){
  const qq = (q?.value||"").trim().toLowerCase();
  const b = brand?.value;
  const vr = vram?.value;
  const gr = grade?.value;
  const st = statusSel?.value;

  const hay = [
    p.id, p.title, p.brand, String(p.vram), p.grade, p.status, ...(p.tags||[]), (p.desc||"")
  ].join(" ").toLowerCase();

  if(qq && !hay.includes(qq)) return false;
  if(b && p.brand !== b) return false;
  if(vr && String(p.vram) !== String(vr)) return false;
  if(gr && p.grade !== gr) return false;
  if(st && p.status !== st) return false;
  return true;
}

function cardHtml(p){
  const badge = statusText(p.status);
  const bcls = badgeClass(p.status);
  const price = `${p.currency} ${p.price}`;
  const meta = [
    `${p.brand}`,
    `${p.vram}GB`,
    `Grade ${p.grade}`,
    `Peak ${p.test?.peakTempC ?? "—"}°C`
  ];

  return `
    <div class="card">
      <div class="thumb">
        ${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">` : ""}
        <div class="badge ${bcls}">${badge}</div>
      </div>
      <div class="card-body">
        <div class="title">
          <h3>${escapeHtml(p.title)}</h3>
          <div class="price">${escapeHtml(price)}</div>
        </div>
        <div class="meta">
          ${meta.map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join("")}
        </div>
        <div class="notes">${escapeHtml(p.test?.notes ?? "")}</div>
        <div class="card-actions">
          <button class="btn small" data-act="detail" data-id="${p.id}">Details</button>
          <button class="btn small" data-act="copy" data-id="${p.id}">Copy</button>
        </div>
      </div>
    </div>
  `;
}

function render(){
  if(!grid) return;
  const list = PRODUCTS.filter(matchProduct);
  const statCount = $("#statCount");
  if(statCount) statCount.textContent = PRODUCTS.filter(p=>p.status==="in_stock").length;

  if(list.length === 0){
    grid.innerHTML = `
      <div class="panel" style="grid-column:1/-1">
        <b>No matching items</b>
        <div class="muted" style="margin-top:6px">Try another keyword or hit “Reset”.</div>
      </div>
    `;
    return;
  }
  grid.innerHTML = list.map(cardHtml).join("");
}

function productText(p){
  return [
    `Fenghuo Technology (Qi Wei)`,
    `ID: ${p.id}`,
    `Model: ${p.title}`,
    `Price: ${p.currency} ${p.price}`,
    `Status: ${statusText(p.status)}`,
    `Grade: ${p.grade}`,
    `VRAM: ${p.vram}GB`,
    `Testing: Peak ${p.test?.peakTempC ?? "—"}°C; ${p.test?.notes ?? ""}`,
    `Notes:\n${p.desc ?? ""}`
  ].join("\n");
}

function openDetail(p){
  if(!dlg) return;
  $("#mKicker").textContent = `${p.currency} ${p.price} · ${statusText(p.status)} · Grade ${p.grade}`;
  $("#mTitle").textContent = p.title;
  $("#mMeta").textContent = `${p.brand} · ${p.vram}GB · ID ${p.id}`;
  $("#mDesc").textContent = p.desc || "";
  $("#mBuy").href = "contact.html";
  $("#mCopy").onclick = ()=>copyText(productText(p));
  dlg.showModal();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (c)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

if(grid){
  [q, brand, vram, grade, statusSel].forEach(el=>el?.addEventListener("input", render));
  resetBtn?.addEventListener("click", ()=>{
    q.value=""; brand.value=""; vram.value=""; grade.value=""; statusSel.value="";
    render();
  });

  grid.addEventListener("click", (e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    if(act==="detail") openDetail(p);
    if(act==="copy") copyText(productText(p));
  });

  $("#closeDlg")?.addEventListener("click", ()=>dlg?.close());

  // initial
  renderBrandOptions();
  render();
}
