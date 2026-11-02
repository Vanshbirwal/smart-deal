"use strict";
const $ = s => document.querySelector(s);
const h = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) (k in e) ? (e[k] = v) : e.setAttribute(k, v);
    e.append(...kids);
    return e;
};

const store_ = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
};

const inr = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const enc = encodeURIComponent;
const viaGoogle = d => q => `https://www.google.com/search?q=${enc(q + " site:" + d)}`;

/* ---------- Verified Indian Retail Stores Database ---------- */
const stores = [
    { name: "Amazon India", domain: "amazon.in", group: "General", trust: 5, ops: true, desc: "Massive catalog with reliable fulfillment & fast returns.", cats: ["phone", "laptop", "tablet", "watch", "audio", "tv", "appliance", "fashion", "footwear", "beauty", "grocery"], url: q => `https://www.amazon.in/s?k=${enc(q)}` },
    { name: "Flipkart", domain: "flipkart.com", group: "General", trust: 5, desc: "Market leader for electronics, smartphones, and fashion.", cats: ["phone", "laptop", "tablet", "watch", "audio", "tv", "appliance", "fashion", "footwear"], url: q => `https://www.flipkart.com/search?q=${enc(q)}` },
    { name: "Myntra", domain: "myntra.com", group: "Fashion", trust: 5, desc: "India's premier dedicated fashion & lifestyle destination.", cats: ["fashion", "footwear"], url: q => `https://www.myntra.com/${enc(q.trim().replace(/\s+/g, "-"))}` },
    { name: "AJIO", domain: "ajio.com", group: "Fashion", trust: 4, desc: "Curated trendy apparel, streetwear, and exclusive labels.", cats: ["fashion", "footwear"], url: q => `https://www.ajio.com/search/?text=${enc(q)}` },
    { name: "Tata CLiQ", domain: "tatacliq.com", group: "General", trust: 4, desc: "Authentic branded electronics, luxury, and fashion goods.", cats: ["fashion", "footwear", "phone", "beauty"], url: q => `https://www.tatacliq.com/search/?searchCategory=all&text=${enc(q)}` },
    { name: "Nykaa", domain: "nykaa.com", group: "Beauty", trust: 5, desc: "The authority for makeup, skincare, and wellness products.", cats: ["beauty"], url: q => `https://www.nykaa.com/search/result/?q=${enc(q)}` },
    { name: "Meesho", domain: "meesho.com", group: "Budget", trust: 3, desc: "Ultra low-cost everyday essentials and apparel.", cats: ["fashion"], url: q => `https://www.meesho.com/search?q=${enc(q)}` },
    { name: "Shopsy", domain: "shopsy.in", group: "Budget", trust: 3, desc: "Budget-friendly value shopping powered by Flipkart.", cats: ["fashion"], via: true, url: viaGoogle("shopsy.in") },
    { name: "Croma", domain: "croma.com", group: "Electronics", trust: 5, desc: "Trusted Tata omnichannel electronics superstore.", cats: ["phone", "laptop", "tablet", "watch", "audio", "tv", "appliance"], url: q => `https://www.croma.com/searchB?q=${enc(q)}` },
    { name: "Reliance Digital", domain: "reliancedigital.in", group: "Electronics", trust: 4, desc: "Massive selection of home appliances and tech gadgets.", cats: ["phone", "laptop", "audio", "tv", "appliance"], via: true, url: viaGoogle("reliancedigital.in") },
    { name: "Vijay Sales", domain: "vijaysales.com", group: "Electronics", trust: 4, desc: "Renowned consumer electronics and gadget retailer.", cats: ["phone", "laptop", "audio", "tv", "appliance"], via: true, url: viaGoogle("vijaysales.com") },
    { name: "Decathlon", domain: "decathlon.in", group: "Sports", trust: 5, desc: "Incomparable gear for sports, fitness, and outdoor activities.", cats: ["sports", "footwear"], via: true, url: viaGoogle("decathlon.in") },
    { name: "BigBasket", domain: "bigbasket.com", group: "Grocery", trust: 5, desc: "Comprehensive online supermarket for household groceries.", cats: ["grocery"], url: q => `https://www.bigbasket.com/ps/?q=${enc(q)}` },
    { name: "JioMart", domain: "jiomart.com", group: "Grocery", trust: 4, desc: "Groceries, daily essentials, and home appliances.", cats: ["grocery", "appliance"], via: true, url: viaGoogle("jiomart.com") },
    { name: "FirstCry", domain: "firstcry.com", group: "Baby", trust: 5, desc: "Asia's largest online store for baby care and kids toys.", cats: ["baby"], url: q => `https://www.firstcry.com/search?q=${enc(q)}` },
    { name: "Lenskart", domain: "lenskart.com", group: "Eyewear", trust: 5, desc: "Direct-to-consumer eyewear, sunglasses, and contact lenses.", cats: ["eyewear"], via: true, url: viaGoogle("lenskart.com") },
    { name: "Pepperfry", domain: "pepperfry.com", group: "Furniture", trust: 4, desc: "Extensive marketplace for furniture and interior decor.", cats: ["furniture"], url: q => `https://www.pepperfry.com/site_product/search?q=${enc(q)}` },
    { name: "Urban Ladder", domain: "urbanladder.com", group: "Furniture", trust: 4, desc: "Design-led premium furniture and wooden home decor.", cats: ["furniture"], via: true, url: viaGoogle("urbanladder.com") },
    { name: "Snapdeal", domain: "snapdeal.com", group: "Budget", trust: 3, desc: "Value-focused general e-commerce marketplace.", cats: [], url: q => `https://www.snapdeal.com/search?keyword=${enc(q)}` },
    { name: "IndiaMART", domain: "indiamart.com", group: "Wholesale", trust: 3, desc: "B2B wholesale marketplace and bulk buyer hub.", cats: [], url: q => `https://dir.indiamart.com/search.mp?ss=${enc(q)}` },
    { name: "Google Shopping", domain: "google.com", group: "Discovery", trust: 4, ops: true, desc: "Multi-retailer price aggregator engine.", cats: ["*"], url: q => `https://www.google.com/search?tbm=shop&q=${enc(q)}` }
];

