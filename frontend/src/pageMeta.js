import { ARTICLES, BLOG_LISTING, matchBlogPath, renderBlogBody } from "./blogPosts.js";

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
    title: "Mizazy Wireless Earbuds | Buds 104 with ENC, Quad Mic",
    description:
      "Shop Mizazy Buds 104 wireless earbuds with 35H backup, Bluetooth 5.0, a quad mic, ENC and HD sound. TWS earbuds for calls and music at ₹1,499.",
    h1: "Mizazy Buds 104 Wireless Earbuds",
    lead:
      "Mizazy Buds 104 are wireless earbuds for calls and music. They offer up to 35 hours of backup, Bluetooth 5.0, a quad mic, environmental noise cancellation and HD sound. These TWS earbuds are Bluetooth earbuds for everyday listening.",
    imageAlt: "Mizazy Buds 104 wireless earbuds",
    links: [
      { href: "/product/mizazy-buds-x-prime-tws-earbuds", label: "Mizazy Buds X Prime TWS earbuds" },
      { href: "/category/earbuds", label: "Mizazy wireless earbuds" },
      { href: "/faqs", label: "orders and warranty FAQs" },
    ],
  },
  "mizazy-buds-x-prime-tws-earbuds": {
    title: "TWS Earbuds with 40H Backup and Mic | Mizazy Prime",
    description:
      "Shop Mizazy Buds X Prime TWS earbuds with Bluetooth 5.0, 40H backup, HD sound and a built-in mic. Bluetooth wireless earphones priced at ₹1,199.",
    h1: "Mizazy Buds X Prime TWS Earbuds",
    lead:
      "Mizazy Buds X Prime are TWS earbuds with Bluetooth 5.0, up to 40 hours of backup, HD sound and a built-in microphone. These Bluetooth TWS earbuds are wireless earphones priced at ₹1,199.",
    imageAlt: "Mizazy Buds X Prime TWS earbuds",
    links: [
      { href: "/product/mizazy-wireless-buds-104", label: "Mizazy Buds 104 wireless earbuds" },
      { href: "/category/earbuds", label: "Mizazy earbuds" },
      { href: "/faqs", label: "orders and warranty FAQs" },
    ],
  },
  "mizazy-equalizer-bluetooth-neckband": {
    title: "Bluetooth Neckband Earphones | Mizazy 100H Playtime",
    description:
      "Shop the Mizazy Equalizer Bluetooth neckband with 100H playtime, 13mm drivers and Bluetooth 5.2. Wireless neckband earphones priced at ₹999.",
    h1: "Mizazy Equalizer Bluetooth Neckband",
    lead:
      "The Mizazy Equalizer is a Bluetooth neckband with up to 100 hours of playtime, 13mm drivers and Bluetooth 5.2. It is a wireless neckband for long listening, priced at ₹999.",
    imageAlt: "Mizazy Equalizer Bluetooth neckband earphones",
    links: [
      { href: "/category/neckband", label: "Mizazy neckbands" },
      { href: "/product/mizazy-wireless-buds-104", label: "Mizazy wireless earbuds" },
      { href: "/faqs", label: "orders and warranty FAQs" },
    ],
  },
  "mizazy-135w-super-fast-charger": {
    title: "Fast Mobile Charger, 135W USB-C and USB-A | Mizazy",
    description:
      "Shop the Mizazy 135W fast mobile charger with USB-C and USB-A ports and an intelligent chip. A USB fast charger for compatible devices at ₹899.",
    h1: "Mizazy 135W Fast Mobile Charger",
    lead:
      "The Mizazy 135W is a fast mobile charger with 135W maximum output, USB-C and USB-A ports and an intelligent chip. It is a USB fast charger for compatible devices, priced at ₹899.",
    imageAlt: "Mizazy 135W fast mobile charger with USB-C and USB-A ports",
    links: [
      { href: "/product/mizazy-20w-usb-c-fast-charger-for-iphone", label: "Mizazy 20W USB-C charger" },
      { href: "/category/android-and-iphone-charger", label: "Mizazy mobile chargers" },
      { href: "/faqs", label: "orders and warranty FAQs" },
    ],
  },
  "mizazy-20w-usb-c-fast-charger-for-iphone": {
    title: "20W USB-C Charger for iPhone | Mizazy Power Adapter",
    description:
      "Shop the Mizazy 20W USB-C charger for iPhone. A compact USB-C power adapter with fast charging and safe charging for compatible iPhones at ₹899.",
    h1: "Mizazy 20W USB-C Charger for iPhone",
    lead:
      "The Mizazy 20W USB-C charger is a compact power adapter for iPhone, with USB-C output, fast charging and safe charging. This iPhone-compatible charger is priced at ₹899.",
    imageAlt: "Mizazy 20W USB-C charger for iPhone",
    links: [
      { href: "/product/mizazy-135w-super-fast-charger", label: "Mizazy 135W fast mobile charger" },
      { href: "/category/android-and-iphone-charger", label: "Mizazy chargers" },
      { href: "/faqs", label: "orders and warranty FAQs" },
    ],
  },
  "mizazy-140w-fast-charging-data-cable": {
    title: "Fast Charging Cable Type-C | Mizazy 140W, 1M Braided",
    description:
      "Shop the Mizazy 140W fast charging cable Type-C. This 1 metre nylon braided USB-A to Type-C data cable transfers data at 480Mbps, priced at ₹379.",
    h1: "Mizazy 140W Fast Charging Cable Type-C",
    lead:
      "The Mizazy 140W is a fast charging cable Type-C with a USB-A to Type-C connector, 480Mbps data transfer and a 1 metre nylon braid. This Type-C charging cable is priced at ₹379.",
    imageAlt: "Mizazy 140W nylon braided fast charging cable, USB-A to Type-C",
    links: [
      { href: "/product/mizazy-120w-fast-usb-data-cable", label: "Mizazy 120W fast charging data cable" },
      { href: "/category/data-cable", label: "Mizazy data cables" },
      { href: "/product/mizazy-135w-super-fast-charger", label: "Mizazy 135W fast mobile charger" },
    ],
  },
  "mizazy-120w-fast-usb-data-cable": {
    title: "Fast Charging Data Cable, USB-A to Type-C | Mizazy",
    description:
      "Shop the Mizazy 120W fast charging data cable. This 1 metre USB-A to Type-C cable offers high-speed data sync for compatible devices at ₹349.",
    h1: "Mizazy 120W Fast Charging Data Cable",
    lead:
      "The Mizazy 120W is a fast charging data cable with USB-A to Type-C connectors, up to 120W output and high-speed data sync in a 1 metre length. This USB data cable is priced at ₹349.",
    imageAlt: "Mizazy 120W fast charging data cable, USB-A to Type-C",
    links: [
      { href: "/product/mizazy-140w-fast-charging-data-cable", label: "Mizazy 140W fast charging cable Type-C" },
      { href: "/category/data-cable", label: "Mizazy data cables" },
      { href: "/product/mizazy-135w-super-fast-charger", label: "Mizazy 135W fast mobile charger" },
    ],
  },
  "mizazy-65w-fast-usb-data-cable": {
    title: "USB Data Cable for Fast Charging | Mizazy 65W Type-C",
    description:
      "Shop the Mizazy 65W USB data cable. This USB-A to Type-C fast charging cable supports USB 2.0 data sync for compatible devices, priced at ₹349.",
    h1: "Mizazy 65W USB Data Cable",
    lead:
      "The Mizazy 65W is a USB data cable with USB-A to Type-C connectors, fast charging and USB 2.0 data sync. This Type-C data cable is priced at ₹349.",
    imageAlt: "Mizazy 65W USB data cable, USB-A to Type-C",
    links: [
      { href: "/product/mizazy-120w-fast-usb-data-cable", label: "Mizazy 120W fast charging data cable" },
      { href: "/category/data-cable", label: "Mizazy data cables" },
      { href: "/faqs", label: "orders and warranty FAQs" },
    ],
  },
};

