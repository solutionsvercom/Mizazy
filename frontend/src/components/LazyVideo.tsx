import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { videoPoster } from "../media";

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & { src: string };

export default function LazyVideo({ src, poster, ...rest }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      setLoaded(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setLoaded(true);
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !loaded) return;
    if (inView) el.play().catch(() => {});
    else el.pause();
  }, [inView, loaded]);

  return (
    <video
      ref={ref}
      {...rest}
      src={loaded ? src : undefined}
      poster={poster ?? videoPoster(src)}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
