import { useEffect } from "react";
import { INFO_TOPICS, type InfoTopic } from "../helpContent";

interface InfoModalProps {
  topic: InfoTopic | null;
  onClose: () => void;
}

export default function InfoModal({ topic, onClose }: InfoModalProps) {
  useEffect(() => {
    if (!topic) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [topic, onClose]);

  if (!topic) return null;
  const { title, body } = INFO_TOPICS[topic];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-display font-700 text-white text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto text-white/55 text-sm leading-relaxed font-body">{body}</div>
      </div>
    </div>
  );
}