/* ---------- Intelligent Category Mapping ---------- */
const accessories = /\b(case|cover|back cover|screen guard|screen protector|tempered glass|charger|charging cable|phone holder|skin|strap|sleeve|laptop bag)\b/i;
const types = [
    { key: "phone", label: "Smartphones", re: /\b(iphone|galaxy s\d+|galaxy a\d+|samsung galaxy|oneplus|redmi|poco|realme|oppo|vivo|motorola|moto g|pixel \d+|nothing phone|iqoo|smartphone|mobile phone)\b/i, ex: "-case -cover -charger -screen -glass -skin" },
    { key: "laptop", label: "Laptops & PCs", re: /\b(laptop|macbook|notebook|chromebook|thinkpad|vivobook|zenbook|ideapad|pavilion)\b/i, ex: "-bag -sleeve -skin -cover" },
    { key: "tablet", label: "Tablets", re: /\b(ipad|tablet|galaxy tab|oneplus pad|xiaomi pad)\b/i, ex: "-case -cover -glass" },
    { key: "watch", label: "Smartwatches", re: /\b(smartwatch|apple watch|galaxy watch|amazfit|noise watch)\b/i, ex: "-strap -band -case" },
    { key: "audio", label: "Audio Gear", re: /\b(earbuds|airpods|headphones|headset|galaxy buds|oneplus buds|speaker|soundbar)\b/i, ex: "-case -tips" },
    { key: "tv", label: "Televisions", re: /\b(tv|television|smart tv|led tv|oled)\b/i, ex: "" },
    { key: "appliance", label: "Appliances", re: /\b(refrigerator|fridge|washing machine|air conditioner|split ac|window ac|microwave|geyser|air fryer|vacuum cleaner|mixer grinder)\b/i, ex: "" },
    { key: "footwear", label: "Footwear", re: /\b(shoes?|sneakers?|sandals?|slippers?|heels|boots?|loafers|flip flops)\b/i, ex: "" },
    { key: "fashion", label: "Fashion & Apparel", re: /\b(shirts?|t-?shirts?|tees?|jeans|trousers|pants|dress|kurta|kurti|saree|lehenga|hoodie|jacket|sweater|shorts|leggings|clothes|clothing|ethnic wear|innerwear|jersey)\b/i, ex: "" },
    { key: "sports", label: "Sports & Fitness", re: /\b(cricket bat|football|yoga mat|dumbbells?|badminton|treadmill)\b/i, ex: "" },
    { key: "grocery", label: "Grocery", re: /\b(grocery|groceries|rice|atta|flour|milk|eggs|vegetables|fruits|dal)\b/i, ex: "" },
    { key: "furniture", label: "Furniture", re: /\b(sofa|bed|mattress|dining table|chair|wardrobe|bookshelf|furniture|desk)\b/i, ex: "" },
    { key: "beauty", label: "Beauty & Care", re: /\b(skincare|moisturi[sz]er|sunscreen|makeup|lipstick|perfume|shampoo|serum|face wash)\b/i, ex: "" },
    { key: "eyewear", label: "Eyewear", re: /\b(eyeglasses|spectacles|sunglasses|contact lenses)\b/i, ex: "" },
    { key: "baby", label: "Baby Products", re: /\b(baby|diapers?|stroller)\b/i, ex: "" }
];

