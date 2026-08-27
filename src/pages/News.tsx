import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Search, Clock } from "lucide-react";

const News = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Market News", "Investment Guide", "Legal", "Interior Design", "Tax & Policy", "Buyer Guide", "Industry Update"];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await (supabase.from("articles") as any)
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setArticles(data || []);
      setLoading(false);
    };
    fetch();

    // Realtime subscription
    const channel = supabase.channel("articles-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => { fetch(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = articles.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = !searchQuery || [a.title, a.excerpt, a.category].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-navy py-10">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-gold text-xs font-bold tracking-widest mb-2">INSIGHTS</p>
            <h1 className="text-4xl font-display font-bold text-white mb-4">Lucknow Real Estate News & Articles</h1>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search articles..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm outline-none focus:bg-white/20" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`filter-chip flex-shrink-0 ${activeCategory === c ? "active" : ""}`}>{c}</button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No articles found. Check back later or try a different category.</p>
            </div>
          ) : (
            <>
              {/* Featured article */}
              {activeCategory === "All" && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Link to={`/articles/${filtered[0].slug}`} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden group cursor-pointer">
                    {filtered[0].featured_image_url && (
                      <div className="relative h-64">
                        <img src={filtered[0].featured_image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-3 left-3"><span className="badge-featured">{filtered[0].category}</span></div>
                      </div>
                    )}
                    <div className="p-5">
                      <h2 className="font-display font-bold text-xl mb-2">{filtered[0].title}</h2>
                      <p className="text-sm text-muted-foreground mb-3">{filtered[0].excerpt}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{filtered[0].published_at ? new Date(filtered[0].published_at).toLocaleDateString("en-IN") : ""}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{filtered[0].read_time} min</span>
                      </div>
                    </div>
                  </Link>
                  <div className="space-y-4">
                    {filtered.slice(1, 4).map(a => (
                      <Link key={a.id} to={`/articles/${a.slug}`} className="flex gap-4 bg-card rounded-2xl border border-border p-4 cursor-pointer hover:shadow-md transition-all group">
                        {a.featured_image_url && <img src={a.featured_image_url} alt="" className="w-24 h-20 object-cover rounded-xl flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <span className="badge-new mb-1 inline-block">{a.category}</span>
                          <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">{a.title}</h3>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                            <span>{a.published_at ? new Date(a.published_at).toLocaleDateString("en-IN") : ""}</span>
                            <span>{a.read_time} min</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* All articles grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeCategory === "All" ? filtered.slice(4) : filtered).map(a => (
                  <Link key={a.id} to={`/articles/${a.slug}`} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden group cursor-pointer property-card-hover">
                    {a.featured_image_url && (
                      <div className="relative h-44 overflow-hidden">
                        <img src={a.featured_image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-3 left-3"><span className="badge-verified">{a.category}</span></div>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-sm mb-2 line-clamp-2 group-hover:text-accent transition-colors">{a.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{a.excerpt}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{a.author_name || "Admin"}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.read_time} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default News;
