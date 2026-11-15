import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../backend/catalog.js";
import { applyToIndexHtml, resolvePageMeta } from "../frontend/src/pageMeta.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(path.join(root, "frontend/index.html"), "utf8");
const failures = [];
const fail = (message) => failures.push(message);

const publicPaths = [
  "/",
  ...products.map((product) => `/product/${product.slug}`),
  "/category/earbuds",
  "/category/neckband",
  "/category/android-and-iphone-charger",
  "/category/data-cable",
  "/faqs",
  "/reviews",
  "/warranty",
  "/blog",
  "/blog/how-to-choose-wireless-earbuds",
  "/blog/tws-earbuds-vs-bluetooth-neckband",
  "/blog/how-to-choose-fast-mobile-charger",
  "/blog/what-to-look-for-before-buying-bluetooth-neckband",
  "/blog/usb-a-to-type-c-cable-uses-benefits-buying-guide",
  "/blog/fast-charging-cable-vs-normal-data-cable",
  "/blog/20w-usb-c-charger-features-compatibility-guide",
  "/blog/how-to-choose-the-right-data-cable-for-smartphone",
  "/blog/wireless-earbuds-with-microphone-features-to-compare",
  "/blog/bluetooth-neckband-battery-life-what-affects-playtime",
  "/blog/usb-2-data-cable-vs-fast-charging-cable",
  "/blog/usb-c-charger-vs-usb-a-charger-differences",
  "/blog/what-does-480mbps-mean-in-data-cable",
  "/blog/how-to-choose-charging-cable-for-android-phones",
  "/blog/tws-earbuds-buying-guide-microphone-battery-sound",
];
const titles = new Map();
const descriptions = new Map();

