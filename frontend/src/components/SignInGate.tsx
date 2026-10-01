interface SignInGateProps {
  title: string;
  description: string;
  onAuthOpen: () => void;
  onNavigate: (page: string) => void;
}

export default function SignInGate({ title, description, onAuthOpen, onNavigate }: SignInGateProps) {
  return (
    <div className="min-h-screen bg-[#050505] py-20 px-6 cursor-pointer" onClick={() => onNavigate("home")}>
      <div
        className="max-w-lg mx-auto text-center bg-[#0e0e0e] border border-white/07 rounded-2xl p-10 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="section-label mb-3">My MIZAZY</p>
        <h1 className="section-heading text-3xl text-white mb-3">{title}</h1>
        <p className="text-white/40 mb-8">{description}</p>
        <button className="btn-gold justify-center w-full py-3.5" onClick={onAuthOpen}>Sign in / Register</button>
        <button className="text-white/40 hover:text-white text-sm mt-5 transition-colors" onClick={() => onNavigate("home")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
