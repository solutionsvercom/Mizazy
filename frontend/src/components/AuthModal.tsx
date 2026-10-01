import { useState } from "react";
import { useStore } from "../store";
import { api } from "../api";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "login" | "register" | "forgot";

const HEADINGS: Record<Mode, string> = {
  login: "Welcome back",
  register: "Create account",
  forgot: "Forgot password",
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useStore();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const close = () => {
    switchMode("login");
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const res = await api.forgotPassword(email);
        setNotice(res.message);
        return;
      }
      if (mode === "login") await login(email, password);
      else await register(name, email, phone, password);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm animate-fade-in" onClick={close} />
      <div className="fixed inset-0 z-[81] flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-[#0e0e0e] border border-white/08 rounded-2xl p-7 animate-scale-in">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="section-label mb-2">My MIZAZY</p>
              <h2 className="font-display font-800 text-white text-2xl">{HEADINGS[mode]}</h2>
              {mode === "forgot" && (
                <p className="text-white/40 text-sm mt-2">Enter your account email and we'll send you a link to reset your password.</p>
              )}
            </div>
            <button onClick={close} className="w-8 h-8 rounded-lg hover:bg-white/06 flex items-center justify-center text-white/40">
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
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-white/40 text-xs font-display font-600 tracking-wide uppercase">Password</label>
                  {mode === "login" && (
                    <button type="button" className="text-[#D4A520] text-xs font-600 hover:underline" onClick={() => switchMode("forgot")}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <input className="input-dark" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {notice && <p className="text-[#5DD87A] text-xs leading-relaxed">{notice}</p>}
            <button type="submit" className="btn-gold w-full justify-center py-3.5" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : mode === "register"
                    ? "Create account"
                    : notice
                      ? "Resend reset link"
                      : "Send reset link"}
            </button>
          </form>

          <p className="text-center text-white/35 text-sm mt-5">
            {mode === "forgot" ? (
              <>
                Remembered it?{" "}
                <button className="text-[#D4A520] font-600" onClick={() => switchMode("login")}>Back to sign in</button>
              </>
            ) : (
              <>
                {mode === "login" ? "New to MIZAZY?" : "Already have an account?"}{" "}
                <button className="text-[#D4A520] font-600" onClick={() => switchMode(mode === "login" ? "register" : "login")}>
                  {mode === "login" ? "Create account" : "Sign in"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
