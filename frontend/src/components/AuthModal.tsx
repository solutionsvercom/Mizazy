import { useState } from "react";
import { useStore } from "../store";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, phone, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[81] flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-[#0e0e0e] border border-white/08 rounded-2xl p-7 animate-scale-in">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="section-label mb-2">My MIZAZY</p>
              <h2 className="font-display font-800 text-white text-2xl">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/06 flex items-center justify-center text-white/40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Full name</label>
                  <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Phone</label>
                  <input className="input-dark" value={phone} maxLength={10} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} required />
                </div>
              </>
            )}
            <div>
              <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Email</label>
              <input className="input-dark" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Password</label>
              <input className="input-dark" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" className="btn-gold w-full justify-center py-3.5" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-white/35 text-sm mt-5">
            {mode === "login" ? "New to MIZAZY?" : "Already have an account?"}{" "}
            <button
              className="text-[#D4A520] font-600"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
