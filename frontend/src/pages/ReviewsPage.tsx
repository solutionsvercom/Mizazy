import { ReviewsSection } from "./HomePage";

interface ReviewsPageProps {
  onNavigate: (page: string) => void;
}

export default function ReviewsPage({ onNavigate }: ReviewsPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <button onClick={() => onNavigate("home")} className="text-white/40 hover:text-white text-sm transition-colors">
          ← Back to home
        </button>
      </div>
      <ReviewsSection />
    </div>
  );
}
