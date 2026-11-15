import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(root, "frontend/public/sitemap.xml");
const failures = [];

function fail(message) {
  failures.push(message);
}

function categorySlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const catalog = readFileSync(path.join(root, "backend/catalog.js"), "utf8");
const productSlugs = [...catalog.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
if (productSlugs.length !== 8) {
  fail(`Expected 8 catalog product slugs, found ${productSlugs.length}: ${productSlugs.join(", ")}`);
}

const dataSource = readFileSync(path.join(root, "frontend/src/data.ts"), "utf8");
const categoriesBlock = dataSource.slice(
  dataSource.indexOf("export const categories"),
  dataSource.indexOf("export const reviews")
);
const categoryNames = [...categoriesBlock.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]);
const categoryPaths = categoryNames.map((name) => `/category/${categorySlug(name)}`);

const parsed = spawnSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    `$xml = New-Object System.Xml.XmlDocument; $xml.Load(${JSON.stringify(sitemapPath)}); $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable); $ns.AddNamespace('s','http://www.sitemaps.org/schemas/sitemap/0.9'); $locs = @($xml.SelectNodes('//s:loc',$ns) | ForEach-Object { $_.InnerText }); @{ root = $xml.DocumentElement.LocalName; locs = $locs } | ConvertTo-Json -Compress`,
  ],
  { encoding: "utf8" }
);

if (parsed.status !== 0) {
  fail(`XML parse failed: ${(parsed.stderr || parsed.stdout || "").trim()}`);
}

let locs = [];
let rootName = "";
if (parsed.status === 0) {
  const payload = JSON.parse(parsed.stdout);
  rootName = payload.root;
  locs = payload.locs || [];
  if (rootName !== "urlset" && rootName !== "sitemapindex") {
    fail(`Root element is ${rootName}, expected urlset or sitemapindex`);
  }
}

const seen = new Set();
for (const loc of locs) {
  if (!loc.startsWith("https://")) fail(`URL is not absolute HTTPS: ${loc}`);
  let url;
  try {
    url = new URL(loc);
  } catch {
    fail(`URL does not parse: ${loc}`);
    continue;
  }
  if (url.hostname !== "mizazy.com") fail(`URL is not on mizazy.com: ${loc}`);
  if (url.search || url.hash) fail(`URL has a query or hash: ${loc}`);
  if (url.pathname !== "/" && url.pathname.endsWith("/")) fail(`Non-canonical trailing slash: ${loc}`);
  if (url.pathname !== "/" && loc !== `https://mizazy.com${url.pathname}`) {
    fail(`Non-canonical URL: ${loc}`);
  }
  if (seen.has(loc)) fail(`Duplicate URL: ${loc}`);
  seen.add(loc);
  const blocked = ["/admin", "/account", "/checkout", "/confirmation", "/reset-password", "/payment-status", "/track", "/api"];
  if (blocked.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
    fail(`Excluded route included: ${loc}`);
  }
}

for (const slug of productSlugs) {
  const loc = `https://mizazy.com/product/${slug}`;
  if (!seen.has(loc)) fail(`Missing product URL: ${loc}`);
}

for (const categoryPath of categoryPaths) {
  const loc = `https://mizazy.com${categoryPath}`;
  if (!seen.has(loc)) fail(`Missing category URL: ${loc}`);
}

for (const page of ["/", "/faqs", "/reviews", "/warranty", "/blog", "/blog/how-to-choose-wireless-earbuds", "/blog/tws-earbuds-vs-bluetooth-neckband", "/blog/how-to-choose-fast-mobile-charger"]) {
  const loc = page === "/" ? "https://mizazy.com/" : `https://mizazy.com${page}`;
  if (!seen.has(loc)) fail(`Missing public page: ${loc}`);
}

if (locs.length !== 20) fail(`Expected 20 sitemap URLs, found ${locs.length}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Sitemap valid: ${locs.length} URLs, root <${rootName}>, ${productSlugs.length} products.`);
for (const loc of locs) console.log(loc);
