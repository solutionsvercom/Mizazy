export const SITE = "https://mizazy.com";

const LOGO = "https://res.cloudinary.com/aiwtovua/image/upload/v1789379952/Mizazy_Logo.png";

const SOCIAL = [
  "https://www.facebook.com/share/1A9E6JsxTV/",
  "https://www.instagram.com/mizazy2025/",
  "https://in.pinterest.com/mizazy2025/",
  "https://www.youtube.com/@Mizazy-v6u",
];

const PRODUCT_COPY = {
  "mizazy-wireless-buds-104": {
    title: "Mizazy Wireless Buds 104 TWS Earbuds",
    description: "Buy Mizazy Wireless Buds 104 TWS Earbuds with 35H backup, Bluetooth 5.0, Quad Mic, Environmental Noise Cancellation, Google Fast Pairing and HD Sound at ₹1,499.",
  },
  "mizazy-120w-fast-usb-data-cable": {
    title: "Mizazy 120W USB-A to Type-C Data Cable",
    description: "Buy Mizazy 120W Fast USB Data Cable with USB-A to Type-C connectivity, fast charging support, high-speed data sync, metallic connectors, durable PVC jacket and 1M length at ₹349.",
  },
  "mizazy-buds-x-prime-tws-earbuds": {
    title: "Mizazy Buds X Prime TWS Earbuds",
    description: "Buy Mizazy Buds X Prime TWS Earbuds with Bluetooth 5.0, HD sound, built-in mic and up to 40 hours backup with charging case. Available in Black and Green at ₹1,199.",
  },
  "mizazy-20w-usb-c-fast-charger-for-iphone": {
    title: "Mizazy 20W USB-C Charger for iPhone",
    description: "Buy the Mizazy 20W USB-C charger for iPhone at ₹899. Compact USB-C power adapter with fast charging and safety protection for compatible devices.",
  },
  "mizazy-135w-super-fast-charger": {
    title: "Mizazy 135W USB-C and USB-A Charger",
    description: "Buy Mizazy 135W Super Fast Charger with USB-C and USB-A ports, intelligent chip, fast charging and multiple protection features. Available at an offer price of ₹899.",
  },
  "mizazy-140w-fast-charging-data-cable": {
    title: "Mizazy 140W USB-A to Type-C Data Cable",
    description: "Buy Mizazy 140W Fast Charging Data Cable with USB-A to Type-C connector, up to 3A current, 480Mbps data transfer, 1M nylon braided design and reinforced connectors at ₹379.",
  },
  "mizazy-equalizer-bluetooth-neckband": {
    title: "Mizazy Equalizer Bluetooth Neckband",
    description: "Buy Mizazy Equalizer Bluetooth Neckband with 100H playtime, 13mm drivers, Bluetooth 5.2, magnetic earbuds, Type-C charging and HD stereo sound at ₹999.",
  },
  "mizazy-65w-fast-usb-data-cable": {
    title: "Mizazy 65W USB-A to Type-C Data Cable",
    description: "Buy Mizazy 65W Fast USB Data Cable with USB-A to Type-C connectivity, fast charging support, USB 2.0 data sync and durable build at ₹349.",
  },
};

const CATEGORIES = {
  earbuds: {
    name: "Earbuds",
    title: "MIZAZY Earbuds | Wireless TWS Earphones",
    description:
      "Shop MIZAZY true wireless earbuds, including Wireless Buds 104 and Buds X Prime, with Bluetooth playback and a charging case.",
  },
  neckband: {
    name: "Neckband",
    title: "MIZAZY Neckband | Bluetooth Earphones",
    description:
      "Shop the MIZAZY Equalizer Bluetooth Neckband with magnetic earbuds, Type-C charging and HD stereo sound.",
  },
  "android-and-iphone-charger": {
    name: "Android and iPhone Charger",
    title: "MIZAZY Chargers | USB-C Power Adapters",
    description:
      "Shop MIZAZY USB-C chargers, including the 20W adapter for iPhone and the 135W charger with USB-C and USB-A ports.",
  },
  "data-cable": {
    name: "Data Cable",
    title: "MIZAZY Data Cables | USB-A to Type-C",
    description:
      "Shop MIZAZY USB-A to Type-C data cables, including the 65W, 120W and 140W charging cables.",
  },
};

const PAGES = {
  "/": {
    title: "MIZAZY | Earbuds, Neckbands, Chargers and Cables",
    description:
      "Shop MIZAZY wireless earbuds, Bluetooth neckbands, USB-C chargers and USB data cables.",
  },
  "/faqs": {
    title: "FAQs | Orders, Delivery, Returns and Warranty | MIZAZY",
    description:
      "Answers about MIZAZY orders, payment, delivery across India, 7-day returns and the 1-year warranty against manufacturing defects.",
  },
  "/reviews": {
    title: "Customer Reviews | MIZAZY",
    description: "Read customer reviews of MIZAZY earbuds, neckbands, chargers and data cables.",
  },
  "/warranty": {
    title: "Warranty Claim | MIZAZY",
    description:
      "Start a MIZAZY warranty claim with your product, name, phone, email and invoice. Products include a 1-year warranty against manufacturing defects.",
  },
};

