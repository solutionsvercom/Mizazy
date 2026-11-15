import { Product } from "../data";
import { useStore } from "../store";
import { formatBlogDate, getArticle } from "../blogPosts.js";

interface Part {
  text: string;
  href?: string;
}

interface BlogArticlePageProps {
  slug: string;
  onNavigate: (page: string) => void;
  onOpenBlog: (slug: string | null) => void;
  onViewProduct: (product: Product) => void;
  onOpenCategory: (name: string) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  earbuds: "Earbuds",
  neckband: "Neckband",
  "android-and-iphone-charger": "Android and iPhone Charger",
  "data-cable": "Data Cable",
};

function Rich({ parts, onOpen }: { parts: Part[]; onOpen: (href: string) => void }) {
  return (
    <>
      {parts.map((part, index) => part.href ? (
        <a key={index} href={part.href} onClick={(event) => { event.preventDefault(); onOpen(part.href!); }} className="text-[#D4A520] hover:underline">
          {part.text}
        </a>
      ) : (
        <span key={index}>{part.text}</span>
      ))}
    </>
  );
}

export default function BlogArticlePage({ slug, onNavigate, onOpenBlog, onViewProduct, onOpenCategory }: BlogArticlePageProps) {
  const { products } = useStore();
  const article = getArticle(slug);

  const open = (href: string) => {
    if (href === "/") {
      onNavigate("home");
      return;
    }
    if (href === "/blog") {
      onOpenBlog(null);
      return;
    }
    if (href.startsWith("/blog/")) {
      onOpenBlog(href.slice("/blog/".length));
      return;
    }
    if (href.startsWith("/product/")) {
      const key = href.slice("/product/".length);
      const product = products.find((item) => item.slug === key || item.id === key);
      if (product) onViewProduct(product);
      return;
    }
    if (href.startsWith("/category/")) {
      const key = href.slice("/category/".length);
      onOpenCategory(CATEGORY_NAMES[key] || key);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <h1 className="section-heading text-4xl text-white mb-4">Article not found</h1>
          <p className="text-white/60 text-sm sm:text-base mb-6">This Mizazy guide is not available.</p>
          <a href="/blog" onClick={(event) => { event.preventDefault(); onOpenBlog(null); }} className="text-[#D4A520] hover:underline">
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  const related = article.relatedArticles
    .map((item) => getArticle(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
      <article className="max-w-3xl mx-auto px-5 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/35 mb-4">
          <a href="/" onClick={(event) => { event.preventDefault(); open("/"); }} className="hover:text-[#D4A520]">Home</a>
          <span>/</span>
          <a href="/blog" onClick={(event) => { event.preventDefault(); open("/blog"); }} className="hover:text-[#D4A520]">Blog</a>
          <span>/</span>
          <span className="text-white/60">{article.h1}</span>
        </nav>
        <p className="mb-6">
          <a href="/blog" onClick={(event) => { event.preventDefault(); open("/blog"); }} className="text-white/40 hover:text-[#D4A520] text-sm">
            ← Back to Blog
          </a>
        </p>
        <p className="text-[10px] font-display font-600 text-[#D4A520] tracking-[0.18em] uppercase mb-3">{article.category}</p>
        <h1 className="section-heading text-3xl sm:text-5xl text-white mb-4">{article.h1}</h1>
        <p className="text-white/45 text-sm mb-6">By {article.author} · {formatBlogDate(article.datePublished)}</p>
        <img src={article.featuredImage} alt={article.featuredImageAlt} className="w-full rounded-2xl mb-8 object-cover max-h-[28rem]" />
        <div className="space-y-4 text-white/70 text-sm sm:text-base leading-relaxed mb-8">
          {article.introduction.map((paragraph, index) => (
            <p key={index}><Rich parts={paragraph} onOpen={open} /></p>
          ))}
        </div>
        <nav aria-label="On this page" className="mb-10 border border-white/10 rounded-2xl p-5">
          <h2 className="font-display font-700 text-white text-lg mb-3">On this page</h2>
          <ol className="space-y-2 text-sm list-decimal pl-5">
            {article.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-[#D4A520] hover:underline">{section.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-10">
          {article.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="font-display font-700 text-white text-2xl mb-3">{section.heading}</h2>
              <div className="space-y-4 text-white/70 text-sm sm:text-base leading-relaxed">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}><Rich parts={paragraph} onOpen={open} /></p>
                ))}
                {section.list && (
                  <ul className="list-disc pl-5 space-y-2">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
        {article.faqs.length > 0 && (
          <section className="mt-12 border-t border-white/10 pt-8">
            <h2 className="font-display font-700 text-white text-2xl mb-4">Questions</h2>
            <div className="space-y-5">
              {article.faqs.map((item) => (
                <div key={item.question}>
                  <h3 className="text-white font-display font-600 text-base mb-1">{item.question}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        <aside className="mt-12 border-t border-white/10 pt-8 space-y-6">
          {related.length > 0 && (
            <section>
              <h2 className="font-display font-700 text-white text-xl mb-3">Related guides</h2>
              <ul className="space-y-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <a href={`/blog/${item.slug}`} onClick={(event) => { event.preventDefault(); open(`/blog/${item.slug}`); }} className="text-[#D4A520] hover:underline">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="font-display font-700 text-white text-xl mb-3">Products</h2>
            <ul className="space-y-2">
              {article.relatedProducts.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={(event) => { event.preventDefault(); open(item.href); }} className="text-[#D4A520] hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display font-700 text-white text-xl mb-3">Categories</h2>
            <ul className="space-y-2">
              {article.relatedCategories.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={(event) => { event.preventDefault(); open(item.href); }} className="text-[#D4A520] hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </article>
    </div>
  );
}
