import { useState } from "react";
import { api } from "../api";
import { useStore } from "../store";

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
  onAuthOpen: () => void;
}

export default function ResetPasswordPage({ onNavigate, onAuthOpen }: ResetPasswordPageProps) {
  const { startSession } = useStore();
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await api.resetPassword({ email, token, password });
      startSession(data.token, data.user);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  const linkMissing = !token || !email;

  return (
    <div className="min-h-screen bg-[#050505] py-20 px-6">
      <div className="max-w-md mx-auto bg-[#0e0e0e] border border-white/07 rounded-2xl p-8">
        <p className="section-label mb-3">My MIZAZY</p>

        {done ? (
          <>
            <h1 className="section-heading text-3xl text-white mb-3">Password updated</h1>
            <p className="text-white/45 mb-8">Your password has been changed and you're now signed in.</p>
            <button className="btn-gold justify-center w-full py-3.5" onClick={() => onNavigate("home")}>Continue shopping</button>
          </>
        ) : linkMissing ? (
          <>
            <h1 className="section-heading text-3xl text-white mb-3">Invalid reset link</h1>
            <p className="text-white/45 mb-8">This link is incomplete. Please request a new password reset link.</p>
            <button className="btn-gold justify-center w-full py-3.5" onClick={onAuthOpen}>Request new link</button>
          </>
        ) : (
          <>
            <h1 className="section-heading text-3xl text-white mb-2">Set a new password</h1>
            <p className="text-white/40 text-sm mb-7">For {email}</p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">New password</label>
                <input className="input-dark" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoFocus />
              </div>
              <div>
                <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Confirm password</label>
                <input className="input-dark" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" className="btn-gold w-full justify-center py-3.5" disabled={loading}>
                {loading ? "Please wait..." : "Update password"}
              </button>
            </form>
            {error && (
              <button className="text-[#D4A520] text-sm font-600 mt-5" onClick={onAuthOpen}>Request a new reset link</button>
            )}
          </>
        )}

        <button className="block text-white/40 hover:text-white text-sm mt-6 transition-colors" onClick={() => onNavigate("home")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