const PRIVATE = new Set([
  "/checkout",
  "/track",
  "/account",
  "/confirmation",
  "/reset-password",
  "/payment-status",
  "/admin",
]);

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function canonical(pathname) {
  if (!pathname || pathname === "/") return `${SITE}/`;
  return `${SITE}${pathname}`;
}

function shopCategory(product) {
  const category = String(product?.category || "").toLowerCase();
  if (category.includes("earbud")) return CATEGORIES.earbuds;
  if (category.includes("neckband")) return CATEGORIES.neckband;
  if (category.includes("charger")) return CATEGORIES["android-and-iphone-charger"];
  if (category.includes("cable")) return CATEGORIES["data-cable"];
  return null;
}

function categorySlugFromName(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function breadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function graph(nodes) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

function productNode(product, url, description) {
  const images = (product.images?.length ? product.images : [product.image]).filter((src) => /^https?:\/\//.test(src));
  const node = {
    "@type": "Product",
    name: product.name,
    description,
    sku: product.id,
    brand: { "@type": "Brand", name: "MIZAZY" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: String(product.price),
    },
  };
  if (images.length) node.image = images;
  return node;
}

export function resolvePageMeta(pathname, products = []) {
  const path = decodeURIComponent(String(pathname || "/")).replace(/\/+$/, "") || "/";
  const list = Array.isArray(products) ? products : [];

  const productMatch = path.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    const key = productMatch[1];
    const product = list.find((item) => item.slug === key || item.id === key);
    if (!product) {
      return {
        title: "Product | MIZAZY",
        description: "This MIZAZY product page could not be found.",
        canonical: canonical(path),
        robots: "noindex, follow",
        image: LOGO,
        jsonLd: null,
      };
    }
    const url = canonical(`/product/${product.slug || product.id}`);
    const copy = PRODUCT_COPY[product.slug];
    const title = copy?.title || product.metaTitle || `${product.name} | MIZAZY`;
    const description = copy?.description || product.metaDescription || product.description;
    const image = /^https?:\/\//.test(product.image) ? product.image : LOGO;
    const category = shopCategory(product);
    const crumbs = [{ name: "Home", url: `${SITE}/` }];
    if (category) crumbs.push({ name: category.name, url: canonical(`/category/${categorySlugFromName(category.name)}`) });
    crumbs.push({ name: product.name, url });
    return {
      title,
      description,
      canonical: url,
      robots: "index, follow",
      image,
      imageAlt: product.imageAlt || product.name,
      keywords: product.seoKeywords,
      jsonLd: graph([productNode(product, url, description), breadcrumb(crumbs)]),
    };
  }

  const categoryMatch = path.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    const category = CATEGORIES[categoryMatch[1]];
    if (!category) {
      return {
        title: "Category | MIZAZY",
        description: "This MIZAZY category could not be found.",
        canonical: canonical(path),
        robots: "noindex, follow",
        image: LOGO,
        jsonLd: null,
      };
    }
    const url = canonical(`/category/${categoryMatch[1]}`);
    const sample = list.find((item) => shopCategory(item)?.name === category.name);
    return {
      title: category.title,
      description: category.description,
      canonical: url,
      robots: "index, follow",
      image: sample && /^https?:\/\//.test(sample.image) ? sample.image : LOGO,
      imageAlt: category.name,
      jsonLd: graph([breadcrumb([{ name: "Home", url: `${SITE}/` }, { name: category.name, url }])]),
    };
  }

  if (PRIVATE.has(path) || path.startsWith("/admin/") || path.startsWith("/api/")) {
    const name = path.split("/").filter(Boolean)[0] || "Page";
    return {
      title: `${name.charAt(0).toUpperCase()}${name.slice(1).replace(/-/g, " ")} | MIZAZY`,
      description: "This MIZAZY page is not part of the public catalog.",
      canonical: canonical(path),
      robots: "noindex, nofollow",
      image: LOGO,
      jsonLd: null,
    };
  }

  const page = PAGES[path];
  if (!page) {
    return {
      title: "MIZAZY",
      description: PAGES["/"].description,
      canonical: canonical(path),
      robots: "noindex, follow",
      image: LOGO,
      jsonLd: null,
    };
  }

  const url = canonical(path);
  const nodes = [];
  if (path === "/") {
    nodes.push({
      "@type": "Organization",
      name: "MIZAZY",
      url: `${SITE}/`,
      logo: LOGO,
      email: "contact@mizazy.com",
      sameAs: SOCIAL,
    });
  } else {
    const label = path === "/faqs" ? "FAQs" : path === "/reviews" ? "Reviews" : "Warranty";
    nodes.push(breadcrumb([{ name: "Home", url: `${SITE}/` }, { name: label, url }]));
  }
  return {
    title: page.title,
    description: page.description,
    canonical: url,
    robots: "index, follow",
    image: LOGO,
    imageAlt: "MIZAZY",
    jsonLd: graph(nodes),
  };
}