for (const pagePath of publicPaths) {
  const meta = resolvePageMeta(pagePath, products);
  if (meta.robots !== "index, follow") fail(`${pagePath} is not indexable`);
  if (!meta.canonical.startsWith("https://mizazy.com")) fail(`${pagePath} canonical is not https://mizazy.com`);
  if (meta.canonical.includes("://www.")) fail(`${pagePath} canonical uses www`);
  if (titles.has(meta.title)) fail(`Duplicate title "${meta.title}" on ${pagePath} and ${titles.get(meta.title)}`);
  if (descriptions.has(meta.description)) fail(`Duplicate description on ${pagePath} and ${descriptions.get(meta.description)}`);
  titles.set(meta.title, pagePath);
  descriptions.set(meta.description, pagePath);
  if (!meta.title || meta.title.length > 70) fail(`${pagePath} title length ${meta.title?.length}`);
  if (!meta.description || meta.description.length > 180) fail(`${pagePath} description length ${meta.description?.length}`);

  const rendered = applyToIndexHtml(html, meta);
  if ((rendered.match(/<title[\s>]/g) || []).length !== 1) fail(`${pagePath} does not have one title`);
  if ((rendered.match(/name="description"/g) || []).length !== 1) fail(`${pagePath} does not have one description`);
  if (!rendered.includes(`rel="canonical" href="${meta.canonical}"`)) fail(`${pagePath} canonical missing from HTML`);
  if (!rendered.includes('property="og:title"') || !rendered.includes('name="twitter:title"')) {
    fail(`${pagePath} is missing social tags`);
  }
  const jsonMatch = rendered.match(/<script data-seo="jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!jsonMatch) fail(`${pagePath} is missing JSON-LD`);
  else {
    const data = JSON.parse(jsonMatch[1]);
    const graph = data["@graph"] || [];
    if (JSON.stringify(data).includes("aggregateRating")) fail(`${pagePath} invents an aggregate rating`);
    if (pagePath.startsWith("/category/")) {
      const collection = graph.find((node) => node["@type"] === "CollectionPage");
      const breadcrumb = graph.find((node) => node["@type"] === "BreadcrumbList");
      if (!collection) fail(`${pagePath} category schema missing CollectionPage`);
      if (!breadcrumb) fail(`${pagePath} category schema missing BreadcrumbList`);
      if (graph.some((node) => node["@type"] === "Product")) {
        fail(`${pagePath} category schema must not use Product`);
      }
      const listed = collection?.mainEntity?.itemListElement || [];
      if (!listed.length) fail(`${pagePath} category ItemList is empty`);
      for (const item of listed) {
        if (item.offers || item.aggregateRating || item.review) {
          fail(`${pagePath} category list invents product offers or reviews`);
        }
      }
    }

    if (pagePath.startsWith("/product/")) {
      const product = graph.find((node) => node["@type"] === "Product");
      const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList");
      const source = products.find((item) => `/product/${item.slug}` === pagePath);
      if (!product || !product.offers || product.offers.price !== String(source.price) || product.offers.priceCurrency !== "INR") {
        fail(`${pagePath} product offer does not match the catalog price`);
      }
      if (!crumbs) fail(`${pagePath} is missing breadcrumb schema`);
    }
    if (pagePath === "/" && !graph.some((node) => node["@type"] === "Organization")) fail("Homepage is missing Organization schema");
    if (pagePath.startsWith("/blog")) {
      if (meta.statusCode !== 200) fail(`${pagePath} should return HTTP 200`);
      if (!meta.bodyHtml) fail(`${pagePath} is missing first-response HTML`);
      if (!rendered.includes(`<div id="root">${meta.bodyHtml}</div>`)) fail(`${pagePath} article HTML is not inside #root`);
      const h1s = meta.bodyHtml.match(/<h1>/g) || [];
      if (h1s.length !== 1) fail(`${pagePath} initial HTML has ${h1s.length} h1 elements`);
      if (meta.bodyHtml.includes("display:none") || meta.bodyHtml.includes("hidden")) {
        fail(`${pagePath} hides injected content`);
      }
      const rootClose = rendered.indexOf(meta.bodyHtml) + meta.bodyHtml.length;
      if (!rendered.slice(rootClose, rootClose + 20).includes("</div>")) fail(`${pagePath} root was not closed after the article`);
      if (pagePath === "/blog") {
        if (!graph.some((node) => node["@type"] === "Blog")) fail("/blog is missing Blog schema");
        if (!graph.some((node) => node["@type"] === "BreadcrumbList")) fail("/blog is missing breadcrumb schema");
        if (!rendered.includes('property="og:type" content="website"')) fail("/blog og:type should be website");
        const listed = graph.find((node) => node["@type"] === "Blog")?.mainEntity?.itemListElement || [];
        if (listed.length !== 15) fail(`/blog ItemList has ${listed.length} articles`);
      } else {
        const posting = graph.find((node) => node["@type"] === "BlogPosting");
        if (!posting) fail(`${pagePath} is missing BlogPosting schema`);
        if (!posting?.headline || !posting?.datePublished || !posting?.author || !posting?.publisher) {
          fail(`${pagePath} BlogPosting is incomplete`);
        }
        if (posting?.author?.["@type"] !== "Organization" || posting?.author?.name !== "MIZAZY") {
          fail(`${pagePath} author is not Organization MIZAZY`);
        }
        if (posting?.dateModified) fail(`${pagePath} sets dateModified without an update`);
        if (!rendered.includes('property="og:type" content="article"')) fail(`${pagePath} og:type should be article`);
        for (const href of ["/product/", "/category/"]) {
          if (!meta.bodyHtml.includes(href)) fail(`${pagePath} initial HTML is missing a ${href} link`);
        }
      }
      if (graph.some((node) => node["@type"] === "Product")) fail(`${pagePath} must not use Product schema`);
      if (!/^https:\/\/res\.cloudinary\.com\//.test(meta.image)) fail(`${pagePath} image is not an https Cloudinary URL`);
    } else if (meta.bodyHtml) {
      fail(`${pagePath} should not inject blog HTML`);
    }
  }
}

const checkout = resolvePageMeta("/checkout", products);
if (!checkout.robots.includes("noindex")) fail("Checkout is indexable");

const missing = resolvePageMeta("/blog/not-a-real-mizazy-guide", products);
if (missing.statusCode !== 404) fail("Unknown blog slug should be HTTP 404");
if (!missing.robots.includes("noindex")) fail("Unknown blog slug is indexable");
if (!missing.bodyHtml || missing.bodyHtml.includes("Mizazy Blog")) fail("Unknown blog slug rendered the blog listing");
const missingHtml = applyToIndexHtml(html, missing);
if (missingHtml.includes("How to Choose Wireless Earbuds: A Complete Buying Guide")) {
  fail("Unknown blog slug rendered a real article");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`SEO valid: ${publicPaths.length} public pages, unique titles and descriptions, non-www canonicals.`);
