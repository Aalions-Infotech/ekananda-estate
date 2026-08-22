import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft, Clock, User, Calendar, Tag, List, ChevronDown, Check,
  Share2, Facebook, Twitter, Linkedin, Link2, MessageCircle, Languages, Printer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatArea } from "@/lib/propertyDisplay";

interface Heading { id: string; text: string; level: number }

const slugifyHeading = (text: string, i: number) =>
  `sec-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40)}`;

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await (supabase.from("articles") as any)
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      setArticle(data);

      if (data) {
        const { data: rel } = await (supabase.from("articles") as any)
          .select("id, title, slug, excerpt, featured_image_url, category, read_time, published_at")
          .eq("status", "published")
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(4);
        setRelated(rel || []);

        const ids: string[] = data.featured_property_ids || [];
        if (ids.length) {
          const { data: props } = await (supabase.from("property_listings") as any)
            .select("*")
            .in("id", ids)
            .limit(6);
          setProperties(props || []);
        } else {
          setProperties([]);
        }

        (supabase.from("articles") as any)
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id)
          .then(() => {});
      }
      setLoading(false);
    };
    if (slug) load();
  }, [slug]);

  // Render content with heading anchors for the table of contents
  const { html, headings } = useMemo(() => {
    const raw = article?.content || "";
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
    let out = isHtml ? raw : raw.replace(/\n/g, "<br />");
    const found: Heading[] = [];
    let i = 0;
    out = out.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_m: string, tag: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]*>/g, "").trim();
      if (!text) return _m;
      const id = slugifyHeading(text, i++);
      found.push({ id, text, level: tag.toLowerCase() === "h2" ? 2 : 3 });
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    });
    return { html: out, headings: found };
  }, [article?.content]);

  // Reading progress + scroll spy
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (el) {
        const start = el.offsetTop - 120;
        const total = el.offsetHeight;
        const p = Math.min(100, Math.max(0, ((window.scrollY - start) / total) * 100));
        setProgress(p);
      }
      let current = "";
      headings.forEach(h => {
        const node = document.getElementById(h.id);
        if (node && node.getBoundingClientRect().top <= 140) current = h.id;
      });
      setActiveId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings, html]);

  // SEO tags + structured data
  useEffect(() => {
    if (!article) return;
    document.title = (article.seo_title || article.title).slice(0, 60);
    const setMeta = (attr: string, key: string, content: string) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, key); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    const desc = (article.seo_description || article.excerpt || "").slice(0, 160);
    setMeta("name", "description", desc);
    setMeta("property", "og:title", article.seo_title || article.title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "article");
    setMeta("name", "twitter:card", "summary_large_image");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.href;

    const faqs = (article.faqs || []) as { question: string; answer: string }[];
    const ld: any[] = [{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: desc,
      image: article.featured_image_url || undefined,
      datePublished: article.published_at,
      dateModified: article.updated_at,
      author: { "@type": "Person", name: article.author_name || "Ekananda Estate" },
    }];
    if (faqs.length) {
      ld.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [article]);

  const share = (network: string) => {
    const url = window.location.href;
    const title = article?.title || "";
    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    };
    if (network === "copy") {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
      return;
    }
    window.open(links[network], "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-display font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">This article doesn't exist or has been removed.</p>
          <Link to="/news" className="btn-gold px-6 py-2 rounded-xl text-sm">Browse Articles</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const takeaways: string[] = (article.key_takeaways || []).filter(Boolean);
  const faqs: { question: string; answer: string }[] = (article.faqs || []).filter((f: any) => f?.question);
  const tags: string[] = article.tags || [];
  const showToc = article.show_toc !== false && headings.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Reading progress */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-transparent z-40">
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="pt-16">
        {/* Hero */}
        <div className="max-w-6xl mx-auto px-4 pt-6">
          {article.featured_image_url && (
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-4">
            <span className="badge-verified">{article.category}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Updated: {new Date(article.updated_at || article.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.read_time} min read</span>
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{article.author_name || "Ekananda Estate"}</span>
            <Link to="/news" className="ml-auto inline-flex items-center gap-1 hover:text-accent"><ArrowLeft className="w-3.5 h-3.5" /> All Articles</Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">{article.title}</h1>

            {article.hindi_slug && (
              <Link to={`/articles/${article.hindi_slug}`} className="inline-flex items-center gap-2 text-sm text-accent border border-accent/30 bg-accent/5 rounded-xl px-3 py-1.5 mb-6">
                <Languages className="w-4 h-4" /> हिंदी में पढ़ें
              </Link>
            )}

            {/* Share row */}
            <div className="flex items-center gap-2 mb-8 pb-6 border-b border-border">
              <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1"><Share2 className="w-3.5 h-3.5" /> Share</span>
              {[
                { k: "whatsapp", icon: MessageCircle },
                { k: "facebook", icon: Facebook },
                { k: "twitter", icon: Twitter },
                { k: "linkedin", icon: Linkedin },
                { k: "copy", icon: Link2 },
              ].map(({ k, icon: Icon }) => (
                <button key={k} onClick={() => share(k)} title={`Share on ${k}`} className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-accent transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <button onClick={() => window.print()} title="Print" className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-accent transition-colors">
                <Printer className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile TOC */}
            {showToc && (
              <div className="lg:hidden mb-6 border border-border rounded-2xl bg-card">
                <button onClick={() => setTocOpen(!tocOpen)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold">
                  <span className="flex items-center gap-2"><List className="w-4 h-4 text-accent" /> Table of Contents</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? "rotate-180" : ""}`} />
                </button>
                {tocOpen && (
                  <ul className="px-4 pb-4 space-y-2">
                    {headings.map(h => (
                      <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                        <a href={`#${h.id}`} onClick={() => setTocOpen(false)} className="text-sm text-muted-foreground hover:text-accent">{h.text}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Key takeaways */}
            {takeaways.length > 0 && (
              <div className="mb-8 rounded-2xl border border-accent/30 bg-accent/5 p-5">
                <h2 className="font-display font-bold text-lg mb-3">Key Takeaways</h2>
                <ul className="space-y-2">
                  {takeaways.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              ref={contentRef}
              className="article-content prose prose-base max-w-none dark:prose-invert prose-headings:font-display prose-headings:scroll-mt-28 prose-a:text-accent prose-img:rounded-xl prose-blockquote:border-accent"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">
                    <Tag className="w-3 h-3" />{t}
                  </span>
                ))}
              </div>
            )}

            {/* Featured properties in article */}
            {properties.length > 0 && (
              <div className="mt-10 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display font-bold text-lg">
                      {article.related_locality ? `Properties in ${article.related_locality}` : "Handpicked Properties"}
                    </h2>
                    <p className="text-xs text-muted-foreground">{properties.length} propert{properties.length === 1 ? "y" : "ies"} available · Lucknow</p>
                  </div>
                  <Link to="/buy" className="text-xs text-accent font-medium">View All</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {properties.map(p => (
                    <Link key={p.id} to={`/property/${p.id}`} className="flex gap-3 rounded-xl border border-border p-3 hover:shadow-md transition-all group">
                      {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-24 h-20 rounded-lg object-cover flex-shrink-0" />}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-accent transition-colors">{p.title}</h3>
                        <p className="text-sm text-accent font-bold mt-0.5">{formatPrice(p.price)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {formatArea(p.area, p.area_unit)} · {p.locality || p.city}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {(article.cta_title || article.cta_text) && (
              <div className="mt-10 rounded-2xl bg-gradient-navy p-6 text-white">
                <h2 className="font-display font-bold text-xl mb-2">{article.cta_title || "Talk to a Lucknow property expert"}</h2>
                {article.cta_text && <p className="text-sm text-white/80 mb-4">{article.cta_text}</p>}
                <a
                  href={article.cta_button_url || "/#enquiry"}
                  className="btn-gold inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  {article.cta_button_label || "Get Property Details"}
                </a>
              </div>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display font-bold text-2xl mb-4">Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {faqs.map((f, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold">
                        {f.question}
                        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === i && <p className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line">{f.answer}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author box */}
            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-display font-bold">
                {(article.author_name || "E")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{article.author_name || "Ekananda Estate"}</p>
                <p className="text-xs text-muted-foreground">Lucknow real estate research desk · ekanandaestate@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Sticky sidebar TOC */}
          {showToc && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 max-h-[70vh] overflow-y-auto">
                <p className="flex items-center gap-2 text-sm font-display font-bold mb-3"><List className="w-4 h-4 text-accent" /> Table of Contents</p>
                <ul className="space-y-2 border-l border-border">
                  {headings.map(h => (
                    <li key={h.id} className={h.level === 3 ? "pl-6" : "pl-3"}>
                      <a
                        href={`#${h.id}`}
                        className={`block text-xs leading-snug border-l-2 -ml-[13px] pl-3 transition-colors ${
                          activeId === h.id ? "border-accent text-accent font-medium" : "border-transparent text-muted-foreground hover:text-accent"
                        }`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
            <p className="text-xs font-bold tracking-widest text-accent mb-1">KEEP READING</p>
            <h2 className="text-2xl font-display font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(r => (
                <Link key={r.id} to={`/articles/${r.slug}`} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-md transition-all">
                  {r.featured_image_url && (
                    <div className="h-40 overflow-hidden">
                      <img src={r.featured_image_url} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-xs font-medium text-accent">{r.category}</span>
                    <h3 className="font-display font-semibold text-sm mt-1 line-clamp-2 group-hover:text-accent transition-colors">{r.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2">{r.read_time} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