function parseInput(input) {
    const v = input.trim();
    if (!/^https?:\/\//i.test(v)) return v.replace(/\s+/g, " ");
    try {
        const u = new URL(v);
        for (const k of ["q", "k", "query", "text", "keyword", "search", "ss"]) if (u.searchParams.get(k)) return u.searchParams.get(k).trim();
        const skip = /^(dp|p|pd|itm|buy|product|products|gp|ref)$/i, isId = w => /^(?=.*\d)[a-z0-9]{9,}$/i.test(w);
        const words = s => decodeURIComponent(s).replace(/\.(html?|php)$/i, "").split(/[-_+]+/).filter(w => w && !skip.test(w) && !isId(w));
        const segs = u.pathname.split("/").filter(Boolean).filter(s => !/^ref=/i.test(s));
        const best = segs.map(words).sort((a, b) => b.length - a.length)[0] || [];
        if (best.length < 2 || !best.some(w => /[a-z]/i.test(w))) throw 0;
        return best.join(" ");
    } catch { throw new Error("Couldn't read a product name from that link. Type the product name instead."); }
}

function detect(q) {
    if (accessories.test(q)) return { key: "accessory", label: "Accessory", ex: "", msg: "Accessory search. Matching exact item compatibility." };
    const t = types.find(t => t.re.test(q));
    return t ? { ...t, msg: `${t.label} detected. Category specialists & top-rated stores are prioritized first.` }
        : { key: "", label: "General product", ex: "", msg: "Broad multi-category marketplaces prioritized." };
}

const fit = (s, key) => (s.cats.includes(key) ? 25 : s.cats.includes("*") ? 10 : 0);
const score = (s, key) => fit(s, key) + (s.trust * 2);

/* ---------- App State ---------- */
const S = { query: "", det: null, group: "All", manual: null, sort: "rec", prices: store_.get("sd_prices", {}) };
const pkey = () => S.query.toLowerCase().replace(/\s+/g, " ").trim();
const history_ = name => (S.prices[pkey()] || {})[name] || [];

/* ---------- UI Rendering ---------- */
function logo(s, cls = "logo-box") {
    const box = h("span", { class: cls, "aria-hidden": "true" });
    const img = h("img", { src: `https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`, alt: "", loading: "lazy", width: 30, height: 30 });
    img.onerror = () => { box.textContent = s.name[0]; };
    box.append(img);
    return box;
}

function card(s, rank) {
    const topPick = S.det.key && rank < 3 && fit(s, S.det.key) > 0;
    const hist = history_(s.name), last = hist[hist.length - 1];
    const input = h("input", { type: "number", inputMode: "decimal", min: "1", step: "any", placeholder: "Price seen (₹)", "aria-label": `Price on ${s.name}` });
    const save = () => addPrice(s.name, input.value);
    input.onkeydown = e => { if (e.key === "Enter") save(); };

    return h("article", { class: "store-card" + (topPick ? " top" : "") },
        h("div", { class: "store-top" },
            logo(s),
            h("div", {},
                h("h3", {}, s.name),
                h("div", { class: "meta" }, `${s.group} · Trust ${s.trust}/5`)
            ),
            topPick ? h("span", { class: "badge" }, "Top Pick") : ""
        ),
        h("p", { class: "desc" }, s.desc),
        last ? h("div", { class: "last" }, h("b", {}, inr(last.p)), ` saved on ${new Date(last.t).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`) : "",
        h("details", { class: "track" },
            h("summary", {}, last ? "Update price" : "Log price quote"),
            h("div", { class: "price-row" }, input, h("button", { type: "button", onclick: save }, "Save"))
        ),
        h("a", { class: "open", href: s.url(S.query), target: "_blank", rel: "noopener noreferrer" }, s.via ? "Search store via Google ↗️" : "Open store ↗️")
    );
}

function visibleStores() {
    const key = S.det.key;
    let list = stores.filter(s => S.group === "All" || s.group === S.group);
    const by = {
        rec: (a, b) => score(b, key) - score(a, key),
        trust: (a, b) => b.trust - a.trust || score(b, key) - score(a, key),
        az: (a, b) => a.name.localeCompare(b.name)
    }[S.sort];
    return list.sort(by);
}

function setCat(k) {
    const t = types.find(t => t.key === k);
    S.manual = k;
    S.det = t ? { ...t, msg: `Showing curated stores for ${t.label}.` } : detect(S.query);
    render();
}

function render() {
    const list = visibleStores();
    $("#resultTitle").textContent = `Stores for “${S.query}”`;
    $("#resultCount").textContent = `${list.length} stores available`;
    $("#searchMessage").textContent = `${S.det.msg} Every platform is searched for exact product keywords.`;

    $("#toolbar").hidden = false;
    const cats = $("#cats");
    cats.hidden = false;

    const cb = (label, on, fn) => h("button", { class: "chip", type: "button", "aria-pressed": String(on), onclick: fn }, label);
    cats.replaceChildren(cb("Auto-Detect", !S.manual, () => setCat(null)), ...types.map(t => cb(t.label, S.manual === t.key, () => setCat(t.key))));

    const groups = ["All", ...new Set(stores.map(s => s.group))];
    $("#filters").replaceChildren(...groups.map(g => h("button", { class: "chip", type: "button", "aria-pressed": String(g === S.group), onclick: () => { S.group = g; render(); } }, g)));

    $("#resultsContainer").replaceChildren(...list.map((s, i) => card(s, i)));
    renderCompare();
}

function renderCompare() {
    const rows = stores.map(s => ({ s, last: history_(s.name).slice(-1)[0] })).filter(r => r.last).sort((a, b) => a.last.p - b.last.p);
    const box = $("#comparePanel");
    box.hidden = rows.length === 0;
    if (!rows.length) return;

    const low = rows[0].last.p;
    box.replaceChildren(
        h("header", {},
            h("h3", {}, "Live Price Comparison Matrix"),
            h("button", { class: "link-btn", type: "button", onclick: openHistory }, "View Price History Graph 📈")
        ),
        h("ol", {}, ...rows.map((r, i) => h("li", { class: i === 0 ? "best" : "" },
            logo(r.s),
            h("span", {}, r.s.name),
            h("b", {}, inr(r.last.p)),
            h("span", { class: "diff" }, i === 0 ? (rows.length > 1 ? "Lowest Price ⭐" : "Logged Price") : `+${inr(r.last.p - low)}`)
        )))
    );
}

function addPrice(name, raw) {
    const p = Math.round(parseFloat(raw) * 100) / 100;
    if (!(p > 0)) { $("#searchMessage").textContent = "Please enter a valid numeric price (e.g. 1499)."; return; }
    const k = pkey();
    ((S.prices[k] ??= {})[name] ??= []).push({ p, t: Date.now() });
    store_.set("sd_prices", S.prices);
    render();
}

/* ---------- SVG Price History Graph ---------- */
const palette = ["#5eead4", "#f59e0b", "#60a5fa", "#f472b6", "#a78bfa", "#fb7185", "#84cc16", "#22d3ee"];
function openHistory() {
    const data = stores.map(s => ({ name: s.name, pts: history_(s.name) })).filter(d => d.pts.length);
    const body = $("#histBody");
    $("#histTitle").textContent = `Price History: ${S.query}`;

    if (!data.length) {
        body.replaceChildren(h("p", { class: "note" }, "No price data logged yet. Save a price quote on any merchant card to build history."));
    } else {
        data.forEach((d, i) => d.c = palette[i % palette.length]);
        const W = 640, H = 280, m = { l: 65, r: 20, t: 15, b: 35 };
        const all = data.flatMap(d => d.pts);
        let lo = Math.min(...all.map(x => x.p)), hi = Math.max(...all.map(x => x.p));
        if (lo === hi) { lo *= .92; hi *= 1.08; }
        let t0 = Math.min(...all.map(x => x.t)), t1 = Math.max(...all.map(x => x.t));
        if (t0 === t1) { t0 -= 864e5; t1 += 864e5; }

        const X = t => m.l + (t - t0) / (t1 - t0) * (W - m.l - m.r);
        const Y = p => H - m.b - (p - lo) / (hi - lo) * (H - m.t - m.b);
        const dFmt = t => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

        let svg = "";
        for (let i = 0; i <= 3; i++) {
            const p = lo + (hi - lo) * i / 3;
            svg += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(p)}" y2="${Y(p)}"/><text x="${m.l - 10}" y="${Y(p) + 4}" text-anchor="end">${inr(p)}</text>`;
        }
        svg += `<text x="${m.l}" y="${H - 10}">${dFmt(t0)}</text><text x="${W - m.r}" y="${H - 10}" text-anchor="end">${dFmt(t1)}</text>`;

        data.forEach(s => {
            svg += `<polyline fill="none" stroke="${s.c}" stroke-width="3" stroke-linejoin="round" points="${s.pts.map(x => `${X(x.t)},${Y(x.p)}`).join(" ")}"/>`;
            svg += s.pts.map(x => `<circle cx="${X(x.t)}" cy="${Y(x.p)}" r="4.5" fill="${s.c}"><title>${s.name}: ${inr(x.p)} on ${dFmt(x.t)}</title></circle>`).join("");
        });

        const wrap = h("div");
        wrap.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Price trend vector graph">${svg}</svg>`;
        const legend = h("div", { class: "legend" }, ...data.map(s => h("span", {}, h("i", { style: `background:${s.c}` }), `${s.name} (Min: ${inr(Math.min(...s.pts.map(x => x.p)))})`)));
        body.replaceChildren(wrap, legend, h("p", { class: "note" }, "Trend data compiled locally from your logged prices."));
    }
    $("#histDialog").showModal();
}

