import { useCallback, useEffect, useState, type FormEvent } from "react";
import { MIZAZY_LOGO_URL } from "../brand";
import { AdminAuthError, adminApi, getAdminToken, setAdminToken, type AdminStats } from "./adminApi";
import { COLLECTIONS, getPath, orderStatusPill } from "./collections";
import CollectionManager from "./CollectionManager";

type Section = "dashboard" | "settings" | (typeof COLLECTIONS)[number]["id"];

const inputClass =
  "w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#D4A520]/60";

export default function AdminApp() {
  const [token, setToken] = useState(getAdminToken);
  const [email, setEmail] = useState("");
  const [section, setSection] = useState<Section>("dashboard");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "MIZAZY Admin";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  const signOut = useCallback(() => {
    setAdminToken(null);
    setToken(null);
    setEmail("");
    setSection("dashboard");
  }, []);

  const onAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof AdminAuthError) {
        signOut();
        return true;
      }
      return false;
    },
    [signOut]
  );

  useEffect(() => {
    if (!token) return;
    adminApi.me().then((a) => setEmail(a.email)).catch(onAuthError);
  }, [token, onAuthError]);

  if (!token) {
    return (
      <Login
        onSignedIn={(t, e) => {
          setAdminToken(t);
          setToken(t);
          setEmail(e);
        }}
      />
    );
  }

  const go = (s: Section) => {
    setSection(s);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const nav: { id: Section; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    ...COLLECTIONS.map((c) => ({ id: c.id as Section, label: c.label })),
    { id: "settings", label: "Settings" },
  ];
  const active = COLLECTIONS.find((c) => c.id === section);

  return (
    <div className="min-h-screen bg-[#050505] text-white md:flex">
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/8">
        <img src={MIZAZY_LOGO_URL} alt="MIZAZY" className="h-7" />
        <button onClick={() => setMenuOpen(!menuOpen)} className="px-3 py-1.5 rounded-lg border border-white/12 text-sm">
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      <aside className={`${menuOpen ? "block" : "hidden"} md:block md:w-60 md:min-h-screen border-r border-white/8 bg-[#0a0a0a] md:sticky md:top-0 md:h-screen md:overflow-y-auto`}>
        <div className="hidden md:block px-5 py-6">
          <img src={MIZAZY_LOGO_URL} alt="MIZAZY" className="h-8" />
          <p className="text-white/30 text-xs mt-2 tracking-wider uppercase">Admin panel</p>
        </div>
        <nav className="px-3 pb-4 space-y-0.5">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                section === item.id ? "bg-[#D4A520]/15 text-[#D4A520]" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/8 text-xs text-white/40">
          <p className="truncate mb-2">{email}</p>
          <div className="flex gap-3">
            <a href="/" className="hover:text-white">View store</a>
            <button onClick={signOut} className="hover:text-white">Sign out</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-8">
        {section === "dashboard" && (
          <Dashboard
            onAuthError={onAuthError}
            onOpenOrder={(id) => {
              setOpenOrderId(id);
              go("orders");
            }}
            onGo={go}
          />
        )}
        {section === "settings" && <Settings email={email} onAuthError={onAuthError} onTokenChanged={(t) => { setAdminToken(t); setToken(t); }} />}
        {active && (
          <CollectionManager
            key={active.id}
            config={active}
            onAuthError={onAuthError}
            openId={active.id === "orders" ? openOrderId : null}
            onOpened={() => setOpenOrderId(null)}
          />
        )}
      </main>
    </div>
  );
}

