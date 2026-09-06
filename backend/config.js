/** Canonical site URLs for MIZAZY */
export const SITE = {
  production: "https://mizazy.com",
  productionWww: "https://www.mizazy.com",
  localFrontend: "http://localhost:5173",
  localBackend: "http://localhost:5000",
};

export function getAppUrl() {
  return (
    process.env.APP_URL ||
    process.env.CLIENT_URL ||
    (process.env.NODE_ENV === "production" ? SITE.production : SITE.localFrontend)
  );
}

export function getAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = [
    SITE.production,
    SITE.productionWww,
    SITE.localFrontend,
    SITE.localBackend,
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
  ];

  const appUrl = getAppUrl();
  return [...new Set([appUrl, ...fromEnv, ...defaults])];
}
