
const searchForm = document.getElementById("searchForm");
const productInput = document.getElementById("productInput");
const resultsContainer = document.getElementById("resultsContainer");
const resultTitle = document.getElementById("resultTitle");
const resultCount = document.getElementById("resultCount");
const searchMessage = document.getElementById("searchMessage");

// Retailer search links. These are not live price APIs.
const stores = [
    {
        name: "Amazon India",
        icon: "A",
        category: "General",
        priority: "Essential",
        description: "General shopping and everyday products",
        makeUrl: q => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`
    },
    {
        name: "Flipkart",
        icon: "F",
        category: "General",
        priority: "Essential",
        description: "General shopping and electronics",
        makeUrl: q => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "Meesho",
        icon: "M",
        category: "Budget shopping",
        priority: "Essential",
        description: "Affordable products and deals",
        makeUrl: q => `https://www.meesho.com/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "Snapdeal",
        icon: "S",
        category: "General",
        priority: "Medium",
        description: "Budget-friendly general shopping",
        makeUrl: q => `https://www.snapdeal.com/search?keyword=${encodeURIComponent(q)}`
    },
    {
        name: "Shopsy",
        icon: "S",
        category: "Budget shopping",
        priority: "Medium",
        description: "Affordable products and fashion",
        makeUrl: q => `https://www.shopsy.in/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "Tata CLiQ",
        icon: "T",
        category: "General",
        priority: "High",
        description: "Fashion, electronics and lifestyle",
        makeUrl: q => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`
    },
    {
        name: "JioMart",
        icon: "J",
        category: "General",
        priority: "Medium",
        description: "Everyday shopping and groceries",
        makeUrl: q => `https://www.jiomart.com/search/${encodeURIComponent(q)}`
    },
    {
        name: "Croma",
        icon: "C",
        category: "Electronics",
        priority: "Essential",
        description: "Smartphones, laptops and electronics",
        makeUrl: q => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}`
    },
    {
        name: "Reliance Digital",
        icon: "R",
        category: "Electronics",
        priority: "High",
        description: "Electronics and home appliances",
        makeUrl: q => `https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "Vijay Sales",
        icon: "V",
        category: "Electronics",
        priority: "High",
        description: "Electronics and gadgets",
        makeUrl: q => `https://www.vijaysales.com/search?search=${encodeURIComponent(q)}`
    },
    {
        name: "Myntra",
        icon: "M",
        category: "Fashion",
        priority: "Medium",
        description: "Clothing, footwear and accessories",
        makeUrl: q => `https://www.myntra.com/${encodeURIComponent(q)}`
    },
    {
        name: "AJIO",
        icon: "A",
        category: "Fashion",
        priority: "Medium",
        description: "Fashion and lifestyle",
        makeUrl: q => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}`
    },
    {
        name: "Nykaa",
        icon: "N",
        category: "Beauty",
        priority: "Medium",
        description: "Beauty, skincare and personal care",
        makeUrl: q => `https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`
    },
    {
        name: "Decathlon",
        icon: "D",
        category: "Sports products",
        priority: "Medium",
        description: "Sports, fitness and outdoor equipment",
        makeUrl: q => `https://www.decathlon.in/search?query=${encodeURIComponent(q)}`
    },
    {
        name: "FirstCry",
        icon: "F",
        category: "Baby products",
        priority: "Medium",
        description: "Baby care, toys and children's products",
        makeUrl: q => `https://www.firstcry.com/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "Lenskart",
        icon: "L",
        category: "Eyewear",
        priority: "Medium",
        description: "Eyeglasses, sunglasses and lenses",
        makeUrl: q => `https://www.lenskart.com/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "Pepperfry",
        icon: "P",
        category: "Furniture",
        priority: "Medium",
        description: "Furniture and home decor",
        makeUrl: q => `https://www.pepperfry.com/site_product/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "Urban Ladder",
        icon: "U",
        category: "Furniture",
        priority: "Medium",
        description: "Furniture and home furnishings",
        makeUrl: q => `https://www.urbanladder.com/search?q=${encodeURIComponent(q)}`
    },
    {
        name: "BigBasket",
        icon: "B",
        category: "Groceries",
        priority: "Medium",
        description: "Groceries and household essentials",
        makeUrl: q => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(q)}`
    },
    {
        name: "IndiaMART",
        icon: "I",
        category: "Wholesale products",
        priority: "Medium",
        description: "Wholesale and business products",
        makeUrl: q => `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(q)}`
    },
    {
        name: "Google Shopping",
        icon: "G",
        category: "Product discovery",
        priority: "High",
        description: "Discover products from multiple retailers",
        makeUrl: q => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`
    }
];

