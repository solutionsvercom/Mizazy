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
  }
}

const checkout = resolvePageMeta("/checkout", products);
if (!checkout.robots.includes("noindex")) fail("Checkout is indexable");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`SEO valid: ${publicPaths.length} public pages, unique titles and descriptions, non-www canonicals.`);
