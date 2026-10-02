function settings() {
  const token = (process.env.DELHIVERY_API_TOKEN || "").trim();
  const mode = (process.env.DELHIVERY_ENV || "production").trim().toLowerCase() === "staging" ? "staging" : "production";
  return {
    token,
    mode,
    baseUrl: mode === "staging" ? "https://staging-express.delhivery.com" : "https://track.delhivery.com",
    pickupLocation: (process.env.DELHIVERY_PICKUP_LOCATION || "").trim(),
    weightGrams: Number(process.env.DELHIVERY_DEFAULT_WEIGHT_GRAMS) || 500,
  };
}

export function isDelhiveryConfigured() {
  return Boolean(settings().token);
}

export function delhiveryMode() {
  return settings().mode;
}

export const isDelhiveryPartner = (partner) => /delhivery/i.test(String(partner || ""));

export const delhiveryTrackingUrl = (awb) => `https://www.delhivery.com/track-v2/package/${encodeURIComponent(awb)}`;

async function call(path, init = {}) {
  const { token, baseUrl } = settings();
  if (!token) throw new Error("Delhivery is not configured (DELHIVERY_API_TOKEN is missing)");
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", Authorization: `Token ${token}`, ...(init.headers || {}) },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (res.status === 401 || res.status === 403) throw new Error("Delhivery rejected the API token. Check DELHIVERY_API_TOKEN.");
  if (!res.ok) throw new Error(data.error || data.message || data.rmk || `Delhivery request failed (${res.status})`);
  return data;
}

const toDate = (value) => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

/** Live tracking for one AWB, normalised to what the order stores in `courier`. */
export async function trackShipment(awb) {
  const data = await call(`/api/v1/packages/json/?waybill=${encodeURIComponent(awb)}`);
  const shipment = data?.ShipmentData?.[0]?.Shipment;
  if (!shipment) throw new Error(data?.Error || data?.error || "Delhivery has no tracking for this AWB yet");
  const s = shipment.Status || {};
  const scans = (shipment.Scans || [])
    .map(({ ScanDetail: d = {} }) => ({
      status: d.Scan || d.Instructions || "",
      location: d.ScannedLocation || "",
      instructions: d.Instructions && d.Instructions !== d.Scan ? d.Instructions : "",
      time: toDate(d.ScanDateTime || d.StatusDateTime),
    }))
    .filter((x) => x.status)
    .sort((a, b) => (b.time?.getTime() || 0) - (a.time?.getTime() || 0));

  return {
    awb: String(shipment.AWB || awb),
    status: s.Status || "",
    statusType: s.StatusType || "",
    location: s.StatusLocation || "",
    instructions: s.Instructions || "",
    statusAt: toDate(s.StatusDateTime),
    expectedDelivery: toDate(shipment.ExpectedDeliveryDate || shipment.PromisedDeliveryDate),
    scans,
    fetchedAt: new Date(),
  };
}

/** Creates a forward shipment for an order and returns its AWB. */
export async function createShipment(order) {
  const { pickupLocation, weightGrams } = settings();
  if (!pickupLocation) {
    throw new Error("Set DELHIVERY_PICKUP_LOCATION to your pickup warehouse name exactly as it appears in Delhivery One.");
  }
  const cod = order.payment?.method === "cod" && order.payment?.status !== "confirmed";
  const a = order.address || {};
  const quantity = order.items.reduce((n, i) => n + (i.quantity || 1), 0);
  const payload = {
    shipments: [
      {
        name: a.name,
        add: a.address,
        pin: a.pincode,
        city: a.city,
        state: a.state,
        country: "India",
        phone: String(a.phone || order.phone).replace(/\D/g, "").slice(-10),
        order: order.orderNumber,
        payment_mode: cod ? "COD" : "Prepaid",
        cod_amount: cod ? order.totals.total : 0,
        total_amount: order.totals.total,
        products_desc: order.items.map((i) => `${i.name} x${i.quantity}`).join(", ").slice(0, 250),
        quantity,
        weight: weightGrams * Math.max(1, quantity),
        shipping_mode: order.delivery === "express" ? "Express" : "Surface",
        seller_name: "MIZAZY",
      },
    ],
    pickup_location: { name: pickupLocation },
  };
  const data = await call("/api/cmu/create.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ format: "json", data: JSON.stringify(payload) }).toString(),
  });
  const pkg = data?.packages?.[0];
  if (!pkg?.waybill || data.success === false) {
    const remarks = [].concat(pkg?.remarks || [], data?.rmk || []).filter(Boolean).join(" ");
    throw new Error(remarks || "Delhivery did not create the shipment");
  }
  return String(pkg.waybill);
}