// Accessory words help avoid treating a phone cover as a phone.
const accessoryTerms = [
    "case",
    "cover",
    "back cover",
    "screen guard",
    "screen protector",
    "tempered glass",
    "charger",
    "charging cable",
    "phone holder",
    "phone skin",
    "mobile skin",
    "replacement strap",
    "watch strap",
    "earbud case",
    "laptop sleeve",
    "laptop bag"
];

// Product-category detector.
const productTypes = [
    {
        category: "Smartphone",
        pattern: /\b(iphone|samsung galaxy|galaxy s\d|galaxy a\d|oneplus|xiaomi|redmi|poco|realme|oppo|vivo|motorola|moto g|google pixel|pixel \d|nothing phone|iqoo|infinix|tecno)\b/i,
        storeCategories: ["Electronics", "General", "Product discovery"],
        exclusions: "-case -cover -charger -screen protector -tempered glass -skin -accessory -accessories"
    },
    {
        category: "Laptop",
        pattern: /\b(laptop|macbook|notebook|chromebook|thinkpad|vivobook|zenbook|ideapad|pavilion)\b/i,
        storeCategories: ["Electronics", "General", "Product discovery"],
        exclusions: "-bag -sleeve -skin -cover -charger"
    },
    {
        category: "Tablet",
        pattern: /\b(ipad|tablet|galaxy tab|oneplus pad|xiaomi pad)\b/i,
        storeCategories: ["Electronics", "General", "Product discovery"],
        exclusions: "-case -cover -screen protector -tempered glass"
    },
    {
        category: "Smartwatch",
        pattern: /\b(smartwatch|apple watch|galaxy watch|amazfit|noise watch)\b/i,
        storeCategories: ["Electronics", "General", "Product discovery"],
        exclusions: "-strap -band -case -screen protector"
    },
    {
        category: "Headphones and earbuds",
        pattern: /\b(earbuds|airpods|headphones|headset|oneplus buds|galaxy buds|nothing ear)\b/i,
        storeCategories: ["Electronics", "General", "Product discovery"],
        exclusions: "-case -replacement tips -ear tips"
    },
    {
        category: "Shoes and sportswear",
        pattern: /\b(shoes|sneakers|running shoes|sports shoes|football boots|jersey)\b/i,
        storeCategories: ["Fashion", "Sports products", "General", "Product discovery"],
        exclusions: ""
    },
    {
        category: "Groceries",
        pattern: /\b(grocery|groceries|rice|atta|flour|milk|eggs|vegetables|fruits|oil)\b/i,
        storeCategories: ["Groceries", "General", "Product discovery"],
        exclusions: ""
    },
    {
        category: "Furniture",
        pattern: /\b(sofa|bed|mattress|dining table|chair|wardrobe|bookshelf|furniture)\b/i,
        storeCategories: ["Furniture", "General", "Product discovery"],
        exclusions: ""
    },
    {
        category: "Beauty",
        pattern: /\b(skincare|moisturizer|sunscreen|makeup|lipstick|perfume|shampoo|serum)\b/i,
        storeCategories: ["Beauty", "General", "Product discovery"],
        exclusions: ""
    },
    {
        category: "Eyewear",
        pattern: /\b(eyeglasses|spectacles|sunglasses|contact lenses)\b/i,
        storeCategories: ["Eyewear", "General", "Product discovery"],
        exclusions: ""
    },
    {
        category: "Baby products",
        pattern: /\b(baby|diapers|diaper|baby stroller|baby food|baby toys)\b/i,
        storeCategories: ["Baby products", "General", "Product discovery"],
        exclusions: ""
    }
];