/* ---------- Automated Smooth Scroll & Search Logic ---------- */
function search(input, fromLoad) {
    let q;
    try { q = parseInput(input); } catch (e) { $("#searchMessage").textContent = e.message; return; }
    if (!q) { $("#searchMessage").textContent = "Please enter a product name or paste a link."; return; }

    S.query = q;
    S.manual = null;
    S.det = detect(q);
    S.group = "All";
    $("#productInput").value = q;

    const recent = [q, ...store_.get("sd_recent", []).filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    store_.set("sd_recent", recent);
    showChips();

    try { history.replaceState(null, "", `?q=${enc(q)}`); } catch { }
    render();

    // Automatically smooth scroll right down to the comparison section
    const resultsElem = $("#results");
    const navHeight = document.querySelector(".navbar").offsetHeight;
    const targetPosition = resultsElem.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;

    window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
    });
}

function showChips() {
    const mk = t => h("button", { class: "chip", type: "button", onclick: () => search(t) }, t);
    $("#suggestions").replaceChildren(...["iPhone 17", "Running shoes", "Cotton shirt", "Office chair", "Smart TV"].map(mk));

    const recents = store_.get("sd_recent", []);
    const recentContainer = $("#recent");
    if (recents.length > 0) {
        recentContainer.hidden = false;
        recentContainer.replaceChildren(...recents.map(mk));
    } else {
        recentContainer.hidden = true;
    }
}

/* ---------- Event Listeners ---------- */
$("#searchForm").addEventListener("submit", e => { e.preventDefault(); search($("#productInput").value); });
$("#sortSel").addEventListener("change", e => { S.sort = e.target.value; render(); });
$("#histClose").onclick = () => $("#histDialog").close();
$("#histDialog").addEventListener("click", e => { if (e.target.id === "histDialog") e.target.close(); });

$("#themeBtn").onclick = () => {
    const t = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("sd_theme", t); } catch { }
};

showChips();
const q0 = new URLSearchParams(location.search).get("q");
if (q0) search(q0, true);