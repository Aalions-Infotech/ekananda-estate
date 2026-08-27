import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, TrendingUp, MapPin, Star, Shield, Zap, 
  Building2, Home, DollarSign, Users, ChevronRight,
  PlayCircle, Award, CheckCircle, ChevronLeft, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-bg.jpg";
import prop1 from "@/assets/property1.jpg";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecentlyViewed from "@/components/RecentlyViewed";
import LeadForm from "@/components/LeadForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatPrice, cities } from "@/data/properties";
import { getPricePerSqft } from "@/lib/propertyDisplay";

const PLAN_PRIORITY: Record<string, number> = {
  premium_showcase: 1,
  premium: 1,
  standard_spotlight: 2,
  standard: 2,
  basic_boost: 3,
  basic: 3,
};

const Index = () => {
  const [activeCityTab, setActiveCityTab] = useState("Gomti Nagar");
  const [dbProperties, setDbProperties] = useState<any[]>([]);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [priceTrends, setPriceTrends] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [stats, setStats] = useState([
    { value: "10K+", label: "Properties in Lucknow" },
    { value: "500+", label: "Verified Local Agents" },
    { value: "50+", label: "Lucknow Localities" },
    { value: "4.8★", label: "Avg. Rating" },
  ]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "hero_stats").maybeSingle();
      const items = (data?.value as any)?.items;
      if (Array.isArray(items) && items.length) setStats(items.slice(0, 4));
    })();
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("lead_popup_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShowLeadPopup(true), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      const [propRes, sponsorRes, articlesRes] = await Promise.all([
        supabase.from("property_listings").select("*").eq("status", "approved").order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(30),
        supabase.from("sponsorships").select("*, property_listings(id)").eq("status", "active").eq("payment_status", "completed"),
        (supabase.from("articles") as any).select("id, title, slug, excerpt, featured_image_url, category, read_time, published_at, author_name").eq("status", "published").order("published_at", { ascending: false }).limit(3),
      ]);
      
      const props = propRes.data || [];
      const sponsors = sponsorRes.data || [];
      setSponsorships(sponsors);
      setArticles(articlesRes.data || []);

      // Sort properties: sponsored first (by tier), then non-sponsored
      const sponsorMap = new Map<string, string>();
      sponsors.forEach((s: any) => {
        if (s.listing_id && s.plan_name) sponsorMap.set(s.listing_id, s.plan_name);
      });

      const sorted = [...props].sort((a, b) => {
        const aPlan = sponsorMap.get(a.id);
        const bPlan = sponsorMap.get(b.id);
        const aPri = aPlan ? (PLAN_PRIORITY[aPlan.toLowerCase().replace(/\s+/g, '_')] || 3) : 99;
        const bPri = bPlan ? (PLAN_PRIORITY[bPlan.toLowerCase().replace(/\s+/g, '_')] || 3) : 99;
        if (aPri !== bPri) return aPri - bPri;
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setDbProperties(sorted);
      setLoadingProps(false);

      // Fetch price trends
      try {
        const { data: trendsData } = await supabase.functions.invoke("market-trends");
        if (trendsData?.trends) setPriceTrends(trendsData.trends);
      } catch { /* silently fail, no hardcoded fallback */ }
    };
    fetchAll();
  }, []);

  const mapDbProp = (p: any) => ({
    id: p.id,
    title: p.title,
    type: p.listing_type as any,
    category: p.property_type,
    price: Number(p.price),
    priceUnit: p.price_unit === "monthly" ? "monthly" as const : "total" as const,
    area: Number(p.area) || 0,
    areaUnit: p.area_unit || "sq.ft",
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    floor: p.floor,
    totalFloors: p.total_floors,
    city: p.city,
    locality: p.locality,
    address: p.address || "",
    image: p.images?.[0] || prop1,
    images: p.images || [prop1],
    amenities: p.amenities || [],
    furnishing: p.furnishing || "Unfurnished",
    status: "Ready to Move" as const,
    postedBy: "Owner" as const,
    postedDate: new Date(p.created_at).toLocaleDateString("en-IN"),
    verified: p.is_verified || false,
    featured: p.is_featured || false,
    isNew: p.is_new || false,
    description: p.description || "",
    facing: p.facing || "",
    parking: p.parking || 0,
    ageOfProperty: p.age_of_property || "",
    societyName: p.society_name,
    builderName: p.builder_name,
    reraId: p.rera_id,
    nearbyPlaces: [],
    pricePerSqft: getPricePerSqft(p),
  });

  const allProperties = dbProperties.map(mapDbProp);
  // IMPORTANT: Home page must show only real DB listings.
  // The DB returns already approved listings, but we still filter defensively here.
  const sponsoredProps = allProperties
    .filter(p => p.featured)
    .filter(p => p.id)
    .slice(0, 8);

  const buyProps = sponsoredProps.length > 0
    ? sponsoredProps
    : allProperties.filter(p => (p.type === "buy" || p.type === "sell") && p.id).slice(0, 8);

  const rentProps = allProperties.filter(p => (p.type === "rent" || p.type === "rent_lease" || p.type === "pg") && p.id).slice(0, 8);



  const quickCategories = [
    { label: "Residentials", icon: "🏠", to: "/buy", color: "from-blue-500/10 to-blue-600/5" },
    { label: "Rent/Lease", icon: "🔑", to: "/rent", color: "from-emerald-500/10 to-emerald-600/5" },
    { label: "New Projects", icon: "🏗️", to: "/new-projects", color: "from-orange-500/10 to-orange-600/5" },
    { label: "Commercials", icon: "💼", to: "/commercial", color: "from-purple-500/10 to-purple-600/5" },
    { label: "Plots/Land", icon: "🌍", to: "/buy?type=plot", color: "from-green-500/10 to-green-600/5" },
    { label: "PG / Co-Living", icon: "🛋️", to: "/pg", color: "from-pink-500/10 to-pink-600/5" },
    { label: "Home Loans", icon: "🏦", to: "/home-loans", color: "from-yellow-500/10 to-yellow-600/5" },
    { label: "Find Agents", icon: "👤", to: "/agents", color: "from-red-500/10 to-red-600/5" },
  ];

  const whyUs = [
    { icon: Shield, title: "100% Verified Listings", desc: " Every property goes through a strict multi-step verification process to ensure authenticity and trust." },
    { icon: Zap, title: "Instant Connect", desc: " Directly connect with property owners and agents without unnecessary delays or hidden charges." },
    { icon: Award, title: "RERA Compliant", desc: " All properties are legally approved and verified for safe and secure investment." },
    { icon: TrendingUp, title: "Market Insights", desc: " Get real-time updates on property prices, trends, and prime locations in Lucknow." },
    { icon: Users, title: "Trusted Network", desc: " Work with a reliable network of verified agents and property experts." },
    { icon: CheckCircle, title: "End-to-End Support", desc: " From property search to final registration, we assist you at every step." },
  ];

  const trendCities = priceTrends.length > 0 ? priceTrends.map(t => t.city) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] sm:min-h-[88vh] flex items-center overflow-hidden py-10 sm:py-16">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Real Estate" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-6">
          <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
            <p className="section-label mb-3 text-[10px] sm:text-xs">Buy, Sell & Rent Property in Lucknow – Ekananda Estate  </p>
            <h1 className="text-[26px] leading-[1.15] sm:text-5xl md:text-6xl font-display font-bold text-white mb-3 sm:mb-4">
              Find Your Perfect<br />
              <span className="text-gold">Place to Live</span>
            </h1>
            <p className="text-sm sm:text-lg text-white/70 mb-6 sm:mb-8 px-2">
               Find flats, houses & plots for sale in Lucknow. Ekananda Estate helps you buy, sell & rent property with ease. Search listings now.  
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <SearchBar variant="hero" />
          </div>
          <div className="max-w-4xl mx-auto mt-4 hidden sm:flex flex-wrap gap-2">
            <span className="text-white/50 text-xs">Popular:</span>
            {["2BHK in Gomti Nagar", "Flats in Hazratganj", "Villas in Sushant Golf City", "Office in Vibhuti Khand", "Plots on Sultanpur Road"].map(s => (
              <button key={s} className="glass px-3 py-1 rounded-full text-xs text-white/80 hover:text-white transition-all">{s}</button>
            ))}
          </div>
          <div className="max-w-2xl mx-auto mt-6 sm:mt-12 glass rounded-2xl p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center py-2 sm:hero-stat">
                  <p className="text-lg sm:text-2xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="max-w-2xl mx-auto mt-5 sm:mt-6 flex justify-center px-2">
            <button
              onClick={() => setShowLeadPopup(true)}
              className="btn-gold w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base inline-flex items-center justify-center gap-2 font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              Get Property Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <ChevronRight className="w-6 h-6 text-white/50 rotate-90" />
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="section-label mb-2">ALL PROPERTY NEEDS · ONE PORTAL</p>
            <h2 className="text-3xl font-display font-bold">Explore Property in Lucknow</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
            {quickCategories.map((cat) => (
              <Link key={cat.label} to={cat.to} className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${cat.color} border border-border hover:shadow-md transition-all text-center group hover:-translate-y-1`}>
                <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-foreground leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Sponsored Properties */}
      <section className="py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">Buy A Property</p>
              <h2 className="text-3xl font-display font-bold">Buy the Right Property in Lucknow </h2>
              <p className="text-muted-foreground mt-1 text-sm">Search, Buy & Own Flats, Houses & Plots in Lucknow with Ekananda Estate</p>
            </div>
            <Link to="/buy" className="hidden md:flex items-center gap-1 text-accent font-medium text-sm hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingProps ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : buyProps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {buyProps.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No properties available yet. Check back soon!</p>
            </div>
          )}
          <div className="mt-6 text-center md:hidden">
            <Link to="/buy" className="inline-flex items-center gap-1 text-accent font-medium text-sm">
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Rent Properties */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">RENT A HOME</p>
              <h2 className="text-3xl font-display font-bold">Rent Property in Lucknow Today</h2>
              <p className="text-muted-foreground mt-1 text-sm">Verified rentals, direct from owners, Lucknow</p>
            </div>
            <Link to="/rent" className="hidden md:flex items-center gap-1 text-accent font-medium text-sm hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {rentProps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rentProps.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No rental properties yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Price Trends - Dynamic */}
      <section className="py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">PROPERTY INSIGHTS</p>
              <h2 className="text-3xl font-display font-bold">  Lucknow Property Price Trends</h2>
              <p className="text-muted-foreground mt-1 text-sm">Track property price changes in Lucknow localities</p>
            </div>
            <Link to="/price-trends" className="hidden md:flex items-center gap-1 text-accent font-medium text-sm hover:gap-2 transition-all">
              Full Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {priceTrends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {priceTrends.slice(0, 8).map((t) => (
                <Link key={t.city} to="/price-trends" className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-sm">{t.city}</h3>
                      <p className="text-xs text-muted-foreground">Avg. price/sqft</p>
                    </div>
                    <span className={t.trend === "up" ? "price-trend-up text-sm" : t.trend === "down" ? "price-trend-down text-sm" : "text-muted-foreground text-sm"}>
                      {t.yoy_change !== null ? `${t.trend === "up" ? "↑" : t.trend === "down" ? "↓" : ""} ${Math.abs(t.yoy_change)}%` : "N/A"}
                    </span>
                  </div>
                  <p className="text-2xl font-display font-bold text-accent mb-1">₹{Number(t.avg_price_sqft).toLocaleString("en-IN")}</p>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-gold rounded-full" style={{ width: `${Math.min((t.avg_price_sqft / 30000) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.yoy_change !== null ? `YoY Change: ${t.yoy_change > 0 ? "+" : ""}${t.yoy_change}%` : "YoY: N/A"}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Price trend data will appear once there are approved listings with valid pricing.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 bg-gradient-navy text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-gold text-xs font-bold tracking-widest mb-2"> Why Ekananda Estate</p>
            <h2 className="text-3xl font-display font-bold text-white mb-3"> Your Property in Lucknow, Our Responsibility</h2>
            <p className="text-white/60 text-sm max-w-xl mx-auto">End-to-end support for a smooth property deals.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base mb-1">{title}</h3>
                  <p className="text-sm text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Articles - Dynamic */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">INSIGHTS & NEWS</p>
              <h2 className="text-3xl font-display font-bold">Lucknow Real Estate Articles</h2>
              <p className="text-muted-foreground mt-1 text-sm">Market updates and guides for Lucknow buyers</p>
            </div>
            <Link to="/news" className="hidden md:flex items-center gap-1 text-accent font-medium text-sm hover:gap-2 transition-all">
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <Link key={article.id} to={`/articles/${article.slug}`} className="bg-card rounded-2xl border border-border shadow-card property-card-hover overflow-hidden group">
                  {article.featured_image_url && (
                    <div className="relative h-44 overflow-hidden">
                      <img src={article.featured_image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 left-3">
                        <span className="badge-verified">{article.category}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-sm mb-2 line-clamp-2 hover:text-accent transition-colors">{article.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("en-IN") : ""}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.read_time} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Articles will appear here once published by the admin.</p>
            </div>
          )}
        </div>
      </section>

      {/* Post Property CTA */}
      <section className="py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-gold rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-10 w-40 h-40 rounded-full border-4 border-current" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full border-4 border-current" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold uppercase tracking-widest mb-3 text-foreground/70">FOR PROPERTY OWNERS</p>
              <h2 className="text-4xl font-display font-bold text-foreground mb-3">Post Your Property in Lucknow for<span className="underline decoration-wavy">FREE</span></h2>
              <p className="text-foreground/70 mb-8 max-w-lg mx-auto">Reach thousands of buyers and tenants in Lucknow. Post in minutes, zero brokerage</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/post-property" className="btn-navy px-8 py-3 rounded-xl text-base inline-flex items-center gap-2 justify-center">
                  Post Property FREE <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={() => setShowLeadPopup(true)} className="px-8 py-3 rounded-xl border-2 border-foreground/30 text-foreground font-semibold text-base inline-flex items-center gap-2 justify-center hover:bg-foreground/10 transition-all">
                  Get Property Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="section-label mb-2">EXPLORE BY CITY</p>
            <h2 className="text-3xl font-display font-bold">Properties in Top Lucknow Areas</h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {cities.map(city => (
              <Link key={city} to={`/buy?city=${encodeURIComponent(city)}`} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card hover:border-accent hover:text-accent transition-all text-sm">
                <MapPin className="w-3.5 h-3.5" />{city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewed />
      <Footer />

      <Dialog open={showLeadPopup} onOpenChange={(open) => {
        setShowLeadPopup(open);
        if (!open) sessionStorage.setItem("lead_popup_dismissed", "true");
      }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Enquiry Form</DialogTitle>
          <LeadForm title="Looking for a Property? Let Us Help!" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