function getSearchQuery(input) {
    const value = input.trim();

    // Plain product name.
    if (!/^https?:\/\//i.test(value)) {
        return value;
    }

    // Best-effort extraction from a product URL.
    try {
        const url = new URL(value);
        const slug = url.pathname.split("/").filter(Boolean).pop() || "";

        const readable = decodeURIComponent(slug)
            .replace(/\.(html?|php)$/i, "")
            .replace(/[-_]+/g, " ")
            .replace(/\b\d{8,}\b/g, "")
            .trim();

        // Some product URLs contain only an ID. Do not pretend that
        // the ID identifies the exact product.
        return readable || url.hostname.replace(/^www\./, "");
    } catch {
        throw new Error(
            "That URL doesn't look valid. Paste a full link starting with https://"
        );
    }
}

function detectProduct(query) {
    const normalized = query.toLowerCase();

    // If the user specifically searches for an accessory,
    // do not remove that word from their search.
    const isExplicitAccessory = accessoryTerms.some(term => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`, "i").test(normalized);
    });

    if (isExplicitAccessory) {
        return {
            category: "Accessory",
            storeCategories: [
                "Electronics",
                "Fashion",
                "General",
                "Product discovery"
            ],
            searchQuery: query,
            message: "Accessory search detected. Searching for the accessory you entered."
        };
    }

    const detected = productTypes.find(item =>
        item.pattern.test(query)
    );

    if (!detected) {
        return {
            category: "General product",
            storeCategories: [
                "General",
                "Product discovery",
                "Budget shopping"
            ],
            searchQuery: query,
            message: "No specific category was confidently detected. General stores are shown first."
        };
    }

    return {
        category: detected.category,
        storeCategories: detected.storeCategories,
        searchQuery: detected.exclusions
            ? `${query} ${detected.exclusions}`
            : query,
        message: `${detected.category} detected. Relevant store categories are shown first.`
    };
}

function createStoreCard(store, query) {
    const card = document.createElement("article");
    card.className = "store-card";

    const top = document.createElement("div");
    top.className = "store-top";

    const icon = document.createElement("div");
    icon.className = "store-icon";
    icon.textContent = store.icon;

    const status = document.createElement("span");
    status.className = "store-status";
    status.textContent = store.priority;

    top.append(icon, status);

    const heading = document.createElement("h3");
    heading.textContent = store.name;

    const category = document.createElement("p");
    category.className = "store-category";
    category.textContent = store.category;

    const description = document.createElement("p");
    description.textContent = store.description;

    const link = document.createElement("a");
    link.href = store.makeUrl(query);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Explore Products ↗";

    card.append(top, heading, category, description, link);

    return card;
}

function searchProducts(input) {
    let query;

    try {
        query = getSearchQuery(input);
    } catch (error) {
        searchMessage.textContent = error.message;
        return;
    }

    if (!query) {
        searchMessage.textContent =
            "Please enter a product name or product URL.";
        return;
    }

    const detected = detectProduct(query);

    // Show relevant store categories first.
    // Keep all other stores available below.
    const orderedStores = [...stores].sort((a, b) => {
        const aRelevant =
            detected.storeCategories.includes(a.category) ? 0 : 1;

        const bRelevant =
            detected.storeCategories.includes(b.category) ? 0 : 1;

        return aRelevant - bRelevant;
    });

    resultTitle.textContent = `Stores for "${query}"`;
    resultCount.textContent = `${orderedStores.length} stores`;

    searchMessage.textContent =
        `Detected: ${detected.category}. ${detected.message}`;

    resultsContainer.replaceChildren();

    orderedStores.forEach(store => {
        resultsContainer.appendChild(
            createStoreCard(store, detected.searchQuery)
        );
    });

    document
        .getElementById("results")
        .scrollIntoView({ behavior: "smooth" });
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchProducts(productInput.value);
});
