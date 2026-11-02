import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Product } from "../data";
import { api } from "../api";
import { useStore } from "../store";

interface WarrantyPageProps {
  onNavigate: (page: string) => void;
  initialProductId?: string | null;
}

const steps = [
  { num: 1, label: "Product" },
  { num: 2, label: "Your details" },
];

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export default function WarrantyPage({ onNavigate, initialProductId }: WarrantyPageProps) {
  const { products, user } = useStore();
  const [step, setStep] = useState(() => (products.some((p) => p.id === initialProductId) ? 2 : 1));
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState<Product | null>(() => products.find((p) => p.id === initialProductId) ?? null);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone ? normalizePhone(user.phone) : "");
  const [email, setEmail] = useState(user?.email || "");
  const [invoice, setInvoice] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ claimNumber: string; email: string; emailed: boolean } | null>(null);

  useEffect(() => {
    if (!invoice || !invoice.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(invoice);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [invoice]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : products;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query]);

  const pickFile = (file: File | null) => {
    setError("");
    if (!file) {
      setInvoice(null);
      return;
    }
    const ok = /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf)$/.test(file.type);
    if (!ok) {
      setInvoice(null);
      setError("Upload a JPEG, PNG, WebP, HEIC photo or a PDF of your invoice.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setInvoice(null);
      setError("Invoice must be 5MB or smaller.");
      return;
    }
    setInvoice(file);
  };

  const goToDetails = () => {
    if (!product) {
      setError("Choose the product you want to claim warranty for.");
      return;
    }
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!EMAIL_OK.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!invoice) {
      setError("Upload your purchase invoice.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("productId", product.id);
      body.append("name", name.trim());
      body.append("phone", phone);
      body.append("email", email.trim());
      body.append("invoice", invoice);
      const claim = await api.claimWarranty(body);
      setResult(claim);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your warranty claim.");
    } finally {
      setSubmitting(false);
    }
  };

  const startOver = () => {
    setResult(null);
    setStep(1);
    setProduct(null);
    setInvoice(null);
    setError("");
    setQuery("");
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
        <div className="max-w-xl mx-auto px-5 sm:px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#5DD87A]/15 flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#5DD87A">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <p className="section-label mb-2">Warranty</p>
          <h1 className="font-display font-700 text-white text-3xl sm:text-4xl mb-4">Thank you for purchasing with us</h1>
          <p className="text-white/55 text-sm leading-relaxed mb-2">
            Your warranty submission <span className="text-white font-display font-700">{result.claimNumber}</span> is in
            {product ? <> for {product.name}</> : null}.
          </p>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            {result.emailed
              ? <>A confirmation email has been sent to <span className="text-[#D4A520]">{result.email}</span>.</>
              : <>Your claim is saved under {result.email}. The confirmation email could not be sent just now, and our team still has your submission.</>}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button type="button" onClick={() => onNavigate("home")} className="btn-gold">Back to home</button>
            <button type="button" onClick={startOver} className="btn-outline">Submit another claim</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <button onClick={() => onNavigate("home")} className="text-white/40 hover:text-white text-sm mb-8 transition-colors">
          ← Back to home
        </button>
        <p className="section-label mb-2">Support</p>
        <h1 className="section-heading text-4xl sm:text-5xl text-white mb-3">Claim your warranty</h1>
        <p className="text-white/40 mb-8 max-w-xl">
          Every MIZAZY product includes a 1-year warranty against manufacturing defects. Choose the product, then share your details and invoice.
        </p>

        <div className="flex items-center mb-8 max-w-sm">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`step-dot ${step > s.num ? "done" : step === s.num ? "active" : "inactive"}`}>
                  {step > s.num ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  ) : s.num}
                </div>
                <span className={`text-[10px] font-display font-600 mt-1.5 tracking-wide ${step === s.num ? "text-white" : "text-white/30"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className={`step-line mx-2 mb-4 ${step > s.num ? "done" : "inactive"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-[#0e0e0e] rounded-2xl border border-white/06 p-5 sm:p-8">
            <h2 className="font-display font-700 text-white text-xl mb-4">Select a product</h2>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="input-dark mb-5"
            />
            {visible.length === 0 ? (
              <p className="text-white/40 text-sm">No products match that search.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {visible.map((item) => {
                  const selected = product?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setProduct(item); setError(""); }}
                      className={`text-left rounded-xl border p-3 transition-all ${selected ? "border-[#D4A520] bg-[#D4A520]/10" : "border-white/08 bg-black/20 hover:border-white/20"}`}
                    >
                      <div className="aspect-square rounded-lg bg-white/5 mb-3 overflow-hidden flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <p className="font-display font-600 text-white text-sm leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-white/35 text-xs mt-1">{item.category}</p>
                    </button>
                  );
                })}
              </div>
            )}
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
            <button type="button" onClick={goToDetails} className="btn-gold mt-6 w-full sm:w-auto justify-center">
              Continue
            </button>
          </div>
        )}

        {step === 2 && product && (
          <form onSubmit={submit} className="bg-[#0e0e0e] rounded-2xl border border-white/06 p-5 sm:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/06">
              <img src={product.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-white/5" />
              <div className="flex-1 min-w-0">
                <p className="text-white/35 text-xs uppercase tracking-wide font-display font-600">Selected product</p>
                <p className="font-display font-700 text-white truncate">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => { setStep(1); setError(""); }}
                className="text-[#D4A520] text-sm font-display font-600"
              >
                Change
              </button>
            </div>

            <h2 className="font-display font-700 text-white text-xl mb-6">Your details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="warranty-name" className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Full name</label>
                <input id="warranty-name" className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="warranty-phone" className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Phone number</label>
                <input
                  id="warranty-phone"
                  className="input-dark"
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="warranty-email" className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Email ID</label>
                <input
                  id="warranty-email"
                  className="input-dark"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="warranty-invoice" className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Invoice</label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-8 cursor-pointer hover:border-[#D4A520]/50 transition-colors">
                  <input
                    id="warranty-invoice"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                    className="sr-only"
                    onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                  />
                  {preview ? (
                    <img src={preview} alt="Invoice preview" className="max-h-40 rounded-lg object-contain" />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4A520" strokeWidth="1.6">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  )}
                  <span className="text-white/70 text-sm text-center">
                    {invoice ? invoice.name : "Upload a photo or PDF of your invoice"}
                  </span>
                  <span className="text-white/30 text-xs">JPEG, PNG, WebP, HEIC or PDF · max 5MB</span>
                </label>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="submit" disabled={submitting} className="btn-gold justify-center disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit warranty claim"}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(""); }} className="btn-outline justify-center">
                Back
              </button>
            </div>
            <p className="text-white/30 text-xs mt-4">
              After you submit, a thank-you email with your warranty reference is sent to the email address above.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
