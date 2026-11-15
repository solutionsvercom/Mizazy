import type { MouseEvent } from "react";
import { ARTICLES, BLOG_LISTING, formatBlogDate } from "../blogPosts.js";

interface BlogPageProps {
  onNavigate: (page: string) => void;
  onOpenBlog: (slug: string | null) => void;
}

export default function BlogPage({ onNavigate, onOpenBlog }: BlogPageProps) {
  const open = (event: MouseEvent<HTMLAnchorElement>, slug: string | null) => {
    event.preventDefault();
    onOpenBlog(slug);
  };

  return (
    <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/35 mb-4">
          <a href="/" onClick={(event) => { event.preventDefault(); onNavigate("home"); }} className="hover:text-[#D4A520]">Home</a>
          <span>/</span>
          <span className="text-white/60">Blog</span>
        </nav>
        <h1 className="section-heading text-4xl sm:text-5xl text-white mb-4">{BLOG_LISTING.h1}</h1>
        <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-3xl mb-10">{BLOG_LISTING.introduction}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARTICLES.map((article) => (
            <article key={article.slug} className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] flex flex-col">
              <a href={`/blog/${article.slug}`} onClick={(event) => open(event, article.slug)}>
                <img src={article.featuredImage} alt={article.featuredImageAlt} className="w-full aspect-square object-cover" />
              </a>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-[10px] font-display font-600 text-[#D4A520] tracking-[0.18em] uppercase mb-2">{article.category}</p>
                <h2 className="font-display font-700 text-white text-xl leading-snug mb-2">
                  <a href={`/blog/${article.slug}`} onClick={(event) => open(event, article.slug)} className="hover:text-[#D4A520]">
                    {article.title}
                  </a>
                </h2>
                <p className="text-white/55 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                <p className="text-white/35 text-xs mb-4">{formatBlogDate(article.datePublished)}</p>
                <a
                  href={`/blog/${article.slug}`}
                  onClick={(event) => open(event, article.slug)}
                  className="mt-auto text-[#D4A520] text-sm hover:underline"
                >
                  Read article
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