function Login({ onSignedIn }: { onSignedIn: (token: string, email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await adminApi.login(email, password);
      onSignedIn(data.token, data.admin.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/8 bg-[#0b0b0b] p-8">
        <img src={MIZAZY_LOGO_URL} alt="MIZAZY" className="h-9 mb-2" />
        <p className="text-white/40 text-sm mb-8">Admin panel sign-in</p>
        <label className="block text-white/60 text-xs font-semibold mb-1.5">Email</label>
        <input className={`${inputClass} mb-4`} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="block text-white/60 text-xs font-semibold mb-1.5">Password</label>
        <input className={`${inputClass} mb-5`} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button type="submit" disabled={busy} className="w-full py-2.5 rounded-lg bg-[#D4A520] text-black font-bold text-sm hover:bg-[#e6b830] disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onAuthError, onOpenOrder, onGo }: { onAuthError: (err: unknown) => boolean; onOpenOrder: (id: string) => void; onGo: (s: Section) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.stats().then(setStats).catch((err) => {
      if (!onAuthError(err)) setError(err instanceof Error ? err.message : "Could not load dashboard");
    });
  }, [onAuthError]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!stats) return <p className="text-white/40">Loading dashboard…</p>;

  const cards: { label: string; value: string; go?: Section }[] = [
    { label: "Revenue (excl. cancelled)", value: `₹${stats.revenue.toLocaleString("en-IN")}`, go: "orders" },
    { label: "Orders today", value: String(stats.counts.ordersToday), go: "orders" },
    { label: "Total orders", value: String(stats.counts.orders), go: "orders" },
    { label: "Customers", value: String(stats.counts.users), go: "users" },
    { label: "Products", value: String(stats.counts.products), go: "products" },
    { label: "Abandoned carts", value: String(stats.counts.activeCarts), go: "carts" },
    { label: "Active coupons", value: String(stats.counts.coupons), go: "coupons" },
    { label: "Subscribers", value: String(stats.counts.subscribers), go: "subscribers" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => (
          <button key={c.label} onClick={() => c.go && onGo(c.go)} className="text-left rounded-xl border border-white/8 bg-[#0b0b0b] p-4 hover:border-[#D4A520]/40 transition-colors">
            <p className="text-white/40 text-xs">{c.label}</p>
            <p className="text-white text-2xl font-bold mt-1">{c.value}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/8 bg-[#0b0b0b] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex justify-between items-center">
            <h2 className="font-bold text-white">Recent orders</h2>
            <button onClick={() => onGo("orders")} className="text-[#D4A520] text-xs font-semibold">View all →</button>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-white/40 text-sm">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id} onClick={() => onOpenOrder(o._id)} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] cursor-pointer text-white/70">
                    <td className="px-5 py-3 font-semibold text-white">{String(o.orderNumber)}</td>
                    <td className="px-5 py-3">{String(getPath(o, "address.name") || "—")}</td>
                    <td className="px-5 py-3">₹{Number(getPath(o, "totals.total") || 0).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right">{orderStatusPill(o)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border border-white/8 bg-[#0b0b0b] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="font-bold text-white">Low stock (under 5)</h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="px-5 py-8 text-white/40 text-sm">All products are well stocked.</p>
          ) : (
            <ul>
              {stats.lowStock.map((p) => (
                <li key={p._id} className="px-5 py-3 border-b border-white/5 last:border-0 flex justify-between text-sm">
                  <span className="text-white/70 truncate pr-3">{p.name}</span>
                  <span className="text-red-400 font-semibold">{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Settings({ email, onAuthError, onTokenChanged }: { email: string; onAuthError: (err: unknown) => boolean; onTokenChanged: (token: string) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("New passwords don't match.");
    setBusy(true);
    try {
      const data = await adminApi.changePassword(current, next);
      onTokenChanged(data.token);
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage("Password changed. Other signed-in admin sessions have been signed out.");
    } catch (err) {
      if (!onAuthError(err)) setError(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
      <p className="text-white/40 text-sm mb-6">Signed in as {email}</p>
      <form onSubmit={submit} className="rounded-xl border border-white/8 bg-[#0b0b0b] p-6 space-y-4">
        <h2 className="text-[#D4A520] text-xs font-bold uppercase tracking-wider">Change password</h2>
        <div>
          <label className="block text-white/60 text-xs font-semibold mb-1.5">Current password</label>
          <input className={inputClass} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div>
          <label className="block text-white/60 text-xs font-semibold mb-1.5">New password</label>
          <input className={inputClass} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
          <p className="text-white/30 text-xs mt-1">At least 8 characters. Use a mix of letters, numbers and symbols.</p>
        </div>
        <div>
          <label className="block text-white/60 text-xs font-semibold mb-1.5">Confirm new password</label>
          <input className={inputClass} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-[#5DD87A] text-sm">{message}</p>}
        <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-lg bg-[#D4A520] text-black text-sm font-bold hover:bg-[#e6b830] disabled:opacity-50">
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