function headBlock(meta) {
  const lines = [
    `<link data-seo="canonical" rel="canonical" href="${esc(meta.canonical)}" />`,
    `<meta data-seo="robots" name="robots" content="${esc(meta.robots)}" />`,
    `<meta data-seo="og:type" property="og:type" content="${meta.jsonLd && JSON.stringify(meta.jsonLd).includes('"@type":"Product"') ? "product" : "website"}" />`,
    `<meta data-seo="og:site_name" property="og:site_name" content="MIZAZY" />`,
    `<meta data-seo="og:title" property="og:title" content="${esc(meta.title)}" />`,
    `<meta data-seo="og:description" property="og:description" content="${esc(meta.description)}" />`,
    `<meta data-seo="og:url" property="og:url" content="${esc(meta.canonical)}" />`,
    `<meta data-seo="og:image" property="og:image" content="${esc(meta.image)}" />`,
    `<meta data-seo="twitter:card" name="twitter:card" content="summary_large_image" />`,
    `<meta data-seo="twitter:title" name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta data-seo="twitter:description" name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta data-seo="twitter:image" name="twitter:image" content="${esc(meta.image)}" />`,
  ];
  if (meta.imageAlt) lines.push(`<meta data-seo="og:image:alt" property="og:image:alt" content="${esc(meta.imageAlt)}" />`);
  if (meta.keywords?.length) lines.push(`<meta data-seo="keywords" name="keywords" content="${esc(meta.keywords.join(", "))}" />`);
  if (meta.jsonLd) {
    const json = JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c");
    lines.push(`<script data-seo="jsonld" type="application/ld+json">${json}</script>`);
  }
  return `<!--mizazy-seo-->\n    ${lines.join("\n    ")}\n    <!--/mizazy-seo-->`;
}

export function applyToIndexHtml(html, meta) {
  let out = html.replace(/<title[^>]*>[\s\S]*?<\/title>/, `<title data-seo="title">${esc(meta.title)}</title>`);
  if (/<meta\s+[^>]*name="description"[^>]*>/.test(out)) {
    out = out.replace(/<meta\s+[^>]*name="description"[^>]*>/, `<meta data-seo="description" name="description" content="${esc(meta.description)}" />`);
  }
  out = out.replace(/\s*<!--mizazy-seo-->[\s\S]*?<!--\/mizazy-seo-->/, "");
  return out.replace("</head>", `    ${headBlock(meta)}\n  </head>`);
}

export function applyToDocument(meta) {
  if (typeof document === "undefined") return;
  document.title = meta.title;
  const title = document.querySelector("title");
  if (title) title.setAttribute("data-seo", "title");

  const set = (key, build) => {
    let el = document.head.querySelector(`[data-seo="${key}"]`);
    if (!el) {
      el = build();
      el.setAttribute("data-seo", key);
      document.head.appendChild(el);
    }
    return el;
  };

  set("description", () => {
    const el = document.createElement("meta");
    el.setAttribute("name", "description");
    return el;
  }).setAttribute("content", meta.description);

  set("canonical", () => {
    const el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    return el;
  }).setAttribute("href", meta.canonical);

  const metas = [
    ["robots", "name", "robots", meta.robots],
    ["og:type", "property", "og:type", meta.jsonLd && JSON.stringify(meta.jsonLd).includes('"@type":"Product"') ? "product" : "website"],
    ["og:site_name", "property", "og:site_name", "MIZAZY"],
    ["og:title", "property", "og:title", meta.title],
    ["og:description", "property", "og:description", meta.description],
    ["og:url", "property", "og:url", meta.canonical],
    ["og:image", "property", "og:image", meta.image],
    ["twitter:card", "name", "twitter:card", "summary_large_image"],
    ["twitter:title", "name", "twitter:title", meta.title],
    ["twitter:description", "name", "twitter:description", meta.description],
    ["twitter:image", "name", "twitter:image", meta.image],
  ];
  if (meta.imageAlt) metas.push(["og:image:alt", "property", "og:image:alt", meta.imageAlt]);
  if (meta.keywords?.length) metas.push(["keywords", "name", "keywords", meta.keywords.join(", ")]);

  for (const [key, attr, name, content] of metas) {
    const el = set(key, () => {
      const node = document.createElement("meta");
      node.setAttribute(attr, name);
      return node;
    });
    el.setAttribute("content", content);
  }

  for (const key of ["og:image:alt", "keywords"]) {
    if (!metas.some((item) => item[0] === key)) document.head.querySelector(`[data-seo="${key}"]`)?.remove();
  }

  const json = document.head.querySelector('[data-seo="jsonld"]');
  if (meta.jsonLd) {
    const el = json || document.createElement("script");
    el.setAttribute("data-seo", "jsonld");
    el.setAttribute("type", "application/ld+json");
    el.textContent = JSON.stringify(meta.jsonLd);
    if (!json) document.head.appendChild(el);
  } else if (json) {
    json.remove();
  }
}