export function productSeo(slug) {
  return PRODUCT_COPY[slug] || null;
}

export function withProductSeo(product) {
  const copy = productSeo(product?.slug);
  if (!copy) return product;
  return {
    ...product,
    description: copy.lead,
    imageAlt: copy.imageAlt || product.imageAlt,
    metaTitle: copy.title,
    metaDescription: copy.description,
    ogTitle: copy.title,
    ogDescription: copy.description,
  };
}

const CATEGORIES = {
  earbuds: {
    name: "Earbuds",
    title: "Wireless Earbuds | TWS Bluetooth Earbuds at MIZAZY",
    description:
      "Shop MIZAZY wireless earbuds for music and calls. Compare TWS earbuds Buds 104 and Buds X Prime, with Bluetooth playback, a microphone and a charging case.",
    h1: "Mizazy Wireless Earbuds",
    intro: [
      { text: "Mizazy wireless earbuds are true wireless earbuds for music and calls. " },
      { text: "Mizazy Buds 104", href: "/product/mizazy-wireless-buds-104" },
      { text: " has 35 hours of backup, Bluetooth 5.0, a quad microphone and environmental noise cancellation. " },
      { text: "Mizazy Buds X Prime", href: "/product/mizazy-buds-x-prime-tws-earbuds" },
      { text: " is a Bluetooth earbud with up to 40 hours of backup, HD sound and a built-in microphone. Both come with a charging case." },
    ],
    faqs: [
      {
        question: "What is the difference between Buds 104 and Buds X Prime?",
        answer: "Buds 104 lists 35 hours of backup, a quad microphone and environmental noise cancellation. Buds X Prime lists Bluetooth 5.0, 40 hours of backup, HD sound and a built-in microphone. Both are wireless earbuds with a charging case.",
      },
      {
        question: "Can these wireless earbuds be used for calls?",
        answer: "Yes. Buds 104 has a quad microphone with environmental noise cancellation, and Buds X Prime has a built-in microphone.",
      },
    ],
  },
  neckband: {
    name: "Neckband",
    title: "Bluetooth Neckband with Long Battery Life | MIZAZY",
    description:
      "Shop the MIZAZY Bluetooth neckband. The Equalizer wireless neckband has up to 100 hours of playtime, 13mm drivers and Bluetooth 5.2 neckband earphones.",
    h1: "Mizazy Bluetooth Neckband",
    intro: [
      { text: "The Mizazy Bluetooth neckband is a wireless neckband for everyday music and calls. " },
      { text: "Mizazy Equalizer", href: "/product/mizazy-equalizer-bluetooth-neckband" },
      { text: " uses Bluetooth 5.2 and 13mm drivers, with magnetic earbuds and up to 100 hours of playtime listed on the packaging." },
    ],
    faqs: [
      {
        question: "How long does the neckband battery last?",
        answer: "The Equalizer packaging lists up to 100 hours of playtime. Actual playback depends on volume and how you use the neckband earphones.",
      },
    ],
  },
  "android-and-iphone-charger": {
    name: "Android and iPhone Charger",
    title: "Fast Mobile Charger | USB-C Charger, USB-A | MIZAZY",
    description:
      "Shop a MIZAZY fast mobile charger. Choose the 20W USB-C charger for iPhone or the 135W mobile charger with USB-C and USB-A ports and an intelligent chip.",
    h1: "Mizazy Fast Mobile Chargers",
    intro: [
      { text: "A Mizazy fast mobile charger is for everyday phone charging or higher-power charging. The " },
      { text: "20W USB-C fast charger", href: "/product/mizazy-20w-usb-c-fast-charger-for-iphone" },
      { text: " is a compact USB-C charger made for iPhone. The " },
      { text: "135W USB fast charger", href: "/product/mizazy-135w-super-fast-charger" },
      { text: " adds USB-C and USB-A ports and an intelligent charging chip. The 135W box includes a cable; the 20W adapter does not." },
    ],
    faqs: [
      {
        question: "Which charger has USB-C and USB-A?",
        answer: "The 135W charger has one USB-C port and one USB-A port. The 20W mobile charger has a single USB-C port.",
      },
      {
        question: "Does the charger include a cable?",
        answer: "The 135W charger includes a 1m charging cable. The 20W USB-C adapter does not include a cable.",
      },
    ],
  },
  "data-cable": {
    name: "Data Cable",
    title: "Fast Charging Cable | Type-C USB Data Cable | MIZAZY",
    description:
      "Shop a MIZAZY fast charging cable. Compare USB-A to Type-C data cables, including the 65W, 120W USB data cable and nylon braided 140W Type-C cable.",
    h1: "Mizazy Fast Charging Cables",
    intro: [
      { text: "Each Mizazy fast charging cable is a USB-A to Type-C cable for charging and data transfer. The range includes the " },
      { text: "65W fast charging data cable", href: "/product/mizazy-65w-fast-usb-data-cable" },
      { text: ", the " },
      { text: "120W USB data cable", href: "/product/mizazy-120w-fast-usb-data-cable" },
      { text: " with high-speed data sync, and the nylon braided " },
      { text: "140W Type-C cable", href: "/product/mizazy-140w-fast-charging-data-cable" },
      { text: " with 480Mbps data transfer." },
    ],
    faqs: [
      {
        question: "Which fast charging cable is braided?",
        answer: "The 140W cable has a nylon braided cover. The 65W and 120W cables are also USB-A to Type-C fast charging cables.",
      },
      {
        question: "Can these cables transfer data?",
        answer: "Yes. The 65W cable lists USB 2.0 data transfer, the 120W cable lists high-speed data sync, and the 140W cable lists 480Mbps data transfer.",
      },
    ],
  },
};

