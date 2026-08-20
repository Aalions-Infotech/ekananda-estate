import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, User, Calendar, Tag } from "lucide-react";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await (supabase.from("articles") as any)
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      setArticle(data);

      if (data) {
        const { data: rel } = await (supabase.from("articles") as any)
          .select("id, title, slug, excerpt, featured_image_url, category, read_time, published_at")
          .eq("status", "published")
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(3);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    if (slug) fetch();
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {article.featured_image_url && (
          <div className="max-w-5xl mx-auto px-4 pt-6">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>

          <span className="badge-verified mb-3 inline-block">{article.category}</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
            <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.author_name || "Admin"}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{article.published_at ? new Date(article.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "Draft"}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.read_time} min read</span>
          </div>

          <div
            className="article-content prose prose-base max-w-none dark:prose-invert prose-headings:font-display prose-a:text-accent prose-img:rounded-xl prose-blockquote:border-accent"
            dangerouslySetInnerHTML={{
              __html: /<\/?[a-z][\s\S]*>/i.test(article.content || "")
                ? article.content
                : (article.content || "").replace(/\n/g, "<br />"),
            }}
          />
        </div>

        {related.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
            <h2 className="text-2xl font-display font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(r => (
                <Link key={r.id} to={`/articles/${r.slug}`} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-md transition-all">
                  {r.featured_image_url && (
                    <div className="h-40 overflow-hidden">
                      <img src={r.featured_image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