export function categorySeo(slug) {
  return CATEGORIES[slug] || null;
}

function categoryPlainText(category) {
  return (category.intro || []).map((part) => part.text).join("");
}

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
  const copy = productSeo(product.slug);
  const images = (product.images?.length ? product.images : [product.image]).filter((src) => /^https?:\/\//.test(src));
  const node = {
    "@type": "Product",
    name: copy?.h1 || product.name,
    description: copy?.lead || description,
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
      imageAlt: copy?.imageAlt || product.imageAlt || product.name,
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
    const items = list.filter((item) => shopCategory(item)?.name === category.name);
    const sample = items.find((item) => /^https?:\/\//.test(item.image));
    return {
      title: category.title,
      description: category.description,
      canonical: url,
      robots: "index, follow",
      image: sample ? sample.image : LOGO,
      imageAlt: category.h1 || category.name,
      jsonLd: graph([
        {
          "@type": "CollectionPage",
          name: category.h1 || category.name,
          description: categoryPlainText(category),
          url,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              url: canonical(`/product/${item.slug || item.id}`),
            })),
          },
        },
        breadcrumb([{ name: "Home", url: `${SITE}/` }, { name: category.h1 || category.name, url }]),
      ]),
    };
  }

  const blog = matchBlogPath(path);
  if (blog) {
    const bodyHtml = renderBlogBody(path);
    if (blog.kind === "missing") {
      return {
        title: "Article not found | MIZAZY",
        description: "This Mizazy guide is not available.",
        canonical: canonical(path),
        robots: "noindex, follow",
        image: LOGO,
        statusCode: 404,
        bodyHtml,
        jsonLd: null,
      };
    }
    if (blog.kind === "listing") {
      const url = canonical("/blog");
      return {
        title: BLOG_LISTING.seoTitle,
        description: BLOG_LISTING.metaDescription,
        canonical: url,
        robots: "index, follow",
        image: ARTICLES[0].featuredImage,
        imageAlt: ARTICLES[0].featuredImageAlt,
        ogType: "website",
        statusCode: 200,
        bodyHtml,
        jsonLd: graph([
          {
            "@type": "Blog",
            name: BLOG_LISTING.h1,
            description: BLOG_LISTING.introduction,
            url,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: ARTICLES.length,
              itemListElement: ARTICLES.map((article, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: article.title,
                url: canonical(`/blog/${article.slug}`),
              })),
            },
          },
          breadcrumb([{ name: "Home", url: `${SITE}/` }, { name: "Blog", url }]),
        ]),
      };
    }
    const article = blog.article;
    const url = canonical(`/blog/${article.slug}`);
    const posting = {
      "@type": "BlogPosting",
      headline: article.h1,
      description: article.metaDescription,
      image: [article.featuredImage],
      author: { "@type": "Organization", name: "MIZAZY", url: `${SITE}/` },
      publisher: {
        "@type": "Organization",
        name: "MIZAZY",
        url: `${SITE}/`,
        logo: { "@type": "ImageObject", url: LOGO },
      },
      datePublished: article.datePublished,
      mainEntityOfPage: url,
    };
    if (article.dateModified) posting.dateModified = article.dateModified;
    return {
      title: article.seoTitle,
      description: article.metaDescription,
      canonical: url,
      robots: "index, follow",
      image: article.featuredImage,
      imageAlt: article.featuredImageAlt,
      ogType: "article",
      keywords: [article.primaryKeyword, ...article.secondaryKeywords],
      statusCode: 200,
      bodyHtml,
      jsonLd: graph([
        posting,
        breadcrumb([
          { name: "Home", url: `${SITE}/` },
          { name: "Blog", url: canonical("/blog") },
          { name: article.h1, url },
        ]),
      ]),
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

function socialType(meta) {
  if (meta.ogType) return meta.ogType;
  if (meta.jsonLd && JSON.stringify(meta.jsonLd).includes('"@type":"Product"')) return "product";
  return "website";
}

function headBlock(meta) {
  const lines = [
    `<link data-seo="canonical" rel="canonical" href="${esc(meta.canonical)}" />`,
    `<meta data-seo="robots" name="robots" content="${esc(meta.robots)}" />`,
    `<meta data-seo="og:type" property="og:type" content="${socialType(meta)}" />`,
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
  out = out.replace("</head>", `    ${headBlock(meta)}\n  </head>`);
  if (meta.bodyHtml) {
    out = out.replace(/<div id="root">\s*<\/div>/, `<div id="root">${meta.bodyHtml}</div>`);
  }
  return out;
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
    ["og:type", "property", "og:type", socialType(meta)],
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
